require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { logger } = require("./config/logger");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/organizations", require("./routes/organization.routes"));
app.use("/api/aqar", require("./routes/aqar.routes"));
app.use("/api/employees", require("./routes/employees.routes"));
app.use("/api/timetables", require("./routes/timetables.routes"));
app.use("/api/daily-event-diary", require("./routes/dailyevent.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/classes", require("./routes/class.routes"));
app.use("/api/teachers", require("./routes/teachers.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/help-center", require("./routes/helpcenter.routes"));
app.use("/api/feedback", require("./routes/feedback.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/media", require("./routes/media.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/exams", require("./routes/examschedule.routes"));
app.use("/api/notices", require("./routes/notice.routes"));


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`)
});