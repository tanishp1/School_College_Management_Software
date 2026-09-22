 
"use client";
import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken } from "@/utils/auth";
import ClassForm from "../class/ClassForm";

export default function StudentForm({
  show,
  onHide,
  fetchStudents,
  editStudent,
  classes,
  fetchClasses,
  userRole,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    classId: "",
    rollNumber: "",
    category: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    password : ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showClassForm, setShowClassForm] = useState(false);

  useEffect(() => {
    if (editStudent) {
      setFormData({
        name: editStudent.name || "",
        email: editStudent.email || "",
        classId: editStudent.classId?._id || editStudent.classId || "",
        rollNumber: editStudent.rollNumber || "",
        category: editStudent.category || "",
        phoneNumber: editStudent.phoneNumber || "",
        dateOfBirth: editStudent.dateOfBirth
          ? new Date(editStudent.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: editStudent.address || "",
    password : editStudent.password || "",

      });
    } else {
      setFormData({
        name: "",
        email: "",
        classId: "",
        rollNumber: "",
        category: "",
        phoneNumber: "",
        dateOfBirth: "",
        address: "",
        password : ""

      });
    }
  }, [editStudent]);

  useEffect(() => {
    if (!show) return;

    fetchClasses?.();
  }, [show]);

  useEffect(() => {
    if (!editStudent && classes?.length === 1 && !formData.classId) {
      setFormData((currentData) => ({
        ...currentData,
        classId: classes[0]._id,
      }));
    }
  }, [classes, editStudent, formData.classId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.classId || !formData.rollNumber || !formData.category) {
      setError("Name, Email, Class, Roll Number, and Category are required.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Invalid email format.");
      return false;
    }
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      setError("Date of Birth cannot be in the future.");
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
      const url = editStudent
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${editStudent._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/students`;
      const method = editStudent ? "put" : "post";

      const selectedClass = classes.find((classItem) => classItem._id === formData.classId);
      const data = {
        ...formData,
        organizationId: selectedClass?.organizationId?._id || selectedClass?.organizationId,
      };

      await axios[method](url, data, {
        headers: { "x-auth-token": getToken() },
      });
      setSuccess(`Student ${editStudent ? "updated" : "added"} successfully!`);
      fetchStudents();
      setTimeout(() => {
        onHide();
        setSuccess("");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${editStudent ? "update" : "add"} student.`
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ backgroundColor: "#1A3159", color: "#FFFFFF" }}>
        <Modal.Title>{editStudent ? "Edit Student" : "Add Student"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter student name"
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              style={{ borderColor: "#1A3159" }}
            >
              <option value="">Select Class</option>
              {classes && classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.academicYear})
                </option>
              ))}
            </Form.Select>
            {!classes?.length && (
              <div>
                <Form.Text className="text-danger d-block mb-2">
                  No classes available. Create a class before adding a student.
                </Form.Text>
                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={() => setShowClassForm(true)}
                >
                  Create class
                </Button>
              </div>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ color: "#1A3159" }}>Roll Number</Form.Label>
            <Form.Control
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="Enter roll number"
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ borderColor: "#1A3159" }}
            >
              <option value="">Select Category</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#1A3159" }}>Address</Form.Label>
            <Form.Control
              as="textarea"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              style={{ borderColor: "#1A3159" }}
            />
          </Form.Group>
          <div className="d-flex gap-2">
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
              {editStudent ? "Update" : "Add"} Student
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  classId: "",
                  rollNumber: "",
                  category: "",
                  phoneNumber: "",
                  dateOfBirth: "",
                  address: "",
                  password: "",
                });
                setError("");
                setSuccess("");
              }}
              style={{ backgroundColor: "#E9ECEF", color: "#1A3159" }}
            >
              Reset
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <ClassForm
        show={showClassForm}
        onHide={() => setShowClassForm(false)}
        userRole={userRole}
        fetchClasses={async () => {
          await fetchClasses?.();
          setShowClassForm(false);
        }}
      />
    </Modal>
  );
}
