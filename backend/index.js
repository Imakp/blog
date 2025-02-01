const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const blogRoutes = require("./routes/blogRoutes");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/blogs", blogRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
