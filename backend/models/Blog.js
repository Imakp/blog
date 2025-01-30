const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, unique: true },
  metaDescription: { type: String, required: true }, // Required here
  keywords: { type: [String], required: true }, // Required here
  createdAt: { type: Date, default: Date.now },
  hidden: { type: Boolean, default: false },
});

blogSchema.pre("save", function (next) {
  this.title = (this.title || "").trim();
  this.metaDescription = (this.metaDescription || "").trim();
  this.keywords = (this.keywords || []).map((k) => k.trim()).filter((k) => k);

  const rawDate = this.createdAt || new Date();
  const datePart = rawDate.toISOString().replace(/:/g, "-").split(".")[0]; 
  const titleSlug = slugify(this.title, { lower: true, strict: true });
  this.slug = `posts/${datePart}/${titleSlug}`;
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
