/**
 * Covers syllabus topic: "Node JS - Introduction and Core Modules".
 *
 * A tiny hand-rolled logger built entirely from Node's built-in core
 * modules (fs, path, os) instead of a third-party logging library, to
 * demonstrate working directly with core modules: reading/writing files,
 * resolving paths, and reading OS info.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "activity.log");

// Ensure the logs directory exists (fs.mkdirSync - core module usage)
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(level, message) {
  const timestamp = new Date().toISOString();
  const host = os.hostname();
  const line = `[${timestamp}] [${host}] [${level.toUpperCase()}] ${message}\n`;

  // Append asynchronously so logging never blocks the request/response cycle
  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) {
      // Fall back to console if disk write fails
      console.error("Failed to write log file:", err.message);
    }
  });

  // Always echo to stdout too
  console.log(line.trim());
}

module.exports = {
  info: (msg) => log("info", msg),
  warn: (msg) => log("warn", msg),
  error: (msg) => log("error", msg),
  LOG_FILE,
};
