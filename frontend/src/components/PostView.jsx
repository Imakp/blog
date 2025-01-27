import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const PostView = ({ isDark }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("blogs") || "[]");
    const foundPost = savedPosts.find((post) => post.id === id);
    setPost(foundPost);
  }, [id]);

  if (!post)
    return (
      <div className={`p-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        Loading post...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen p-6 md:p-12 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <article className="max-w-3xl mx-auto prose lg:prose-xl dark:prose-invert">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-sm opacity-75 mb-8">
          Posted on {new Date(post.date).toLocaleDateString()}
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </motion.div>
  );
};

export default PostView;
