/**
 * SkillMatch Node microservice.
 *
 * Runs alongside the Django backend, handling Company Reviews and
 * Notifications. Covers: Node.js core modules & server creation,
 * Express fundamentals/state management/advanced concepts, Mongoose,
 * and MongoDB queries & operators.
 */
require("dotenv").config();

const http = require("http"); // core Node module - the raw server Express builds on
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json()); // parse JSON request bodies
app.use(morgan("dev"));

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "skillmatch-node-service" });
});

// --- Routes ---
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ detail: "Route not found" });
});

// --- Central error handler (Express advanced concept) ---
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ detail: "Internal server error" });
});

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();

  // Wrapping the Express app in Node's core http module - this is what
  // app.listen() does internally, made explicit for the "Node core
  // modules & server creation" syllabus topic.
  const server = http.createServer(app);
  server.listen(PORT, () => {
    logger.info(`SkillMatch Node service running on http://localhost:${PORT}`);
  });
}

start();
