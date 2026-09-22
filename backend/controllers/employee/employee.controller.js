const { default: mongoose } = require("mongoose");
const { generateUniqueEmployeeId } = require("../../common/common");
const { sendResponse } = require("../../config/response");
const User = require("../../models/User/User");

exports.getAllEmployees = async (req, res) => {
  try {
    const user = req.user;
    const employeeRoles = [
      "Principal",
      "Faculty",
      "Teacher",
      "Management Staff",
      "Accountant",
      "Clerk",
      "Parents",
      "Students",
    ];

    // Only for SuperAdmin: using aggregation to include organizationName
    if (user.role === "SuperAdmin") {
      const employees = await User.aggregate([
        {
          $match: {
            role: { $in: employeeRoles },
          },
        },
        {
          $lookup: {
            from: "organizations", // name of the collection in MongoDB (lowercase plural)
            localField: "organizationId",
            foreignField: "_id",
            as: "organizationInfo",
          },
        },
        {
          $unwind: {
            path: "$organizationInfo",
            preserveNullAndEmptyArrays: true, // handles users like SuperAdmin without org
          },
        },
        {
          $addFields: {
            organizationName: "$organizationInfo.name",
          },
        },
        {
          $project: {
            organizationInfo: 0, // exclude this field
          },
        },
      ]);

      return sendResponse(
        res,
        200,
        employees,
        "Employees fetched successfully"
      );
    }

    // OrganizationAdmin and Principal — use regular query
    const filter = {
      role: { $in: employeeRoles },
      organizationId: new mongoose.Types.ObjectId(user.organizationId),
    };

    const employees = await User.find(filter)

    return sendResponse(res, 200, employees, "Employees fetched successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, err.message);
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return sendResponse(res, 404, "Employee not found");
    }
    if (
      req.user.role !== "SuperAdmin" &&
      req.user.role !== "OrganizationAdmin" &&
      (req.user.role !== "Principal" ||
        employee.organizationId.toString() !==
          req.user.organizationId.toString())
    ) {
      return sendResponse(res, 403, "Unauthorized access");
    }
    sendResponse(res, 200, "Employee fetched successfully", { employee });
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      designation,
      role,
      phoneNumber,
      dateOfJoining,
      password,
      academicYear,
      aqarAccess,
      organizationId
    } = req.body;

    if (
      !["SuperAdmin", "OrganizationAdmin", "Principal"].includes(req.user.role)
    ) {
      return sendResponse(
        res,
        403,
        null,
        "Only SuperAdmin or OrganizationAdmin can create employees"
      );
    }

    const employeeRoles = [
      "Principal",
      "Faculty",
      "Teacher",
      "Management Staff",
      "Accountant",
      "Clerk",
      "Parents",
    ];
    if (!employeeRoles.includes(role)) {
      return sendResponse(res, 400, null, "Invalid role for employee");
    }

    if (!req.user.organizationId && req.user.role !== "SuperAdmin") {
      return sendResponse(
        res,
        400,
        null,
        "Your account is not linked to an organization"
      );
    }

    if (!password) {
      return sendResponse(
        res,
        400,
        null,
        "Password is required for a new employee"
      );
    }

    const employeeOrganizationId =
      req.user.role === "SuperAdmin" ? organizationId : req.user.organizationId;

    if (!employeeOrganizationId) {
      return sendResponse(res, 400, null, "Organization is required");
    }

    const employeeId = await generateUniqueEmployeeId(role);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, null, "Email already exists");
    }
    const employee = new User({
      name,
      email,
      department,
      employeeId,
      designation,
      role,
      phoneNumber,
      dateOfJoining,
      password, // Store plain text password as requested
      organizationId: employeeOrganizationId,
      academicYear,
      aqarAccess
    });

    await employee.save();
    sendResponse(res, 201, { employee }, "Employee created successfully");
  } catch (err) {
    if (err.name === "ValidationError" || err.code === 11000) {
      return sendResponse(res, 400, null, err.message);
    }

    console.error("Error creating employee:", err);
    sendResponse(res, 500, "Unable to create employee");
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return sendResponse(res, 404, "Employee not found");
    }
    if (
      req.user.role !== "SuperAdmin" &&
      req.user.role !== "OrganizationAdmin" &&
      (req.user.role !== "Principal" ||
        employee.organizationId.toString() !==
          req.user.organizationId.toString())
    ) {
      return sendResponse(res, 403, "Unauthorized access");
    }

    const {
      name,
      email,
      department,
      employeeId,
      designation,
      role,
      phoneNumber,
      dateOfJoining,
      password,
      academicYear
    } = req.body;

    if (
      role &&
      ![
        "Principal",
        "Management Staff",
        "Teacher",
        "Accountant",
        "Clerk",
      ].includes(role)
    ) {
      return sendResponse(res, 400, "Invalid role for employee");
    }

    if (email && email !== employee.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendResponse(res, 400, "Email already exists");
      }
    }

    employee.set({
      name,
      email,
      department: department || undefined,
      employeeId,
      designation: designation || undefined,
      role,
      phoneNumber: phoneNumber || undefined,
      dateOfJoining: dateOfJoining || undefined,
      password: password || employee.password, // Update password only if provided
      academicYear: academicYear || employee.academicYear, // Update password only if provided
      
    });

    await employee.save();
    sendResponse(res, 200, "Employee updated successfully", { employee });
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return sendResponse(res, 404, "Employee not found");
    }
    if (
      req.user.role !== "SuperAdmin" &&
      (req.user.role !== "OrganizationAdmin" ||
        employee.organizationId.toString() !==
          req.user.organizationId.toString())
    ) {
      return sendResponse(
        res,
        403,
        "Only SuperAdmin or OrganizationAdmin can delete employees"
      );
    }

    await employee.deleteOne();
    sendResponse(res, 200, "Employee deleted successfully");
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};
