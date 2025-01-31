// // server/routes/blogRoutes.js
// const express = require("express");
// const router = express.Router();
// const Blog = require("../models/Blog");

// // Create blog
// router.post("/", async (req, res) => {
//   try {
//     const blog = new Blog(req.body);
//     await blog.save();
//     res.status(201).json(blog);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Get all blogs
// router.get("/", async (req, res) => {
//   try {
//     const blogs = await Blog.find().sort({ createdAt: -1 });
//     res.json(blogs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get single blog by slug
// router.get("/*", async (req, res) => {
//   // Changed from "/:slug*" to "/*"
//   try {
//     const slug = req.params[0]; // Get the entire path after /api/blogs/
//     const blog = await Blog.findOne({ slug });
//     if (!blog) return res.status(404).json({ message: "Blog not found" });
//     res.json(blog);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const rateLimit = require("express-rate-limit");
const sanitizeHtml = require("sanitize-html");
const slugify = require("slugify");

const sanitizeContent = (req, res, next) => {
  if (req.body.content) {
    req.body.content = sanitizeHtml(req.body.content, {
      allowedTags: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "p",
        "a",
        "ul",
        "ol",
        "nl",
        "li",
        "b",
        "i",
        "strong",
        "em",
        "strike",
        "code",
        "hr",
        "br",
        "div",
        "table",
        "thead",
        "caption",
        "tbody",
        "tr",
        "th",
        "td",
        "pre",
        "iframe", // Added for YouTube embeds
        "span", // Added for text styling
        "img", // Added for image support
      ],
      allowedAttributes: {
        a: ["href", "name", "target", "class"],
        div: ["class", "data-type"],
        iframe: [
          "src",
          "class",
          "frameborder",
          "allowfullscreen",
          "width",
          "height",
        ],
        span: ["style", "class"],
        img: ["src", "alt", "class", "width", "height"],
        td: ["colspan", "rowspan"],
        th: ["colspan", "rowspan"],
        div: ["class", "data-type"],
      },
      allowedIframeHostnames: ["www.youtube.com", "youtube.com", "youtu.be"],
      allowedClasses: {
        div: ["*"],
        span: ["*"],
        iframe: ["*"],
        img: ["*"],
        a: ["*"],
      },
      allowedSchemes: ["http", "https", "mailto", "tel"],
    });
  }
  next();
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const postLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const deleteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const patchLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const putLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post(
  "/",
  postLimiter,
  sanitizeContent,
  asyncHandler(async (req, res) => {
    // Inside the POST route
    delete req.body.createdAt; // Prevent client from setting date
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Add query to exclude hidden posts by default
    const query = {};
    if (req.query.includeHidden !== "true") {
      query.hidden = { $ne: true };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(query),
    ]);

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

router.delete(
  "/*",
  deleteLimiter,
  asyncHandler(async (req, res) => {
    const slug = req.params[0];
    const blog = await Blog.findOneAndDelete({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    } // Remove accidental 'delete req.body.createdAt' here
    res.json({ message: "Blog deleted successfully", blog });
  })
);

router.patch(
  "/*/toggle-visibility",
  patchLimiter,
  asyncHandler(async (req, res) => {
    const slug = req.params[0];
    console.log("Toggle slug:", slug); // Debug log
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    blog.hidden = !blog.hidden;
    await blog.save();
    res.json(blog);
  })
);

router.put(
  "/*",
  putLimiter,
  sanitizeContent,
  asyncHandler(async (req, res) => {
    const slug = req.params[0];
    console.log("Update slug:", slug); // Debug log
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const originalTitle = blog.title;
    Object.assign(blog, req.body);

    if (req.body.title && req.body.title.trim() !== originalTitle.trim()) {
      const datePart = blog.createdAt.toISOString().split("T")[0];
      const titleSlug = slugify(req.body.title.trim(), {
        lower: true,
        strict: true,
      });
      blog.slug = `posts/${datePart}/${titleSlug}`;
    }

    await blog.save();
    res.json(blog);
  })
);

router.get(
  "/*",
  asyncHandler(async (req, res) => {
    const slug = req.params[0]; // Get full path
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  })
);

router.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
    errors: error.errors || undefined,
  });
});

module.exports = router;
