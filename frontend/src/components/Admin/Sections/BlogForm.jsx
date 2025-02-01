import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as Packer from "docx";
import { Document, Paragraph, TextRun } from "docx";
import Editor from "./Editor";
import { useSearchParams } from "react-router-dom";

const BlogForm = ({ setServerBlogs, refreshBlogs }) => {
  // ... rest of the component code remains the same
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (editSlug) {
      const fetchBlog = async () => {
        try {
          const response = await fetch(`/api/blogs/${editSlug}`);
          const data = await response.json();
          setTitle(data.title);
          setMetaDescription(data.metaDescription);
          setKeywords(data.keywords.join(", "));
          setContent(data.content);
        } catch (error) {
          console.error("Error fetching blog:", error);
        }
      };
      fetchBlog();
    }
  }, [editSlug]);

  const handleDownloadDoc = async () => {
    const doc = new Document();
    doc.addSection({
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 24 })],
        }),
        new Paragraph({
          children: [
            new TextRun(content.replace(/<[^>]+>/g, "")), // Simple HTML stripping
          ],
        }),
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title || "blog-post"}.docx`);
  };

  const debugContent = (content) => {
    console.log("Raw content before submit:", content);
    console.log("YouTube iframes:", content.match(/<iframe.*?\/iframe>/g));
  };

  const handlePublish = async () => {
    if (!title || !metaDescription || !keywords || !content) {
      alert("All fields are required!");
      return;
    }

    debugContent(content);

    const postData = {
      title,
      content,
      metaDescription,
      keywords: keywords.split(",").map((k) => k.trim()),
    };

    try {
      if (editSlug) {
        // Update existing post
        const response = await fetch(`/api/blogs/${editSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        alert("Updated successfully!");
        refreshBlogs();
        window.history.replaceState(null, "", "/write");
      } else {
        // Create new post
        const response = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const savedPost = await response.json();
        setServerBlogs((prev) => [savedPost, ...prev]);
        alert("Published successfully!");
      }

      // Reset form
      setTitle("");
      setMetaDescription("");
      setKeywords("");
      setContent("");
    } catch (error) {
      console.error(editSlug ? "Update error:" : "Publish error:", error);
      alert(`Failed to ${editSlug ? "update" : "publish"} post.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">
        {editSlug ? "Edit Blog Post" : "Create New Blog Post"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Blog Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter blog title"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Meta Description</label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter meta description for SEO"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Comma-separated keywords (e.g., tech, web development)"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Blog Content</label>
          <Editor
            onContentChange={setContent}
            showPublishButton={false}
            value={content} // Add this line
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleDownloadDoc}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Download as DOCX
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {editSlug ? "Update Post" : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;
