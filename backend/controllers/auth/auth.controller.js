const jwt = require("jsonwebtoken");
const { logger } = require("../../config/logger");
const { sendResponse } = require("../../config/response");
const User = require("../../models/User/User");

const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      logger.warn(
        `SuperAdmin registration failed: Email ${email} already exists`
      );
      return sendResponse(res, 400, null, "Email already exists");
    }

    user = new User({
      name,
      email,
      password, // Not hashed as per requirement
      role: "SuperAdmin",
    });
    await user.save();
    logger.info(`SuperAdmin registered: ${email}`);

    const token = jwt.sign(
      { id: user._id, role: user.role, organizationId: null },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );
    sendResponse(
      res,
      201,
      { token, user: { email: user.email, role: user.role, name: user.name } },
      "SuperAdmin registered successfully"
    );
  } catch (err) {
    console.log(err, "err");
    logger.error(`SuperAdmin registration error: ${err.message}`);
    sendResponse(res, 400, null, err.message);
  }
};

const login = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  try {
    if (!email || !password) {
      return sendResponse(res, 400, null, "Email and password are required");
    }

    const user = await User.findOne({ email }).lean();

    if (!user) {
      logger.warn(`Login failed: Invalid email ${email}`);
      return sendResponse(res, 400, null, "No account found for this email");
    }

    if (user.password !== password) {
      logger.warn(`Login failed: Invalid password for ${email}`);
      return sendResponse(res, 400, null, "Incorrect password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizationId: user.organizationId || null,
      },
      process.env.JWT_SECRET, // ← Fix here
      { expiresIn: "1y" }
    );
    logger.info(`User logged in: ${email}, role: ${user.role}`);
    sendResponse(
      res,
      200,
      { token, user: { email: user.email, role: user.role, name: user.name } },
      "Login successful"
    );
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    sendResponse(res, 500, null, err.message);
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean(); // exclude password
    if (!user) {
      logger.warn(`User not found for ID: ${req.user.id}`);
      return sendResponse(res, 404, null, "User not found");
    }

    sendResponse(res, 200, { user }, "User details fetched successfully");
  } catch (error) {
    logger.error(`Error in getUserInfo: ${error.message}`);
    sendResponse(res, 500, null, "Server error");
  }
};

const verifyEmailOtp = async (req,res) => {
  
}

module.exports = { registerSuperAdmin, login, getUserInfo };
