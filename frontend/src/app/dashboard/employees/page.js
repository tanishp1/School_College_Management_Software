 
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaDownload,
  FaUpload,
  FaEye,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import EmployeeForm from "@/components/Employee/EmployeeForm";
import EmployeeView from "@/components/Employee/EmployeeView";
import { getToken } from "@/utils/auth";

export default function Employee() {
const departments = [
  { _id: "dept1", name: "Accounts" },
  { _id: "dept2", name: "Administration" },
  { _id: "dept3", name: "Agriculture" },
  { _id: "dept4", name: "Architecture" },
  { _id: "dept5", name: "Arts" },
  { _id: "dept6", name: "Biology" },
  { _id: "dept7", name: "Biotechnology" },
  { _id: "dept8", name: "Botany" },
  { _id: "dept9", name: "Business Administration" },
  { _id: "dept10", name: "Chemistry" },
  { _id: "dept11", name: "Civil Engineering" },
  { _id: "dept12", name: "Commerce" },
  { _id: "dept13", name: "Computer Applications" },
  { _id: "dept14", name: "Computer Science" },
  { _id: "dept15", name: "Cultural Studies" },
  { _id: "dept16", name: "Economics" },
  { _id: "dept17", name: "Education" },
  { _id: "dept18", name: "Electrical Engineering" },
  { _id: "dept19", name: "Electronics" },
  { _id: "dept20", name: "English" },
  { _id: "dept21", name: "Environmental Science" },
  { _id: "dept22", name: "Fine Arts" },
  { _id: "dept23", name: "Geography" },
  { _id: "dept24", name: "Geology" },
  { _id: "dept25", name: "History" },
  { _id: "dept26", name: "Information Technology" },
  { _id: "dept27", name: "Journalism and Mass Communication" },
  { _id: "dept28", name: "Law" },
  { _id: "dept29", name: "Library Science" },
  { _id: "dept30", name: "Linguistics" },
  { _id: "dept31", name: "Management" },
  { _id: "dept32", name: "Mathematics" },
  { _id: "dept33", name: "Mechanical Engineering" },
  { _id: "dept34", name: "Medical" },
  { _id: "dept35", name: "Music" },
  { _id: "dept36", name: "Nursing" },
  { _id: "dept37", name: "Pharmacy" },
  { _id: "dept38", name: "Philosophy" },
  { _id: "dept39", name: "Physical Education" },
  { _id: "dept40", name: "Physics" },
  { _id: "dept41", name: "Political Science" },
  { _id: "dept42", name: "Psychology" },
  { _id: "dept43", name: "Public Administration" },
  { _id: "dept44", name: "Sanskrit" },
  { _id: "dept45", name: "Social Work" },
  { _id: "dept46", name: "Sociology" },
  { _id: "dept47", name: "Statistics" },
  { _id: "dept48", name: "Teacher Training" },
  { _id: "dept49", name: "Tourism and Hospitality" },
  { _id: "dept50", name: "Zoology" }
];


  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  // const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [academicYear, setAcademicYear] = useState("2025 - 2026");
  const router = useRouter();
  const [role, setRole] = useState();

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/employees`,
        {
          headers: { "x-auth-token": getToken() },
        }
      );
      setEmployees(res.data.data || []);
      setFilteredEmployees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setFilteredEmployees([]);
    }
  };

  const fetchUser = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/get-user-info`,
        { headers: { "x-auth-token": token } }
      );
      setRole(res.data.data.user.role);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchEmployees();
  }, [router]);

  useEffect(() => {
    let result = [...employees];
    if (searchTerm) {
      result = result.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (employee.email &&
            employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (employee.department &&
            employee.department
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (employee.employeeId &&
            employee.employeeId
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (employee.role &&
            employee.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    result.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));
    setFilteredEmployees(result);
  }, [searchTerm, sortBy, employees]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/${id}`,
        {
          headers: { "x-auth-token": getToken() },
        }
      );
      setEmployees(employees.filter((employee) => employee._id !== id));
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert(
        `Failed to delete employee: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleEditClick = (employee) => {
    setEditEmployee(employee);
  };

  const handleViewClick = (employee) => {
    setViewEmployee(employee);
  };

  const handleExport = () => {
    const exportData = filteredEmployees.map((employee, index) => ({
      "Sr. No.": index + 1,
      Name: employee.name,
      Email: employee.email || "-",
      Department: employee.department || "-",
      "Employee ID": employee.employeeId || "-",
      Designation: employee.designation || "-",
      Role: employee.role || "-",
      "Phone Number": employee.phoneNumber || "-",
      "Date of Joining": employee.dateOfJoining
        ? new Date(employee.dateOfJoining).toLocaleDateString()
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "Employees_Export.xlsx");
  };




  // Badge colors for roles
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Principal":
        return "badge bg-primary";
      case "Management Staff":
        return "badge bg-success";
      case "Teacher":
        return "badge bg-info";
      case "Accountant":
        return "badge bg-warning";
      case "Clerk":
        return "badge bg-secondary";
      default:
        return "badge bg-light text-dark";
    }
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="row align-items-center flex-column flex-md-row">
        <div className="col-12 col-md-4 mb-3 mb-md-0">
          <h1 className="fw-bold" style={{ color: "#1A3159" }}>
            Manage Employees
          </h1>
          <p style={{ color: "black" }}>Add or manage employee records</p>
        </div>
        <div className="col-12 col-md-2 mb-3 mb-md-0">
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
              placeholder="Search by name, email, department, ID, or role..."
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
        <div className="col-12 col-md-6 mb-3 mb-md-0 text-md-end">
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
            <option value="department">Sort by Department</option>
            <option value="employeeId">Sort by Employee ID</option>
            <option value="role">Sort by Role</option>
          </select>
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
            <FaPlus className="me-2" /> Add Employee
          </Button>
       
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
          
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm" style={{ border: "none" }}>
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#1A3159", color: "#FFFFFF" }}
            >
              <h5 className="mb-0">Employee List</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead
                    style={{ backgroundColor: "#E9ECEF", color: "#1A3159" }}
                  >
                    <tr>
                      <th scope="col">Employee ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Password</th>
                      <th scope="col">Designation</th>
                      <th scope="col">Role</th>
                      <th scope="col">Permanent</th>
                      {role === "SuperAdmin" && <th scope="col">Organization Name</th>}
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          {searchTerm
                            ? "No employees match your search."
                            : "No employees found. Add an employee above!"}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr key={employee._id} className="align-middle">
                          <td>{employee.employeeId || "-"}</td>

                          <td>{employee.name}</td>
                          <td>{employee.email || "-"}</td>
                          <td>{employee.password || "-"}</td>
                          <td>{employee.designation || "-"}</td>
                          <td>
                            <span className={getRoleBadgeClass(employee.role)}>
                              {employee.role || "-"}
                            </span>
                          </td>
                          <td>
                            Yes
                          </td>
                          {role === "SuperAdmin" && (
                            <td scope="col">{employee.organizationName}</td>
                          )}

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
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleEditClick(employee)}
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
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleDelete(employee._id)}
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
                                onClick={() => handleViewClick(employee)}
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

      <EmployeeForm
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        fetchEmployees={fetchEmployees}
        departments={departments}
        academicYear={academicYear}
        userRole={role}
      />
      <EmployeeForm
        show={!!editEmployee}
        onHide={() => setEditEmployee(null)}
        fetchEmployees={fetchEmployees}
        editEmployee={editEmployee}
        departments={departments}
        academicYear={academicYear}
        userRole={role}

      />
      <EmployeeView
        show={!!viewEmployee}
        onHide={() => setViewEmployee(null)}
        employee={viewEmployee}
      />
    </div>
  );
}
