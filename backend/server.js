const express = require("express");
const cors = require("cors");
const marksRoutes = require("./routes/marksRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resultRoutes = require("./routes/resultRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const certificateRoutes =
require("./routes/certificateRoutes");

require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Connect DB FIRST
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("ID + Mobile Auth Backend Running 🚀");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/marks", require("./routes/marksRoutes"));
//app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/admin", marksRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/registration", registrationRoutes);
app.use(
  "/api/certificate",
  certificateRoutes
);

// Start server LAST
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});