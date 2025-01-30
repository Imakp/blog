import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Sections/AdminNavbar";
import AboutMe from "../Common/AboutMe";
import BlogTimeline from "./Sections/AdminBlogTimeline";
import Clock from "../Common/Clock";
import Calendar from "../Common/Calendar";
import SocialLinks from "../Common/SocialLinks";
// import Editor from "./Sections/Editor";
import PostView from "../Common/PostView";
import SEO from "../Common/SEO";
import BlogForm from "./Sections/BlogForm";

const Admin = ({ isDark, setIsDark }) => {
  // const [isDark, setIsDark] = useState(false);
  const [serverBlogs, setServerBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs");
        const data = await response.json();
        // Check if data has pagination structure (from api.js)
        setServerBlogs(data.blogs || []); // Access the blogs array
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setServerBlogs([]); // Ensure array fallback
      }
    };
    fetchBlogs();
  }, []);

  const processedBlogData = () => {
    const yearMap = new Map();

    serverBlogs.forEach((blog) => {
      const date = new Date(blog.createdAt);
      const year = date.getFullYear();
      const monthDay = `${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;

      if (!yearMap.has(year)) yearMap.set(year, []);
      yearMap.get(year).push({
        date: monthDay,
        title: blog.title,
        content: blog.content,
        slug: blog.slug,
      });
    });

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, articles]) => ({
        year,
        articles: articles.sort((a, b) => b.date.localeCompare(a.date)),
      }));
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <SEO
              title="Ankit's Blog | Modern Web Development Insights"
              description="Explore articles about frontend development, reactive frameworks, and web architecture."
              keywords="web development, JavaScript, TypeScript, Solid.js, blog"
            />
            <div className="flex flex-col lg:flex-row p-6 lg:p-12 gap-8 lg:gap-12 min-h-screen">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-80 flex flex-col gap-8 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-0"
              >
                <Navbar isDark={isDark} setIsDark={setIsDark} />
                <Clock isDark={isDark} />
                <Calendar isDark={isDark} />
                <AboutMe isDark={isDark} />
                <SocialLinks isDark={isDark} />
              </motion.div>

              <div className="flex-1 lg:overflow-y-auto lg:h-[calc(100vh-6rem)] no-scrollbar">
                <BlogTimeline blogs={serverBlogs} isDark={isDark} />
              </div>
            </div>
          </>
        }
      />

      <Route
        path="/write"
        element={<BlogForm isDark={isDark} setServerBlogs={setServerBlogs} />}
      />
      <Route path="/post/*" element={<PostView isDark={isDark} />} />
    </Routes>
  );
};

export default Admin;
