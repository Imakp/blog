import { useState, useEffect } from "react";
import Editor from "./Editor";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const BlogForm = ({ isDark, setIsDark, setServerBlogs, refreshBlogs }) => {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const processYouTubeEmbeds = (content) => {
    const youtubeRegex =
      /<iframe.*?src="(https:\/\/www\.youtube\.com\/embed\/[^"]+)".*?<\/iframe>/g;

    return content.replace(youtubeRegex, (match, src) => {
      console.log("Found YouTube iframe with src:", src);
      return `<div data-youtube-video="true"><iframe src="${src}"></iframe></div>`;
    });
  };

  useEffect(() => {
    if (editSlug) {
      const fetchBlog = async () => {
        try {
          const response = await fetch(`/api/blogs/${editSlug}`);
          const data = await response.json();

          setTitle(data.title);
          setMetaDescription(data.metaDescription);
          setKeywords(data.keywords.join(", "));

          console.log("Fetched content:", data.content);

          let processedContent = processYouTubeEmbeds(data.content);

          setContent(processedContent);
        } catch (error) {
          console.error("Error fetching blog:", error);
          setStatusMessage({
            type: "error",
            text: "Failed to load blog content",
          });
        }
      };
      fetchBlog();
    }
  }, [editSlug]);

  const logContentStructure = (content) => {
    console.log("Content structure check:");
    console.log(
      "- YouTube iframes:",
      (content.match(/<iframe.*?src=".*?youtube.*?".*?\/iframe>/g) || []).length
    );
    console.log(
      "- Sample YouTube match:",
      content.match(/<iframe.*?src=".*?youtube.*?".*?\/iframe>/g)
    );
  };

  const handlePublish = async () => {
    setStatusMessage({ type: "", text: "" });
    if (!title || !metaDescription || !keywords || !content) {
      setStatusMessage({ type: "error", text: "All fields are required!" });
      return;
    }

    console.log("Raw content before submit:", content);
    logContentStructure(content);

    setLoading(true);
    const postData = {
      title,
      content,
      metaDescription,
      keywords: keywords.split(",").map((k) => k.trim()),
    };

    try {
      let response;
      if (editSlug) {
        response = await fetch(`/api/blogs/${editSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });
      } else {
        response = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorData}`
        );
      }

      if (editSlug) {
        setStatusMessage({ type: "success", text: "Updated successfully!" });
        refreshBlogs();
        window.history.replaceState(null, "", "/write");
      } else {
        const savedPost = await response.json();
        setServerBlogs((prev) => [savedPost, ...prev]);
        setStatusMessage({ type: "success", text: "Published successfully!" });
      }

      setTitle("");
      setMetaDescription("");
      setKeywords("");
      setContent("");
    } catch (error) {
      console.error(editSlug ? "Update error:" : "Publish error:", error);
      setStatusMessage({
        type: "error",
        text: `Failed to ${editSlug ? "update" : "publish"} post. ${
          error.message
        }`,
      });
    } finally {
      setLoading(false);
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
            value={content}
            isDark={isDark}
            setIsDark={setIsDark}
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handlePublish}
            disabled={loading}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                {editSlug ? "Updating..." : "Publishing..."}
              </>
            ) : editSlug ? (
              "Update Post"
            ) : (
              "Publish Post"
            )}
          </button>
          {statusMessage.text && (
            <div
              className={`flex items-center gap-1 text-sm ${
                statusMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogForm;
