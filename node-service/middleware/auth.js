const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    // Search in current directory (node-service) and parent directory (project root)
    const localPath = path.join(__dirname, "..", "firebase-service-account.json");
    const parentPath = path.join(__dirname, "..", "..", "firebase-service-account.json");
    
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      logger.info("Firebase Admin initialized in node-service using credentials from FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
    } else if (fs.existsSync(localPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(localPath)
      });
      logger.info("Firebase Admin initialized in node-service using credentials from node-service root.");
    } else if (fs.existsSync(parentPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(parentPath)
      });
      logger.info("Firebase Admin initialized in node-service using credentials from project root.");
    } else if (projectId) {
      admin.initializeApp({
        projectId: projectId
      });
      logger.info(`Firebase Admin initialized in node-service using project ID: ${projectId}`);
    } else {
      admin.initializeApp();
      logger.info("Firebase Admin initialized in node-service using default environment credentials.");
    }
  } catch (err) {
    logger.warn(`Firebase Admin initialization warning: ${err.message}`);
  }
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ detail: "Authorization header missing or malformed" });
  }

  const token = header.split(" ")[1];

  // 1. Try Local JWT Verification First
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: [process.env.JWT_ALGORITHM || "HS256"],
    });

    if (payload.sub) {
      req.user = { email: payload.sub };
      return next();
    }
  } catch (err) {
    // If it fails local verification, fall back to Firebase verification below
  }

  // 2. Fallback to Firebase Verification
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken.email) {
      return res.status(401).json({ detail: "Token email is missing" });
    }

    req.user = { email: decodedToken.email };
    next();
  } catch (err) {
    logger.warn(`Token verification failed: ${err.message}`);
    return res.status(401).json({ detail: `Invalid token: ${err.message}` });
  }
}

module.exports = requireAuth;
