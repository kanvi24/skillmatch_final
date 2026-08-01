const express = require("express");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/adminAuth");
const {
  createReview,
  listReviews,
  companyReviewSummary,
  deleteReview,
  adminReviewStats,
  adminDeleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/", listReviews); // public: anyone can read reviews
router.get("/company/:companyName/summary", companyReviewSummary);
router.post("/", requireAuth, createReview); // must be logged in to post a review
router.delete("/:id", requireAuth, deleteReview);

// Admin moderation — requireAuth first (decodes JWT), then requireAdmin
// (checks role against the shared users collection).
router.get("/admin/stats", requireAuth, requireAdmin, adminReviewStats);
router.delete("/admin/:id", requireAuth, requireAdmin, adminDeleteReview);

module.exports = router;
