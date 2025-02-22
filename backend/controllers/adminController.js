const Admin = require("../models/Admin");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config(); 

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env");
      return res.status(500).json({ message: "Internal server error" });
    }

    const token = jwt.sign(
      { id: admin._id, adminLevel: admin.adminLevel },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });


    res.json({
      message: "Login successful",
      token, 
      admin: { email: admin.email, adminLevel: admin.adminLevel },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.logoutAdmin = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

