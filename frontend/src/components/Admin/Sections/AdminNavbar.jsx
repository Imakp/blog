// components/Navbar.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";

export default function Navbar({ isDark, setIsDark }) {
  return (
    <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/">
          <h1 className="text-3xl font-bold">Ankit's Blog</h1>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <FaSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <FaMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
