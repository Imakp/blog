import { motion } from "framer-motion";

export default function Calendar({ isDark }) {
  const today = new Date();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();

  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(year, today.getMonth(), 1).getDay();

  const days = [];
  let weeks = [];

  for (let i = 0; i < firstDay; i++) {
    weeks.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today.getDate();
    weeks.push(
      <div
        key={day}
        className={`flex items-center justify-center w-8 h-8 mx-auto ${
          isToday ? "ring-2 ring-gray-400 dark:ring-gray-500 rounded-full font-semibold" : ""
        }`}
      >
        {day}
      </div>
    );

    if (weeks.length % 7 === 0) {
      days.push(
        <div key={day} className="grid grid-cols-7 gap-1">
          {weeks}
        </div>
      );
      weeks = [];
    }
  }

  if (weeks.length > 0) {
    days.push(
      <div key="remaining-week" className="grid grid-cols-7 gap-1">
        {weeks}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md"
    >
      <div className="text-center font-semibold mb-2">
        {month} {year}
      </div>
      <div className="grid gap-1">
        <div className="grid grid-cols-7 gap-1 text-center text-sm opacity-70">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        {days}
      </div>
    </motion.div>
  );
}
