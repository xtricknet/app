const jwt = require("jsonwebtoken");

const depositMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization"); // Read Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach user to req
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = depositMiddleware;
