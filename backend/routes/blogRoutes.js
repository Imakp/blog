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
        "iframe",
        "span",
        "img",
      ],
      allowedAttributes: {
        a: ["href", "name", "target", "class"],
        div: ["data-youtube-video", "class"],
        iframe: [
          "src",
          "frameborder",
          "allowfullscreen",
          "allow",
          "width",
          "height",
          "class",
          "title", 
          "referrerpolicy",
          "web-share", 
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
      transformTags: {
        iframe: (tagName, attribs) => {
          if (
            attribs.src &&
            (attribs.src.includes("youtube.com") ||
              attribs.src.includes("youtu.be"))
          ) {
            return {
              tagName,
              attribs: {
                ...attribs,
                class: "w-full aspect-video rounded-lg my-4",
                frameborder: "0",
                allow:
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                allowfullscreen: "true",
                title: "YouTube video player",
                referrerpolicy: "strict-origin-when-cross-origin",
                width: "560",
                height: "315",
              },
            };
          }
          return { tagName, attribs };
        },
      },
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
    delete req.body.createdAt;
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
    }
    res.json({ message: "Blog deleted successfully", blog });
  })
);

router.patch(
  "/*/toggle-visibility",
  patchLimiter,
  asyncHandler(async (req, res) => {
    const slug = req.params[0];
    console.log("Toggle slug:", slug);
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
    console.log("Update slug:", slug);
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
    const slug = req.params[0];
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
