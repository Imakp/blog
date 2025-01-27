// App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import AboutMe from "./components/AboutMe";
import BlogTimeline from "./components/BlogTimeline";
import Clock from "./components/Clock";
import Calendar from "./components/Calendar";
import SocialLinks from "./components/SocialLinks";
import Editor from "./components/Editor";
import PostView from "./components/PostView";

const blogData = [
  /* Your existing static blog data */
];

export default function BlogApp() {
  const [isDark, setIsDark] = useState(false);
  const [localBlogs, setLocalBlogs] = useState([]);

  useEffect(() => {
    const savedBlogs = JSON.parse(localStorage.getItem("blogs") || "[]");
    setLocalBlogs(savedBlogs);
  }, []);

  const mergedBlogData = () => {
    const yearMap = new Map();

    blogData.forEach((staticYear) => {
      yearMap.set(staticYear.year, [...staticYear.articles]);
    });

    localBlogs.forEach((blog) => {
      const date = new Date(blog.date);
      const year = date.getFullYear();
      const monthDay = `${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;

      if (!yearMap.has(year)) yearMap.set(year, []);
      yearMap.get(year).unshift({
        date: monthDay,
        title: blog.title,
        content: blog.content,
      });
    });

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, articles]) => ({
        year,
        articles: articles.sort((a, b) => new Date(b.date) - new Date(a.date)),
      }));
  };

  return (
    <Router>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={
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
                  <BlogTimeline blogData={mergedBlogData()} isDark={isDark} />
                </div>
              </div>
            }
          />

          <Route
            path="/Editor"
            element={<Editor isDark={isDark} setLocalBlogs={setLocalBlogs} />}
          />
          <Route path="/post/:id" element={<PostView isDark={isDark} />} />
        </Routes>
      </div>
    </Router>
  );
}
