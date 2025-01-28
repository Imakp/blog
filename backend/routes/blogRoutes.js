// server/routes/blogRoutes.js
const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

// Create blog
router.post("/", async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single blog by slug
router.get("/*", async (req, res) => {
  // Changed from "/:slug*" to "/*"
  try {
    const slug = req.params[0]; // Get the entire path after /api/blogs/
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
