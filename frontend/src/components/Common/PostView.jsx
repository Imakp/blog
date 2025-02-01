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
      <div className="p-4 md:p-8 text-gray-600 dark:text-gray-400 text-sm md:text-base">
        Loading post...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen px-4 py-6 md:p-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-x-hidden"
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-4 md:top-4 md:left-4 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm md:text-base z-10"
      >
        ← Back
      </button>

      <SEO
        title={post.title}
        description={post.metaDescription}
        keywords={post.keywords?.join(", ")}
      />
      <article className="max-w-3xl mx-auto prose prose-sm sm:prose-base lg:prose-xl dark:prose-invert prose-img:w-full prose-img:h-auto prose-img:rounded-lg mt-16 md:mt-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4">
          {post.title}
        </h1>
        <div className="text-xs md:text-sm opacity-75 mb-6 md:mb-8 dark:text-gray-400">
          Posted on {new Date(post.createdAt).toLocaleDateString()}
        </div>
        <div
          className="overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </motion.div>
  );
};

export default PostView;
