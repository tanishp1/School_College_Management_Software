 
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDownload, FaEye } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken } from "@/utils/auth";
import ClassForm from "@/components/class/ClassForm";
import ClassView from "@/components/class/ClassView";

export default function Class() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [viewClass, setViewClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [academicYear, setAcademicYear] = useState("2025 - 2026");
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(5);
  const [role, setRole] = useState(null);
  const router = useRouter();

  const fetchClasses = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`,
        { headers: { "x-auth-token": getToken() } }
      );
      setClasses(res.data.data || []);
      setFilteredClasses(res.data.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setFilteredClasses([]);
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
    fetchClasses();
  }, [router]);

  useEffect(() => {
    let result = [...classes];
    if (searchTerm) {
      result = result.filter(
        (cls) =>
          (cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cls.teacherName &&
            cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (cls.academicYear &&
            cls.academicYear.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    result.sort((a, b) => (a[sortBy] || "").localeCompare(b[sortBy] || ""));
    setFilteredClasses(result);
  }, [searchTerm, sortBy, classes]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${id}`,
        { headers: { "x-auth-token": getToken() } }
      );
      setClasses(classes.filter((cls) => cls._id !== id));
    } catch (err) {
      console.error("Error deleting class:", err);
      alert(`Failed to delete class: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditClick = (cls) => {
    setEditClass(cls);
  };

  const handleViewClick = (cls) => {
    setViewClass(cls);
  };

  const handleExport = () => {
    const exportData = filteredClasses.map((cls, index) => ({
      "Sr. No.": index + 1,
      Name: cls.name,
      "Teacher": cls.teacherName || "-",
      "Academic Year": cls.academicYear,
      "Student Count": cls.studentCount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");
    XLSX.writeFile(workbook, `Classes_${academicYear}.xlsx`);
  };

  const academicYears = [];
  for (let year = 2015; year <= 2030; year++) {
    academicYears.push(`${year} - ${year + 1}`);
  }

  const handleAcademicYearChange = (e) => {
    setAcademicYear(e.target.value);
  };

  // Pagination
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = filteredClasses.slice(
    indexOfFirstClass,
    indexOfLastClass
  );
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const canEditOrDelete = () => true

  return (
    <div className="container-fluid" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="row align-items-center flex-column flex-md-row mt-4">
        <div className="col-12 col-md-4 mb-3 mb-md-0">
          <h1 className="fw-bold" style={{ color: "#1A3159" }}>
            Manage Classes
          </h1>
          <p style={{ color: "black" }}>Add or manage class records</p>
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
              placeholder="Search by name, teacher, or academic year..."
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
            <option value="teacherName">Sort by Teacher</option>
            <option value="academicYear">Sort by Academic Year</option>
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
              <FaPlus className="me-2" /> Add Class
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
              <h5 className="mb-0">Class List</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: "#E9ECEF", color: "#1A3159" }}>
                    <tr>
                      <th scope="col">Sr. No.</th>
                      <th scope="col">Name</th>
                      <th scope="col">Teacher</th>
                      <th scope="col">Academic Year</th>
                      <th scope="col">Student Count</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClasses.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          {searchTerm
                            ? "No classes match your search."
                            : "No classes found. Add a class above!"}
                        </td>
                      </tr>
                    ) : (
                      currentClasses.map((cls, index) => (
                        <tr key={cls._id} className="align-middle">
                          <td>{indexOfFirstClass + index + 1}</td>
                          <td>{cls.name}</td>
                          <td>{cls.teacherName || "-"}</td>
                          <td>{cls.academicYear}</td>
                          <td>{cls.studentCount || 0}</td>
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
                                onClick={() => handleEditClick(cls)}
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
                                onClick={() => handleDelete(cls._id)}
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
                                onClick={() => handleViewClick(cls)}
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
          <ClassForm
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            fetchClasses={fetchClasses}
            userRole={role}
          />
          <ClassForm
            show={!!editClass}
            onHide={() => setEditClass(null)}
            fetchClasses={fetchClasses}
            editClass={editClass}
            userRole={role}
          />
        </>
      )}
      <ClassView
        show={!!viewClass}
        onHide={() => setViewClass(null)}
        classData={viewClass}
      />
    </div>
  );
}