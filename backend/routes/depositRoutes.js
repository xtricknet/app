const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middlewares/adminMiddleware");
const depositMiddleware = require("../middlewares/depositMiddleware");
const depositController = require("../controllers/depositController");

//Public route to get deposit settings
router.get("/deposit-settings", depositController.getDepositSettings);

// User deposit actions (No admin check required)
router.post("/create", depositMiddleware, depositController.createDeposit);
router.post("/confirm/:depositId", depositMiddleware, depositController.confirmTransaction);
router.get("/history/:userId",depositMiddleware, depositController.getDepositHistory);
router.get("/status/:depositId", depositMiddleware, depositController.getDepositStatus);

// Admin deposit management (Require admin login)
router.get("/all", adminMiddleware, depositController.getAllDeposits);
router.post("/approve/:depositId", adminMiddleware, depositController.approveDeposit);
router.post("/reject/:depositId", adminMiddleware, depositController.rejectDeposit);

module.exports = router;
