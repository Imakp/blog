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
      <p className="leading-relaxed dark:text-gray-300">
        CSE'25 @ PESCE | Intern @TEN | Passionate about building Al agents,
        currently focused on creating innovative Al solutions. Active hackathon
        participant with a drive for impactful projects.
      </p>
    </motion.div>
  );
}
