 
"use client";
import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken } from "@/utils/auth";

export default function ClassForm({ show, onHide, fetchClasses, editClass, userRole }) {
  const [formData, setFormData] = useState({
    name: "",
    academicYear: "2025 - 2026",
    teacherId: "",
  });
  const [teachers, setTeachers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (editClass) {
      setFormData({
        name: editClass.name || "",
        academicYear: editClass.academicYear || "2025 - 2026",
        teacherId: editClass.teacherId || "",
      });
    } else {
      setFormData({
        name: "",
        academicYear: "2025 - 2026",
        teacherId: "",
      });
    }
  }, [editClass]);

  useEffect(() => {
    setOrganizationId(editClass?.organizationId?._id || editClass?.organizationId || "");
  }, [editClass]);

  useEffect(() => {
    if (!show || userRole !== "SuperAdmin") return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations`, {
        headers: { "x-auth-token": getToken() },
      })
      .then((res) => setOrganizations(res.data.data || []))
      .catch(() => setOrganizations([]));
  }, [show, userRole]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers`,
          { headers: { "x-auth-token": getToken() } }
        );
        setTeachers(res.data.data.teachers || []);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.name) {
      setError("Class name is required.");
      return false;
    }
    if (!formData.academicYear) {
      setError("Academic year is required.");
      return false;
    }
    if (!editClass && userRole === "SuperAdmin" && !organizationId) {
      setError("Organization is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      const url = editClass
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${editClass._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`;
      const method = editClass ? "put" : "post";

      const data = {
        ...formData,
        organizationId: organizationId || undefined,
      };

      await axios[method](url, data, {
        headers: { 
          "x-auth-token": getToken(),
          "Content-Type": "application/json"
        },
      });
      setSuccess(`Class ${editClass ? "updated" : "added"} successfully!`);
      fetchClasses();
      setTimeout(() => {
        onHide();
        setSuccess("");
      }, 1000);
    } catch (err) {
      console.error(`Error ${editClass ? "updating" : "adding"} class:`, err);
      setError(err.response?.data?.message || `Failed to ${editClass ? "update" : "add"} class.`);
    }
  };

  const academicYears = [];
  for (let year = 2015; year <= 2030; year++) {
    academicYears.push(`${year} - ${year + 1}`);
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header
        closeButton
        style={{ backgroundColor: "#1A3159", color: "#FFFFFF" }}
      >
        <Modal.Title>{editClass ? "Edit Class" : "Add Class"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Class Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter class name (e.g., Class 10A)"
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          {userRole === "SuperAdmin" && !editClass && (
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#1A3159" }}>Organization</Form.Label>
              <Form.Select
                value={organizationId}
                onChange={(e) => {
                  setOrganizationId(e.target.value);
                  setError("");
                }}
                style={{ borderColor: "#1A3159" }}
              >
                <option value="">Select Organization</option>
                {organizations.map((organization) => (
                  <option key={organization._id} value={organization._id}>
                    {organization.name}
                  </option>
                ))}
              </Form.Select>
              {!organizations.length && (
                <Form.Text className="text-danger">
                  Create an organization before creating a class.
                </Form.Text>
              )}
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Academic Year</Form.Label>
            <Form.Select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              style={{ borderColor: "#1A3159" }}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Class Teacher</Form.Label>
            <Form.Select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              style={{ borderColor: "#1A3159" }}
            >
              <option value="">Select Teacher (Optional)</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="secondary"
              onClick={() => {
                setFormData({
                  name: "",
                  academicYear: "2025 - 2026",
                  teacherId: "",
                });
                setError("");
                setSuccess("");
                onHide();
              }}
              style={{ backgroundColor: "#6C757D", border: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "#EF7E20",
                color: "#FFFFFF",
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
              {editClass ? "Update" : "Add"} Class
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}