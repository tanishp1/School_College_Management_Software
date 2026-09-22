"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaCheck, FaDownload } from "react-icons/fa";
import { getToken } from "@/utils/auth";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState([]);
  const [activeTab, setActiveTab] = useState("mark");
  const [searchTerm, setSearchTerm] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { academicYear } = useSelector((s) => s.academicYear);

  const token = getToken();
  const headers = { "x-auth-token": token };

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`, { headers })
      .then((r) => setClasses(r.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students?classId=${selectedClass}`, { headers })
      .then((r) => {
        const list = r.data.data || [];
        setStudents(list);
        const init = {};
        list.forEach((s) => { init[s._id] = "Present"; });
        setAttendance(init);
      }).catch(() => {});
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass || !selectedDate) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance?classId=${selectedClass}&date=${selectedDate}&academicYear=${academicYear}`, { headers })
      .then((r) => {
        const existing = {};
        (r.data.data || []).forEach((a) => { existing[a.studentId._id || a.studentId] = a.status; });
        setAttendance((prev) => ({ ...prev, ...existing }));
      }).catch(() => {});
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (activeTab !== "summary" || !selectedClass) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance/summary?classId=${selectedClass}&academicYear=${academicYear}`, { headers })
      .then((r) => setSummary(r.data.data || []))
      .catch(() => {});
  }, [activeTab, selectedClass, academicYear]);

  const handleMark = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) return;
    setSaveError("");
    const records = students.map((s) => ({ studentId: s._id, status: attendance[s._id] || "Absent" }));
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance`, {
        classId: selectedClass, date: selectedDate, academicYear, records,
      }, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Unable to save attendance.");
    }
  };

  const handleExport = () => {
    const data = summary.map((s, i) => ({
      "Sr.No": i + 1, "Student Name": s.studentName, "Roll No": s.rollNumber,
      "Total": s.total, "Present": s.present, "Absent": s.absent, "Late": s.late,
      "Percentage": `${s.percentage?.toFixed(1)}%`,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Summary.xlsx");
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = { Present: "#28A745", Absent: "#DC3545", Late: "#FFC107" };

  return (
    <div className="container-fluid" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="row align-items-center mb-4">
        <div className="col-12 col-md-6">
          <h1 className="fw-bold" style={{ color: "#1A3159" }}>Daily Attendance</h1>
          <p style={{ color: "#555" }}>Mark and view student attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ borderColor: "#1A3159" }}>
            <option value="">-- Select Class --</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.academicYear})</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ borderColor: "#1A3159" }} />
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text" style={{ backgroundColor: "#fff", borderColor: "#1A3159" }}><FaSearch /></span>
            <input type="text" className="form-control" placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ borderColor: "#1A3159" }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" style={{ borderBottom: "2px solid #1A3159" }}>
        {["mark", "summary"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link ${activeTab === tab ? "active" : ""}`}
              style={{ color: activeTab === tab ? "#1A3159" : "#6C757D", backgroundColor: activeTab === tab ? "#E9ECEF" : "transparent", border: "none" }}
              onClick={() => setActiveTab(tab)}>
              {tab === "mark" ? "Mark Attendance" : "Summary"}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === "mark" && (
        <>
          <div className="card shadow-sm" style={{ border: "none" }}>
            <div className="card-header" style={{ backgroundColor: "#1A3159", color: "#fff" }}>
              <h5 className="mb-0">Attendance — {selectedDate}</h5>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#E9ECEF", color: "#1A3159" }}>
                  <tr>
                    <th>Sr.No</th><th>Roll No</th><th>Student Name</th>
                    <th>Present</th><th>Absent</th><th>Late</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedClass ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">Please select a class</td></tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">No students found</td></tr>
                  ) : filteredStudents.map((s, i) => (
                    <tr key={s._id} className="align-middle">
                      <td>{i + 1}</td>
                      <td>{s.rollNumber}</td>
                      <td>{s.name}</td>
                      {["Present", "Absent", "Late"].map((status) => (
                        <td key={status}>
                          <input type="radio" name={s._id} checked={attendance[s._id] === status}
                            onChange={() => handleMark(s._id, status)}
                            style={{ accentColor: statusColor[status], width: "18px", height: "18px", cursor: "pointer" }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {selectedClass && students.length > 0 && (
            <div className="mt-3 text-end">
              {saveError && <div className="alert alert-danger text-start">{saveError}</div>}
              <button className="btn px-4 py-2" onClick={handleSave}
                style={{ backgroundColor: "#EF7E20", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600" }}>
                <FaCheck className="me-2" /> {saved ? "Saved!" : "Save Attendance"}
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === "summary" && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn px-4 py-2" onClick={handleExport}
              style={{ backgroundColor: "#EF7E20", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600" }}>
              <FaDownload className="me-2" /> Export
            </button>
          </div>
          <div className="card shadow-sm" style={{ border: "none" }}>
            <div className="card-header" style={{ backgroundColor: "#1A3159", color: "#fff" }}>
              <h5 className="mb-0">Attendance Summary</h5>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#E9ECEF", color: "#1A3159" }}>
                  <tr><th>Sr.No</th><th>Roll No</th><th>Name</th><th>Total</th><th>Present</th><th>Absent</th><th>Late</th><th>%</th></tr>
                </thead>
                <tbody>
                  {summary.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted py-4">No data. Select a class above.</td></tr>
                  ) : summary.map((s, i) => (
                    <tr key={i} className="align-middle">
                      <td>{i + 1}</td><td>{s.rollNumber}</td><td>{s.studentName}</td>
                      <td>{s.total}</td>
                      <td><span className="badge bg-success">{s.present}</span></td>
                      <td><span className="badge bg-danger">{s.absent}</span></td>
                      <td><span className="badge bg-warning text-dark">{s.late}</span></td>
                      <td>
                        <span className={`badge ${s.percentage >= 75 ? "bg-success" : "bg-danger"}`}>
                          {s.percentage?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
