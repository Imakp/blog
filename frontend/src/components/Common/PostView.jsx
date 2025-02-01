import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "./SEO";

const PostView = () => {
  const { "*": slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const encodedSlug = encodeURIComponent(slug);
        const response = await fetch(`/api/blogs/${encodedSlug}`);
        if (!response.ok) throw new Error("Post not found");
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [slug]);

  if (!post)
    return (
      <div className="p-8 text-gray-600 dark:text-gray-400">
        Loading post...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen p-6 md:p-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 px-4 py-2 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        ← Back
      </button>

      <SEO
        title={post.title}
        description={post.metaDescription}
        keywords={post.keywords?.join(", ")}
      />
      <article className="max-w-3xl mx-auto prose lg:prose-xl dark:prose-invert">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-sm opacity-75 mb-8 dark:text-gray-400">
          Posted on {new Date(post.createdAt).toLocaleDateString()}
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </motion.div>
  );
};

export default PostView;
