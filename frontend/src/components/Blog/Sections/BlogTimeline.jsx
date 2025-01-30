import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

const BlogTimeline = ({ blogs, isDark }) => {
  // Process data to group by year and month with counts
  const processedData = useMemo(() => {
    const grouped = blogs.reduce(
      // Changed blogData to blogs
      (acc, blog) => {
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

        let monthEntry = yearEntry.months.find(
          (m) => m.yearMonth === yearMonth
        );
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
      },
      [] // Corrected initial value to empty array
    );

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

  // State initialization with all sections open
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    // Initialize all years and months as expanded
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 w-full h-full pb-8" // Changed to full width/height
    >
      {processedData.map((yearData) => (
        <div key={yearData.year} className="mb-8">
          {/* Year Header */}
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className={`flex items-center justify-between cursor-pointer p-4 rounded-lg ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
            onClick={() => toggleYear(yearData.year)}
          >
            <div className="flex items-center">
              <div
                className={`mr-4 ${expandedYears[yearData.year] ? "▼" : "▶"}`}
              >
                {expandedYears[yearData.year] ? "▼" : "▶"}
              </div>
              <h2
                className={`text-3xl font-bold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {yearData.year}
              </h2>
            </div>
            <span
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {yearData.count} articles
            </span>
          </motion.div>

          {/* Months Container */}
          {expandedYears[yearData.year] && (
            <div className="ml-8">
              {yearData.months.map((monthData) => (
                <div key={monthData.yearMonth} className="mb-6">
                  {/* Month Header */}
                  <motion.div
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className={`flex items-center justify-between cursor-pointer p-3 rounded-lg ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleMonth(monthData.yearMonth)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`mr-4 ${
                          expandedMonths[monthData.yearMonth] ? "▼" : "▶"
                        }`}
                      >
                        {expandedMonths[monthData.yearMonth] ? "▼" : "▶"}
                      </div>
                      <h3
                        className={`text-xl font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {monthData.month}
                      </h3>
                    </div>
                    <span
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {monthData.count} articles
                    </span>
                  </motion.div>

                  {/* Articles List */}
                  {expandedMonths[monthData.yearMonth] && (
                    <div className="ml-8">
                      {monthData.articles.map((article, index) => (
                        <motion.div
                          key={`${monthData.yearMonth}-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-3 rounded-lg ${
                            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                          }`}
                        >
                          <span
                            className={`mr-4 ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {article.day}
                          </span>
                          <span
                            className={`${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            -
                            <Link
                              to={`/post/${article.slug}`}
                              className="items-center hover:underline"
                            >
                              <span className="ml-2">{article.title}</span>
                            </Link>
                          </span>
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
