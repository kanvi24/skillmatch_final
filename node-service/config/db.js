/**
 * Covers syllabus topic: "Mongoose & MERN Integration".
 * Establishes the Mongoose connection to the same MongoDB instance/cluster
 * that the Django backend writes to with PyMongo, so both services can
 * share the "skillmatch" database (Node owns the `reviews` and
 * `notifications` collections).
 */
const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/skillmatch";

  try {
    await mongoose.connect(uri);
    logger.info(`MongoDB connected via Mongoose -> ${mongoose.connection.name}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
