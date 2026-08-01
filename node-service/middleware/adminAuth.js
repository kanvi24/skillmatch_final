/**
 * Covers syllabus topics: "Express - State Management and API" and
 * "MongoDB - Queries and Operators".
 *
 * The Node service doesn't own the `users` collection (Django/PyMongo does),
 * so instead of a Mongoose model we read it directly off the shared
 * connection with a plain findOne — a light MongoDB query against a
 * collection owned by another service in the same database.
 * Must run AFTER requireAuth, since it depends on req.user.email.
 */
const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ detail: "Authentication required" });
    }

    const usersCollection = mongoose.connection.db.collection("users");
    const user = await usersCollection.findOne({ email: req.user.email });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "This action requires admin access." });
    }

    next();
  } catch (err) {
    logger.error(`Admin check failed: ${err.message}`);
    return res.status(500).json({ detail: "Could not verify admin access" });
  }
}

module.exports = requireAdmin;
