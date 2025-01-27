import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

const BlogTimeline = ({ blogData, isDark }) => {
  // Process data to group by year and month with counts
  const processedData = useMemo(() => {
    return blogData
      .reduce((acc, yearEntry) => {
        const year = yearEntry.year;
        let yearArticleCount = 0;

        const monthsMap = yearEntry.articles.reduce((monthAcc, article) => {
          const [monthNumber, day] = article.date.split("-");
          const month = new Date(year, monthNumber - 1).toLocaleString(
            "default",
            { month: "long" }
          );
          const yearMonth = `${year}-${monthNumber}`;

          if (!monthAcc[yearMonth]) {
            monthAcc[yearMonth] = {
              month,
              articles: [],
              count: 0,
            };
          }
          monthAcc[yearMonth].articles.push({ ...article, day });
          monthAcc[yearMonth].count++;
          yearArticleCount++;

          return monthAcc;
        }, {});

        acc.push({
          year,
          count: yearArticleCount,
          months: Object.entries(monthsMap)
            .map(([key, value]) => ({
              ...value,
              yearMonth: key,
            }))
            .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)),
        });
        return acc;
      }, [])
      .sort((a, b) => b.year - a.year);
  }, [blogData]);

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
                          <Link
                            to={`/post/${article.id}`}
                            className="flex items-center hover:underline"
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
                              - {article.title}
                            </span>
                          </Link>
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
