// server/models/Blog.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, unique: true },
  metaDescription: { type: String, required: true }, // Required here
  keywords: { type: [String], required: true }, // Required here
  createdAt: { type: Date, default: Date.now },
});

blogSchema.pre("save", function (next) {
  const datePart = this.createdAt.toISOString().split("T")[0];
  const titleSlug = slugify(this.title, { lower: true, strict: true });
  this.slug = `posts/${datePart}/${titleSlug}`;
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
