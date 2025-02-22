const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/emailUtil");
const generateReferralCode = require("../utils/generateReferralCode")
const JWT_SECRET = process.env.JWT_SECRET;
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes


// Signup Functionality
exports.signup = async (req, res) => {
  const { username, email, password, confirmPassword, referCode } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use. Please log in." });
    }

    let refBy = null;
    if (referCode) {
      const referredUser = await User.findOne({ referCode });
      if (!referredUser) {
        return res.status(400).json({ message: "Invalid referral code." });
      }
      refBy = referredUser._id;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + OTP_EXPIRY_TIME;

    const newUser = await User.create({
      username,
      email,
      password,  
      referCode: generateReferralCode(),
      refBy,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await sendEmail(email, "Verify Your Email", `Your OTP code is ${otp}.`);

    res.status(201).json({
      message: "Signup successful. OTP sent to your email for verification.",
      email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Functionality
exports.login = async (req, res) => {
  const { email, password } = req.body;


  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up." });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Account not verified. Complete signup process." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_EXPIRY_TIME;
    await user.save();

    await sendEmail(email, "Your Login OTP", `Your OTP code is ${otp}.`);

    res.status(200).json({
      message: "OTP sent to your email.",
      email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unified Verify OTP Function
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.otp = null;
    user.otpExpiry = null;

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
      
      return res.status(200).json({
        message: "Signup verified successfully.",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up." });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Account not verified. Complete signup process." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_EXPIRY_TIME;
    await user.save();

    // Send OTP via email
    await sendEmail(
      email, 
      "Password Reset OTP", 
      `Your OTP code for password reset is ${otp}. This code will expire in 10 minutes.`
    );

    res.status(200).json({
      message: "Password reset OTP sent to your email.",
      email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Verify OTP using a timing-safe comparison
    const isOtpValid =
      user.otp &&
      user.otpExpiry > Date.now() &&
      crypto.timingSafeEqual(Buffer.from(user.otp), Buffer.from(otp));

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Update user password and clear OTP
    user.password = newPassword; 
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Send confirmation email
    await sendEmail(
      email,
      "Password Reset Successful",
      "Your password has been successfully reset. If you did not initiate this change, please contact support immediately."
    );

    res.status(200).json({
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
