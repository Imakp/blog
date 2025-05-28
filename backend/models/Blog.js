const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, maxlength: 200 }, // Summary field
  slug: { type: String, unique: true },
  metaDescription: { type: String, required: true }, 
  keywords: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
  hidden: { type: Boolean, default: false },
});

blogSchema.pre("save", function (next) {
  // Trim and clean text fields
  this.title = (this.title || "").trim();
  this.metaDescription = (this.metaDescription || "").trim();
  this.keywords = (this.keywords || []).map((k) => k.trim()).filter((k) => k);
  
  // Handle summary - only auto-generate if not provided and this is a new document
  if (!this.summary && this.isNew) {
    // Strip HTML tags and get first 197 characters
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.summary = plainText.substring(0, 197) + (plainText.length > 197 ? '...' : '');
  }
  
  // If summary is provided, ensure it's properly trimmed and within limits
  if (this.summary) {
    this.summary = this.summary.trim().substring(0, 200);
  }

  // Generate slug
  const rawDate = this.createdAt || new Date();
  const datePart = rawDate.toISOString().replace(/:/g, "-").split(".")[0]; 
  const titleSlug = slugify(this.title, { lower: true, strict: true });
  
  // Only regenerate slug if it's a new document or title changed
  if (this.isNew || this.isModified('title')) {
    this.slug = `posts/${datePart}/${titleSlug}`;
  }
  
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
