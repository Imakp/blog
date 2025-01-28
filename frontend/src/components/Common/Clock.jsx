// components/Clock.jsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Clock({ isDark }) {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatOptions = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: !is24Hour,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 rounded-lg ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-md`}
    >
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">
          {time.toLocaleTimeString(undefined, formatOptions)}
        </span>
        <button
          onClick={() => setIs24Hour(!is24Hour)}
          className={`px-2 py-1 rounded ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          {is24Hour ? "24h" : "12h"}
        </button>
      </div>
    </motion.div>
  );
}
