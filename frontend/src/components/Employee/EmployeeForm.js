"use client";
import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { getToken } from "@/utils/auth";
import OrganizationForm from "../Organization/OrganizationForm";

export default function EmployeeForm({
  show,
  onHide,
  fetchEmployees,
  editEmployee,
  departments,
  academicYear,
  userRole,
}) {
  const [aqarAccess, setAqarAccess] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    role: "",
    phoneNumber: "",
    dateOfJoining: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const roles = [
    "Principal",
    "Faculty",
    "Teacher",
    // "Management Staff",
    // "Accountant",
    // "Clerk",
    // "Parents",
    // "Students"
  ];

  useEffect(() => {
    if (editEmployee) {
      setFormData({
        name: editEmployee.name || "",
        email: editEmployee.email || "",
        department: editEmployee.department || "",

        designation: editEmployee.designation || "",
        role: editEmployee.role || "",
        phoneNumber: editEmployee.phoneNumber || "",
        dateOfJoining: editEmployee.dateOfJoining
          ? new Date(editEmployee.dateOfJoining).toISOString().split("T")[0]
          : "",
        password: "", // Do not pre-fill password for security
      });
      setOrganizationId(editEmployee.organizationId || "");
    } else {
      setFormData({
        name: "",
        email: "",
        department: "",
        designation: "",
        role: "",
        phoneNumber: "",
        dateOfJoining: "",
        password: "",
      });
      setOrganizationId("");
    }
  }, [editEmployee]);

  useEffect(() => {
    if (!show || userRole !== "SuperAdmin") return;

    const fetchOrganizations = async () => {
      try {
        const res = await axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations`, {
        headers: { "x-auth-token": getToken() },
          });
        setOrganizations(res.data.data || []);
      } catch {
        setOrganizations([]);
      }
    };

    fetchOrganizations();
  }, [show, userRole]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (
      !formData.department &&
      formData.role &&
      ["Teacher", "Accountant", "Clerk"].includes(formData.role)
    )
      newErrors.department = "Department is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!editEmployee && userRole === "SuperAdmin" && !organizationId)
      newErrors.organizationId = "Organization is required";
    if (!editEmployee && !formData.password)
      newErrors.password = "Password is required for new employee";
    else if (!editEmployee && formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Phone Number must be 10 digits";
    if (
      formData.role &&
      ["Principal", "Teacher", "Accountant", "Clerk"].includes(formData.role) &&
      !formData.designation
    )
      newErrors.designation = "Designation is required";
    if (
      formData.role &&
      ["Principal", "Teacher", "Accountant", "Clerk"].includes(formData.role) &&
      !formData.dateOfJoining
    )
      newErrors.dateOfJoining = "Date of Joining is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = {
        name: formData.name,
        email: formData.email,
        department: formData.department || undefined,
        designation: formData.designation || undefined,
        role: formData.role,
        phoneNumber: formData.phoneNumber || undefined,
        dateOfJoining: formData.dateOfJoining || undefined,
        password: formData.password || undefined, // Omit password if not provided during edit
        academicYear: academicYear,
        aqarAccess: true,
        organizationId: organizationId || undefined,
      };

      if (editEmployee) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/${editEmployee._id}`,
          data,
          {
            headers: {
              "x-auth-token": getToken(),
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/employees`,
          data,
          {
            headers: {
              "x-auth-token": getToken(),
              "Content-Type": "application/json",
            },
          }
        );
      }
      setFormData({
        name: "",
        email: "",
        department: "",
        designation: "",
        role: "",
        phoneNumber: "",
        dateOfJoining: "",
        password: "",
      });
      
      fetchEmployees();
      onHide();
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || "Failed to save employee",
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header
        style={{
          backgroundColor: "#1A3159",
          color: "#FFFFFF",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Modal.Title>
          {editEmployee ? "Edit Employee" : "Add Employee"}
        </Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          style={{ color: "#FFFFFF", textDecoration: "none" }}
        >
          <i className="bi bi-x-lg"></i>
        </Button>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#FFFFFF" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Name
            </label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Dr. John Doe"
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Email
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., john.doe@university.edu"
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Password
            </label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                editEmployee
                  ? "Leave blank to keep unchanged"
                  : "At least 8 characters"
              }
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Department
            </label>
            <select
              className={`form-select ${errors.department ? "is-invalid" : ""}`}
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <div className="invalid-feedback">{errors.department}</div>
            )}
          </div>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Role
            </label>
            <select
              className={`form-select ${errors.role ? "is-invalid" : ""}`}
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && (
              <div className="invalid-feedback">{errors.role}</div>
            )}
          </div>

          {userRole === "SuperAdmin" && !editEmployee && (
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "#1A3159", fontWeight: "500" }}
              >
                Organization
              </label>
              <select
                className={`form-select ${errors.organizationId ? "is-invalid" : ""}`}
                value={organizationId}
                onChange={(e) => {
                  setOrganizationId(e.target.value);
                  setErrors({ ...errors, organizationId: "" });
                }}
                style={{ borderColor: "#1A3159", borderRadius: "8px" }}
              >
                <option value="">Select organization</option>
                {organizations.map((organization) => (
                  <option key={organization._id} value={organization._id}>
                    {organization.name}
                  </option>
                ))}
              </select>
              {organizations.length === 0 && (
                <div className="mt-2">
                  <div className="text-muted mb-2">
                    No organizations found. Create one before adding an employee.
                  </div>
                  <Button
                    type="button"
                    variant="outline-primary"
                    onClick={() => setShowOrganizationForm(true)}
                  >
                    Create organization
                  </Button>
                </div>
              )}
              {errors.organizationId && (
                <div className="invalid-feedback">{errors.organizationId}</div>
              )}
            </div>
          )}

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Designation
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.designation ? "is-invalid" : ""
              }`}
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g., Professor"
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            />
            {errors.designation && (
              <div className="invalid-feedback">{errors.designation}</div>
            )}
          </div>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              className={`form-control ${
                errors.phoneNumber ? "is-invalid" : ""
              }`}
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g., 9876543210"
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            />
            {errors.phoneNumber && (
              <div className="invalid-feedback">{errors.phoneNumber}</div>
            )}
          </div>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#1A3159", fontWeight: "500" }}
            >
              Date of Joining
            </label>
            <input
              type="date"
              className={`form-control ${
                errors.dateOfJoining ? "is-invalid" : ""
              }`}
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              style={{ borderColor: "#1A3159", borderRadius: "8px" }}
            />
            {errors.dateOfJoining && (
              <div className="invalid-feedback">{errors.dateOfJoining}</div>
            )}
          </div>

          {errors.submit && (
            <div className="alert alert-danger" role="alert">
              {errors.submit}
            </div>
          )}
          <div className="text-end">
            <Button
              variant="secondary"
              onClick={onHide}
              style={{
                backgroundColor: "#6C757D",
                border: "none",
                borderRadius: "8px",
                marginRight: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "#EF7E20",
                border: "2px solid #FF9B50",
                borderRadius: "8px",
                fontWeight: "600",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#FF9B50";
                e.target.style.borderColor = "#EF7E20";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#EF7E20";
                e.target.style.borderColor = "#FF9B50";
              }}
            >
              {editEmployee ? "Update Employee" : "Add Employee"}
            </Button>
          </div>
        </form>
      </Modal.Body>
      <OrganizationForm
        show={showOrganizationForm}
        onHide={() => setShowOrganizationForm(false)}
        fetchData={async () => {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations`,
            { headers: { "x-auth-token": getToken() } }
          );
          const nextOrganizations = res.data.data || [];
          setOrganizations(nextOrganizations);
          if (nextOrganizations.length === 1) {
            setOrganizationId(nextOrganizations[0]._id);
          }
        }}
      />
    </Modal>
  );
}
