// components/AboutMe.jsx
import { motion } from "framer-motion";

export default function AboutMe() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4">About Me</h2>
      <p className="leading-relaxed">
        Frontend architect passionate about reactive frameworks and modern web
        experiences. Building the future of web development with Solid.js and
        TypeScript. Open source contributor and tech educator.
      </p>
    </motion.div>
  );
}
