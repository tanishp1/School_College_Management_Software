const { sendResponse } = require("../../config/response");
const Class = require("../../models/Class/Class");
const Student = require("../../models/Student/Student");


exports.getAllStudents = async (req, res) => {
  try {
    const user = req.user;
    const { classId } = req.query;
    let students;
    if (user.role === "SuperAdmin") {
      const query = classId ? { classId } : {};
      students = await Student.find(query).populate("classId", "name academicYear").lean();
    } else if (["OrganizationAdmin", "Principal"].includes(user.role)) {
      const query = { organizationId: user.organizationId };
      if (classId) query.classId = classId;
      students = await Student.find(query).populate("classId", "name academicYear").lean();
    } else if (["Faculty", "Teacher"].includes(user.role)) {
      const classes = await Class.find({ teacherId: user.id }).select("_id");
      const classIds = classId ? [classId] : classes.map(cls => cls._id);
      students = await Student.find({ classId: { $in: classIds } }).populate("classId", "name academicYear").lean();
    } else {
      return sendResponse(res, 403, "Unauthorized access");
    }

    students = students.map(student => ({
      ...student,
      className: student.classId ? `${student.classId.name} (${student.classId.academicYear})` : "-"
    }));

    sendResponse(res, 200, students , "Students fetched successfully");
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("classId", "name academicYear")
      .lean();
    if (!student) {
      return sendResponse(res, 404, "Student not found");
    }
    if (req.user.role !== "SuperAdmin" && student.organizationId.toString() !== req.user.organizationId?.toString()) {
      return sendResponse(res, 403, "Unauthorized access");
    }
    student.className = student.classId ? `${student.classId.name} (${student.classId.academicYear})` : "-";
    sendResponse(res, 200, "Student fetched successfully", { student });
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};

exports.createStudent = async (req, res) => {
  try {
    const user = req.user;
    if (!["SuperAdmin", "OrganizationAdmin", "Principal"].includes(user.role)) {
      return sendResponse(res, 403, "Unauthorized to create students");
    }

    const { name, email, classId, rollNumber, category, phoneNumber, dateOfBirth, address, password } = req.body;

    const organizationId = user.role === "SuperAdmin" ? req.body.organizationId : user.organizationId;
    if (!organizationId) {
      return sendResponse(res, 400, null, "Organization ID is required");
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return sendResponse(res, 400, null, "Invalid class ID");
    }
    if (cls.organizationId.toString() !== organizationId.toString()) {
      return sendResponse(res, 403, null, "Class does not belong to your organization");
    }

    const student = new Student({
      organizationId,
      name,
      email,
      password,
      classId,
      rollNumber,
      category,
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address,
    });

    await student.save();

    // Add student to class
    cls.students.push(student._id);
    await cls.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("classId", "name academicYear")
      .lean();
    populatedStudent.className = populatedStudent.classId ? `${populatedStudent.classId.name} (${populatedStudent.classId.academicYear})` : "-";

    sendResponse(res, 201, { student: populatedStudent }, "Student created successfully");
  } catch (err) {
    if (err.name === "ValidationError" || err.code === 11000) {
      return sendResponse(res, 400, null, err.message);
    }
    sendResponse(res, 500, null, "Unable to create student");
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const user = req.user;
    if (!["SuperAdmin", "OrganizationAdmin", "Principal"].includes(user.role)) {
      return sendResponse(res, 403, "Unauthorized to update students");
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendResponse(res, 404, "Student not found");
    }
    if (req.user.role !== "SuperAdmin" && student.organizationId.toString() !== req.user.organizationId?.toString()) {
      return sendResponse(res, 403, "Unauthorized access");
    }

    const { name, email, classId, rollNumber, category, phoneNumber, dateOfBirth, address, password } = req.body;

    if (classId && classId !== student.classId.toString()) {
      const newClass = await Class.findById(classId);
      if (!newClass) {
        return sendResponse(res, 400, null, "Invalid class ID");
      }
      if (newClass.organizationId.toString() !== student.organizationId.toString()) {
        return sendResponse(res, 403, null, "Class does not belong to your organization");
      }

      // Remove student from old class
      const oldClass = await Class.findById(student.classId);
      if (oldClass) {
        oldClass.students = oldClass.students.filter(id => id.toString() !== student._id.toString());
        await oldClass.save();
      }

      // Add student to new class
      newClass.students.push(student._id);
      await newClass.save();
    }

    student.set({
      name,
      email,
      classId,
      rollNumber,
      category,
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address,
      password: password || student.password,
    });

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("classId", "name academicYear")
      .lean();
    populatedStudent.className = populatedStudent.classId ? `${populatedStudent.classId.name} (${populatedStudent.classId.academicYear})` : "-";

    sendResponse(res, 200, { student: populatedStudent }, "Student updated successfully");
  } catch (err) {
    if (err.name === "ValidationError" || err.code === 11000) {
      return sendResponse(res, 400, null, err.message);
    }
    sendResponse(res, 500, null, "Unable to update student");
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return sendResponse(res, 403, "Only SuperAdmin can delete students");
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendResponse(res, 404, "Student not found");
    }

    // Remove student from class
    const cls = await Class.findById(student.classId);
    if (cls) {
      cls.students = cls.students.filter(id => id.toString() !== student._id.toString());
      await cls.save();
    }

    await student.deleteOne();
    sendResponse(res, 200, "Student deleted successfully");
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};