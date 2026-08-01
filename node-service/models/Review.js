/**
 * Covers syllabus topic: "MongoDB - Queries and Operators" (via Mongoose)
 * and "Mongoose & MERN Integration".
 */
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, index: true },
    userId: { type: String, required: true }, // links back to the Django/Mongo user _id
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 120 },
    comment: { type: String, required: true, maxlength: 2000 },
    pros: { type: String, default: "" },
    cons: { type: String, default: "" },
  },
  { timestamps: true } // adds createdAt / updatedAt
);

// Useful compound index for the most common query: reviews for a company, newest first
reviewSchema.index({ companyName: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
