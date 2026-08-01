/**
 * Covers syllabus topics: "Express JS Fundamentals", "Express - State
 * Management and API", and "MongoDB - Queries and Operators".
 */
const Review = require("../models/Review");
const logger = require("../utils/logger");

// Escapes regex metacharacters so user-supplied company names can't be
// interpreted as regex syntax (e.g. "C++", "A.I. Corp").
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST /api/reviews  - create a review
async function createReview(req, res) {
  try {
    const { companyName, rating, title, comment, pros, cons } = req.body;

    if (!companyName || !rating || !title || !comment) {
      return res.status(400).json({ detail: "companyName, rating, title and comment are required" });
    }

    const review = await Review.create({
      companyName,
      userId: req.user.email, // from JWT middleware
      userName: req.body.userName || req.user.email,
      rating,
      title,
      comment,
      pros,
      cons,
    });

    logger.info(`Review created for ${companyName} by ${req.user.email}`);
    return res.status(201).json(review);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

// GET /api/reviews?company=Acme&minRating=4&sort=-createdAt
// Demonstrates Mongo query operators: $gte, $regex, sorting, pagination.
async function listReviews(req, res) {
  try {
    const { company, minRating, page = 1, limit = 10 } = req.query;

    const query = {};
    if (company) {
      query.companyName = { $regex: escapeRegex(company), $options: "i" };
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    return res.json({ total, page: Number(page), limit: Number(limit), reviews });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

// GET /api/reviews/company/:companyName/summary
// Demonstrates the Mongo aggregation pipeline ($match, $group, $avg).
async function companyReviewSummary(req, res) {
  try {
    const { companyName } = req.params;

    const summary = await Review.aggregate([
      { $match: { companyName: { $regex: `^${escapeRegex(companyName)}$`, $options: "i" } } },
      {
        $group: {
          _id: "$companyName",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          maxRating: { $max: "$rating" },
          minRating: { $min: "$rating" },
        },
      },
    ]);

    if (summary.length === 0) {
      return res.json({ companyName, averageRating: 0, totalReviews: 0 });
    }

    return res.json(summary[0]);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

// DELETE /api/reviews/:id - only the review's author can delete it
async function deleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ detail: "Review not found" });
    }
    if (review.userId !== req.user.email) {
      return res.status(403).json({ detail: "You can only delete your own review" });
    }
    await review.deleteOne();
    return res.json({ detail: "Review deleted" });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

// GET /api/reviews/admin/stats
// Admin-only platform-wide moderation view. Demonstrates a fuller
// aggregation pipeline: $group across ALL companies (not just one),
// $avg, $sum, and $sort together.
async function adminReviewStats(req, res) {
  try {
    const perCompany = await Review.aggregate([
      {
        $group: {
          _id: "$companyName",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { totalReviews: -1 } },
    ]);

    const totalReviews = await Review.countDocuments();

    return res.json({ totalReviews, perCompany });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

// DELETE /api/reviews/admin/:id - admin can remove ANY review, not just their own
// (e.g. moderating spam/abusive content), unlike the author-only deleteReview above.
async function adminDeleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ detail: "Review not found" });
    }
    await review.deleteOne();
    return res.json({ detail: "Review removed by admin" });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

module.exports = {
  createReview,
  listReviews,
  companyReviewSummary,
  deleteReview,
  adminReviewStats,
  adminDeleteReview,
};
