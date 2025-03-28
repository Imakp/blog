import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
import { LogOut, Plus } from "lucide-react";

const Admin = ({ isDark, setIsDark }) => {
  const [serverBlogs, setServerBlogs] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/blogs?includeHidden=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

            <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
              <Link
                to="/admin/write"
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                aria-label="Create new post"
              >
                <Plus className="h-6 w-6" />
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </>
        }
      />

      <Route
        path="write"
        element={
          <BlogForm
            isDark={isDark}
            setIsDark={setIsDark}
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
