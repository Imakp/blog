// App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Blog from "./components/Blog/Blog";
import { HelmetProvider } from "react-helmet-async";

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/*" element={<Blog />} />

            <Route
              path="/admin/*"
              element={<div>Admin Panel Coming Soon</div>}
            />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}
