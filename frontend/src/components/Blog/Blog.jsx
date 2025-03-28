import React, { useState, useEffect, useCallback } from "react";
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
import Loader from "../Loader"; // Assuming Loader component exists

const Blog = ({ isDark, setIsDark }) => {
  const [serverBlogs, setServerBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchBlogs = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      // Use page and limit query parameters
      const response = await fetch(`/api/blogs?page=${pageNum}&limit=10`);
      const data = await response.json();
      setServerBlogs((prevBlogs) =>
        pageNum === 1 ? data.blogs || [] : [...prevBlogs, ...(data.blogs || [])]
      );
      setTotalPages(data.pagination?.pages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      // Optionally handle error state for UI
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [initialLoad]); // Add initialLoad dependency

  // Initial fetch
  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]); // fetchBlogs is memoized by useCallback

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      fetchBlogs(page + 1);
    }
  };

  // Show loader only on initial load
  if (initialLoad) {
    return <Loader />;
  }

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
                <>
                  <BlogTimeline blogs={serverBlogs} isDark={isDark} />
                  {page < totalPages && (
                    <div className="flex justify-center mt-4 sm:mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                      >
                        {loading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
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
