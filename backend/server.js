const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const depositRoutes = require("./routes/depositRoutes");
const adminRoutes = require("./routes/adminRoutes");
const withdrawlRoutes = require("./routes/withdrawlRoutes")

const Admin = require("./models/Admin");

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/withdrawl", withdrawlRoutes);
app.use("/api/admin", adminRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Database connection
const PORT = process.env.PORT || 500;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    // Initialize default admin
    await initializeAdmin();

    // Start server after DB connection is successful
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Function to create a default admin if not exists
async function initializeAdmin() {
  try {
    const admin = await Admin.createDefaultAdmin();
    if (admin) {
      console.log("Default admin created successfully");
    } else {
      console.log("Super admin already exists");
    }
  } catch (error) {
    console.error("Failed to initialize admin:", error);
  }
}
