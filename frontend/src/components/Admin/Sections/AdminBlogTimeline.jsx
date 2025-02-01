import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

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
      className="flex-1 w-full h-full pb-8"
    >
      {processedData.map((yearData) => (
        <div key={yearData.year} className="mb-8">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => toggleYear(yearData.year)}
          >
            <div className="flex items-center">
              <div className="mr-4">
                {expandedYears[yearData.year] ? "▼" : "▶"}
              </div>
              <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                {yearData.year}
              </h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {yearData.count} articles
            </span>
          </motion.div>

          {expandedYears[yearData.year] && (
            <div className="ml-8">
              {yearData.months.map((monthData) => (
                <div key={monthData.yearMonth} className="mb-6">
                  <motion.div
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => toggleMonth(monthData.yearMonth)}
                  >
                    <div className="flex items-center">
                      <div className="mr-4">
                        {expandedMonths[monthData.yearMonth] ? "▼" : "▶"}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                        {monthData.month}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {monthData.count} articles
                    </span>
                  </motion.div>

                  {expandedMonths[monthData.yearMonth] && (
                    <div className="ml-8">
                      {monthData.articles.map((article, index) => (
                        <motion.div
                          key={`${monthData.yearMonth}-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <span className="mr-4 text-gray-400 dark:text-gray-500">
                              {article.day}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              -
                              <Link
                                to={`/post/${article.slug}`}
                                className="items-center hover:underline"
                              >
                                <span className="ml-2 dark:text-gray-200">
                                  {article.title}
                                </span>
                              </Link>
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            <Link
                              to={`/admin/write?edit=${article.slug}`}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="Edit"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </Link>

                            <button
                              onClick={() =>
                                handleToggleVisibility(article.slug)
                              }
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title={article.hidden ? "Unhide" : "Hide"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {article.hidden ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                  />
                                ) : (
                                  <>
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </>
                                )}
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDelete(article.slug)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500"
                              title="Delete"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
