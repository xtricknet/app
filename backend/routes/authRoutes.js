const express = require("express");
const { signup, verifyOtp, login, forgotPassword, resetPassword} = require("../controllers/authController");

const router = express.Router();

/**
 * @route   POST /auth/signup
 * @desc    Register a new user and send OTP
 */
router.post("/signup", signup);

/**
 * @route   POST /auth/login
 * @desc    Login a user and send OTP
 */
router.post("/login", login);

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP for signup or login
 */
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
