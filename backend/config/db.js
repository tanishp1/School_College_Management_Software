const mongoose = require("mongoose");
const { logger } = require("./logger");

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not set. Add it to backend/.env before starting the server.");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully")
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = {connectDB};