 
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDownload, FaEye } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken } from "@/utils/auth";
import StudentForm from "@/components/Student/StudentForm";
import StudentView from "@/components/Student/StudentView";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [academicYear, setAcademicYear] = useState("2025 - 2026");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [role, setRole] = useState(null);
  const router = useRouter();

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/students`,
        { headers: { "x-auth-token": getToken() } }
      );
      setStudents(res.data.data || []);
      setFilteredStudents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setFilteredStudents([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`,
        { headers: { "x-auth-token": getToken() } }
      );
      setClasses(res.data.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = getToken();
      if (token) {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/get-user-info`,
          { headers: { "x-auth-token": token } }
        );
        setRole(res.data.data.user.role);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchStudents();
    fetchClasses();
  }, [router]);

  useEffect(() => {
    let result = [...students];
    if (searchTerm) {
      result = result.filter(
        (student) =>
          (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.email &&
            student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.className &&
            student.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.rollNumber &&
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.category &&
            student.category.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    result.sort((a, b) => (a[sortBy] || "").localeCompare(b[sortBy] || ""));
    setFilteredStudents(result);
  }, [searchTerm, sortBy, students]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${id}`,
        { headers: { "x-auth-token": getToken() } }
      );
      setStudents(students.filter((student) => student._id !== id));
    } catch (err) {
      console.error("Error deleting student:", err);
      alert(`Failed to delete student: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditClick = (student) => {
    setEditStudent(student);
  };

  const handleViewClick = (student) => {
    setViewStudent(student);
  };

  const handleExport = () => {
    const exportData = filteredStudents.map((student, index) => ({
      "Sr. No.": index + 1,
      Name: student.name,
      Email: student.email || "-",
      Class: student.className || "-",
      "Roll Number": student.rollNumber || "-",
      Category: student.category || "-",
      "Phone Number": student.phoneNumber || "-",
      "Date of Birth": student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString()
        : "-",
      Address: student.address || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, `Students_${academicYear}.xlsx`);
  };

  const academicYears = [];
  for (let year = 2015; year <= 2030; year++) {
    academicYears.push(`${year} - ${year + 1}`);
  }

  const handleAcademicYearChange = (e) => {
    setAcademicYear(e.target.value);
  };

  // Badge colors for student categories
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Class 10":
        return "badge bg-primary";
      case "Class 11":
        return "badge bg-success";
      case "Class 12":
        return "badge bg-info";
      case "Class 9":
        return "badge bg-warning";
      case "Class 8":
        return "badge bg-secondary";
      case "UG":
        return "badge bg-dark";
      case "PG":
        return "badge bg-danger";
      default:
        return "badge bg-light text-dark";
    }
  };

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const canEditOrDelete = () => true

  return (
    <div className="container-fluid" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="row align-items-center flex-column flex-md-row mt-4">
        <div className="col-12 col-md-4 mb-3 mb-md-0">
          <h1 className="fw-bold" style={{ color: "#1A3159" }}>
            Manage Students
          </h1>
          <p style={{ color: "black" }}>Add or manage student records</p>
        </div>
        <div className="col-12 col-md-3 mb-3 mb-md-0">
          <div className="input-group">
            <span
              className="input-group-text"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#1A3159",
                borderRadius: "8px 0 0 8px",
                color: "#1A3159",
              }}
            >
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, class, roll number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderColor: "#1A3159",
                borderRadius: "0 8px 8px 0",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        </div>
        <div className="col-12 col-md-5 mb-3 mb-md-0 text-md-end">
          <select
            className="form-select me-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              borderColor: "#1A3159",
              borderRadius: "8px",
              color: "#1A3159",
              backgroundColor: "#FFFFFF",
              maxWidth: "150px",
              display: "inline-block",
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="className">Sort by Class</option>
            <option value="rollNumber">Sort by Roll Number</option>
            <option value="category">Sort by Category</option>
          </select>
          {canEditOrDelete() && (
            <Button
              className="py-2 px-4 shadow-sm me-2"
              style={{
                backgroundColor: "#EF7E20",
                color: "#FFFFFF",
                border: "2px solid #FF9B50",
                borderRadius: "8px",
                fontWeight: "600",
                transition: "all 0.3s",
              }}
              onClick={() => setShowAddModal(true)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#FF9B50";
                e.target.style.borderColor = "#EF7E20";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#EF7E20";
                e.target.style.borderColor = "#FF9B50";
              }}
            >
              <FaPlus className="me-2" /> Add Student
            </Button>
          )}
          <Button
            className="py-2 px-4 shadow-sm"
            style={{
              backgroundColor: "#17A2B8",
              color: "#FFFFFF",
              border: "2px solid #138496",
              borderRadius: "8px",
              fontWeight: "600",
              transition: "all 0.3s",
            }}
            onClick={handleExport}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#138496";
              e.target.style.borderColor = "#17A2B8";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#17A2B8";
              e.target.style.borderColor = "#138496";
            }}
          >
            <FaDownload className="me-2" /> Export
          </Button>
          <select
            className="form-select ms-2"
            value={academicYear}
            onChange={handleAcademicYearChange}
            style={{
              borderColor: "#1A3159",
              borderRadius: "8px",
              color: "#1A3159",
              backgroundColor: "#FFFFFF",
              maxWidth: "150px",
              display: "inline-block",
            }}
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm" style={{ border: "none" }}>
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#1A3159", color: "#FFFFFF" }}
            >
              <h5 className="mb-0">Student List</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: "#E9ECEF", color: "#1A3159" }}>
                    <tr>
                      <th scope="col">Sr. No.</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Class</th>
                      <th scope="col">Roll Number</th>
                      <th scope="col">Category</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          {searchTerm
                            ? "No students match your search."
                            : "No students found. Add a student above!"}
                        </td>
                      </tr>
                    ) : (
                      currentStudents.map((student, index) => (
                        <tr key={student._id} className="align-middle">
                          <td>{indexOfFirstStudent + index + 1}</td>
                          <td>{student.name}</td>
                          <td>{student.email || "-"}</td>
                          <td>{student.className || "-"}</td>
                          <td>{student.rollNumber || "-"}</td>
                          <td>
                            <span className={getCategoryBadgeClass(student.category)}>
                              {student.category || "-"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                className="btn-sm"
                                style={{
                                  backgroundColor: "#EF7E20",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "32px",
                                  height: "32px",
                                  display: canEditOrDelete() ? "flex" : "none",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleEditClick(student)}
                                title="Edit"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                className="btn-sm"
                                style={{
                                  backgroundColor: "#1A3159",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "32px",
                                  height: "32px",
                                  display: role === "SuperAdmin" ? "flex" : "none",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleDelete(student._id)}
                                title="Delete"
                              >
                                <FaTrash />
                              </Button>
                              <Button
                                className="btn-sm"
                                style={{
                                  backgroundColor: "#28A745",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "32px",
                                  height: "32px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleViewClick(student)}
                                title="View Details"
                              >
                                <FaEye />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <nav>
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <Button
                  className="page-link"
                  style={{
                    backgroundColor: currentPage === page ? "#EF7E20" : "#FFFFFF",
                    color: currentPage === page ? "#FFFFFF" : "#1A3159",
                    borderColor: "#1A3159",
                  }}
                  onClick={() => paginate(page)}
                >
                  {page}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {canEditOrDelete() && (
        <>
          <StudentForm
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            fetchStudents={fetchStudents}
            classes={classes}
            fetchClasses={fetchClasses}
            userRole={role}
          />
          <StudentForm
            show={!!editStudent}
            onHide={() => setEditStudent(null)}
            fetchStudents={fetchStudents}
            editStudent={editStudent}
            classes={classes}
            fetchClasses={fetchClasses}
            userRole={role}
          />
        </>
      )}
      <StudentView
        show={!!viewStudent}
        onHide={() => setViewStudent(null)}
        student={viewStudent}
      />
    </div>
  );
}