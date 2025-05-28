import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEdit, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";

const BlogTimeline = ({ blogs, isDark, refreshBlogs }) => {
  const processedData = useMemo(() => {
    const grouped = blogs.reduce((acc, blog) => {
      const date = new Date(blog.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;
      const day = date.getDate();
      const time = date.getTime();

      let yearEntry = acc.find((y) => y.year === year);
      if (!yearEntry) {
        yearEntry = { year, count: 0, months: [] };
        acc.push(yearEntry);
      }

      let monthEntry = yearEntry.months.find((m) => m.yearMonth === yearMonth);
      if (!monthEntry) {
        monthEntry = {
          yearMonth,
          month: date.toLocaleString("default", { month: "long" }),
          articles: [],
          count: 0,
        };
        yearEntry.months.push(monthEntry);
      }

      monthEntry.articles.push({
        ...blog,
        day: day.toString(),
        time,
        date,
      });

      monthEntry.count++;
      yearEntry.count++;

      return acc;
    }, []);

    grouped.sort((a, b) => b.year - a.year);

    grouped.forEach((yearEntry) => {
      yearEntry.months.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
    });

    grouped.forEach((yearEntry) => {
      yearEntry.months.forEach((monthEntry) => {
        monthEntry.articles.sort((a, b) => b.time - a.time);
      });
    });

    return grouped;
  }, [blogs]);

  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    const years = {};
    const months = {};
    processedData.forEach((yearData) => {
      years[yearData.year] = true;
      yearData.months.forEach((month) => {
        months[month.yearMonth] = true;
      });
    });
    setExpandedYears(years);
    setExpandedMonths(months);
  }, [processedData]);

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (yearMonth) => {
    setExpandedMonths((prev) => ({ ...prev, [yearMonth]: !prev[yearMonth] }));
  };

  const handleDelete = async (slug) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/blogs/${slug}`, {
          method: "DELETE",
        });
        if (response.ok) refreshBlogs();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleToggleVisibility = async (slug) => {
    try {
      const response = await fetch(`/api/blogs/${slug}/toggle-visibility`, {
        method: "PATCH",
      });
      if (response.ok) refreshBlogs();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 w-full h-full pb-8 px-4 sm:px-6 lg:px-8"
    >
      {processedData.map((yearData) => (
        <div key={yearData.year} className="mb-4 sm:mb-8">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center justify-between cursor-pointer p-2 sm:p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => toggleYear(yearData.year)}
          >
            <div className="flex items-center">
              <div className="mr-2 sm:mr-4 text-sm sm:text-base">
                {expandedYears[yearData.year] ? "▼" : "▶"}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300">
                {yearData.year}
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {yearData.count} articles
            </span>
          </motion.div>

          {expandedYears[yearData.year] && (
            <div className="ml-2 sm:ml-4 md:ml-8">
              {yearData.months.map((monthData) => (
                <div key={monthData.yearMonth} className="mb-2 sm:mb-4 md:mb-6">
                  <motion.div
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="flex items-center justify-between cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => toggleMonth(monthData.yearMonth)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2 sm:mr-4 text-sm sm:text-base">
                        {expandedMonths[monthData.yearMonth] ? "▼" : "▶"}
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400">
                        {monthData.month}
                      </h3>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {monthData.count} articles
                    </span>
                  </motion.div>

                  {expandedMonths[monthData.yearMonth] && (
                    <div className="ml-2 sm:ml-4 md:ml-8">
                      {monthData.articles.map((article, index) => (
                        <motion.div
                          key={`${monthData.yearMonth}-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0"
                        >
                          <div className="flex flex-col w-full sm:w-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center flex-nowrap">
                              <span className="mb-1 sm:mb-0 sm:mr-4 text-sm text-gray-400 dark:text-gray-500">
                                {article.day}
                              </span>
                              <span className="text-gray-700 dark:text-gray-300 flex items-center">
                                <span className="hidden sm:inline">-</span>
                                <Link
                                  to={`/post/${article.slug}`}
                                  className="sm:ml-2 hover:underline line-clamp-1"
                                >
                                  {article.title}
                                </Link>
                              </span>
                            </div>
                            
                            {/* Display the summary */}
                            {article.summary && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-0 sm:ml-10 line-clamp-2">
                                {article.summary}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Link
                              to={`/admin/write?edit=${article.slug}`}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4 stroke-current" />
                            </Link>

                            <button
                              onClick={() =>
                                handleToggleVisibility(article.slug)
                              }
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title={article.hidden ? "Unhide" : "Hide"}
                            >
                              {article.hidden ? (
                                <FiEyeOff className="w-4 h-4 stroke-current" />
                              ) : (
                                <FiEye className="w-4 h-4 stroke-current" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(article.slug)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4 stroke-current" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

export default BlogTimeline;
