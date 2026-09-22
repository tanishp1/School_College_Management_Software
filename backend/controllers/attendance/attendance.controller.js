const { sendResponse } = require("../../config/response");
const Attendance = require("../../models/Attendance/Attendance");
const Class = require("../../models/Class/Class");
const Student = require("../../models/Student/Student");

exports.getAttendance = async (req, res) => {
  try {
    const { classId, date, academicYear } = req.query;
    const query = { organizationId: req.user.organizationId };
    if (classId) query.classId = classId;
    if (date) query.date = date;
    if (academicYear) query.academicYear = academicYear;

    const attendance = await Attendance.find(query)
      .populate("studentId", "name rollNumber")
      .populate("classId", "name")
      .lean();
    sendResponse(res, 200, attendance, "Attendance fetched successfully");
  } catch (err) {
    sendResponse(res, 500, null, err.message);
  }
};

exports.markAttendance = async (req, res) => {
  try {
    if (!["SuperAdmin", "Teacher", "Faculty", "Principal", "OrganizationAdmin"].includes(req.user.role)) {
      return sendResponse(res, 403, null, "Unauthorized");
    }

    const { classId, date, academicYear, records } = req.body;
    const selectedClass = await Class.findById(classId).select("organizationId");
    if (!selectedClass) {
      return sendResponse(res, 400, null, "Invalid class");
    }

    if (req.user.role !== "SuperAdmin" && selectedClass.organizationId.toString() !== req.user.organizationId?.toString()) {
      return sendResponse(res, 403, null, "You cannot mark attendance for this class");
    }

    const organizationId = selectedClass.organizationId;
    // records = [{ studentId, status }]

    const results = await Promise.all(records.map(async ({ studentId, status }) => {
      return Attendance.findOneAndUpdate(
        { organizationId, classId, studentId, date },
        { organizationId, classId, studentId, date, status, academicYear, markedBy: req.user.id },
        { upsert: true, new: true }
      );
    }));

    sendResponse(res, 200, results, "Attendance marked successfully");
  } catch (err) {
    sendResponse(res, 500, null, err.message);
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { classId, academicYear } = req.query;
    const query = { organizationId: req.user.organizationId };
    if (classId) query.classId = classId;
    if (academicYear) query.academicYear = academicYear;

    const summary = await Attendance.aggregate([
      { $match: query },
      { $group: {
        _id: "$studentId",
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
      }},
      { $lookup: { from: "students", localField: "_id", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $project: {
        studentName: "$student.name",
        rollNumber: "$student.rollNumber",
        total: 1, present: 1, absent: 1, late: 1,
        percentage: { $multiply: [{ $divide: ["$present", "$total"] }, 100] }
      }}
    ]);

    sendResponse(res, 200, summary, "Summary fetched successfully");
  } catch (err) {
    sendResponse(res, 500, null, err.message);
  }
};
