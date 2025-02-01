import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

const BlogTimeline = ({ blogs }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 w-full h-full pb-8 dark:bg-gray-900"
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
                          className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <span className="mr-4 text-gray-400 dark:text-gray-400">
                              {article.day}
                            </span>
                            <span className="text-gray-700 dark:text-gray-200">
                              -
                              <Link
                                to={`/post/${article.slug}`}
                                className="items-center hover:underline"
                              >
                                <span className="ml-2 dark:text-gray-300">
                                  {article.title}
                                </span>
                              </Link>
                            </span>
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
