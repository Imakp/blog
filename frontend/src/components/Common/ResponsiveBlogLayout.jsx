import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";

const ResponsiveBlogLayout = ({
  children,
  isDark,
  setIsDark,
  Navbar,
  Clock,
  Calendar,
  AboutMe,
  SocialLinks,
  BlogTimeline,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <h1 className="text-2xl font-bold dark:text-white">Ankit's Blog</h1>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <FaSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FaMoon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed top-0 left-0 z-40 h-[calc(100vh-0rem)] w-80 bg-white dark:bg-gray-900 shadow-lg pt-20"
          >
            <div className="p-8 space-y-8 overflow-y-auto h-full">
              <Clock />
              <Calendar />
              <AboutMe />
              <SocialLinks />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="flex flex-col lg:flex-row p-4 lg:p-12 gap-8">
        {/* Sidebar - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex lg:w-80 flex-col gap-8 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-12"
        >
          <Navbar isDark={isDark} setIsDark={setIsDark} />
          <Clock />
          <Calendar />
          <AboutMe />
          <SocialLinks />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 lg:overflow-y-auto lg:h-[calc(100vh-6rem)] no-scrollbar">
          <BlogTimeline />
        </div>
      </div>
    </div>
  );
};

export default ResponsiveBlogLayout;
