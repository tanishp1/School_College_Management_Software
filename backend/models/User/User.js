const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: function () {
      return this.role !== "SuperAdmin";
    },
  },
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true }, // Not hashed as per requirement
  role: {
    type: String,
    enum: [
      "SuperAdmin",
      "OrganizationAdmin",
      "Principal",
      "Faculty",
      "Teacher",
      "Management Staff",
      "Accountant",
      "Clerk",
      "Parents",
      "Students",
    ],
    required: true,
  },
  department: {
    type: String,
    required: function () {
      return (
        this.role === "Teacher" ||
        this.role === "Accountant" ||
        this.role === "Clerk"
      );
    },
    trim: true,
  },
  employeeId: { type: String },
  designation: {
    type: String,
    required: function () {
      return (
        this.role === "Principal" ||
        this.role === "Teacher" ||
        this.role === "Accountant" ||
        this.role === "Clerk"
      );
    },
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: function () {
      return (
        this.role === "Principal" ||
        this.role === "Teacher" ||
        this.role === "Accountant" ||
        this.role === "Clerk"
      );
    },
    trim: true,
  },
  dateOfJoining: {
    type: Date,
    required: function () {
      return (
        this.role === "Principal" ||
        this.role === "Teacher" ||
        this.role === "Accountant" ||
        this.role === "Clerk"
      );
    },
  },
  profileImage: { type: String },
  aqarAccess: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Verify Email

  
  emailOtp: { type: String },
  isEmailVerify: { type: Boolean },


  
});

// Indexes for performance
userSchema.index({ organizationId: 1, email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

// Pre-save hook
userSchema.pre("save", async function (next) {
  if (this.role === "SuperAdmin") {
    this.organizationId = undefined;
    this.department = undefined;
    this.employeeId = undefined;
    this.designation = undefined;
    this.phoneNumber = undefined;
    this.dateOfJoining = undefined;
  } else if (this.role === "OrganizationAdmin") {
    this.department = undefined;
    this.designation = undefined;
    this.phoneNumber = undefined;
    this.dateOfJoining = undefined;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
