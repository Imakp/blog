import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../Common/Navbar";
import AboutMe from "../Common/AboutMe";
import BlogTimeline from "./Sections/AdminBlogTimeline";
import Clock from "../Common/Clock";
import Calendar from "../Common/Calendar";
import SocialLinks from "../Common/SocialLinks";
import PostView from "../Common/PostView";
import SEO from "../Common/SEO";
import BlogForm from "./Sections/BlogForm";
import { Link } from "react-router-dom";
import ResponsiveBlogLayout from "../Common/ResponsiveBlogLayout";

const Admin = ({ isDark, setIsDark }) => {
  const [serverBlogs, setServerBlogs] = useState([]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?includeHidden=true");
      const data = await response.json();
      setServerBlogs(data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setServerBlogs([]);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

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
            <ResponsiveBlogLayout
              isDark={isDark}
              setIsDark={setIsDark}
              Navbar={Navbar}
              Clock={Clock}
              Calendar={Calendar}
              AboutMe={AboutMe}
              SocialLinks={SocialLinks}
              BlogTimeline={() => (
                <BlogTimeline
                  blogs={serverBlogs}
                  isDark={isDark}
                  refreshBlogs={fetchBlogs}
                />
              )}
            />

            {/* Floating Write Button */}
            <Link
              to="/admin/write"
              className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
              aria-label="Create new post"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          </>
        }
      />

      <Route
        path="write"
        element={
          <BlogForm
            isDark={isDark}
            setServerBlogs={setServerBlogs}
            refreshBlogs={fetchBlogs}
          />
        }
      />
      <Route path="/post/*" element={<PostView isDark={isDark} />} />
    </Routes>
  );
};

export default Admin;
