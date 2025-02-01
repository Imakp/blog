import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../Common/Navbar";
import AboutMe from "../Common/AboutMe";
import BlogTimeline from "./Sections/BlogTimeline";
import Clock from "../Common/Clock";
import Calendar from "../Common/Calendar";
import SocialLinks from "../Common/SocialLinks";
import PostView from "../Common/PostView";
import SEO from "../Common/SEO";
import ResponsiveBlogLayout from "../Common/ResponsiveBlogLayout";

const Blog = ({ isDark, setIsDark }) => {
  const [serverBlogs, setServerBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs");
        const data = await response.json();
        setServerBlogs(data.blogs || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setServerBlogs([]);
      }
    };
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
                <BlogTimeline blogs={serverBlogs} isDark={isDark} />
              )}
            />
          </>
        }
      />
      <Route path="/post/*" element={<PostView isDark={isDark} />} />
    </Routes>
  );
};

export default Blog;
