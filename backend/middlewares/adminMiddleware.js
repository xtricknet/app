const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized: Admin not found" });
    }

    // Check if the admin account is ACTIVE
    if (admin.status !== "ACTIVE") {
      return res.status(403).json({ message: "Access denied: Inactive or suspended account" });
    }

    // Attach admin data to request
    req.user = admin;
    
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Invalid or expired token", error });
  }
};

module.exports = adminMiddleware;
