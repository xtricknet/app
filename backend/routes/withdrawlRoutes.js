const express = require('express');

const { verifyToken } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { getAllWithdrawals, getWithdrawalHistory, createWithdrawal, rejectWithdrawal, approveWithdrawal } = require("../controllers/withdrawController");


const router = express.Router();

// Create a withdrawal (User Route)

router.get("/history/:userId", verifyToken, getWithdrawalHistory);
router.post('/create', verifyToken, createWithdrawal);


//Admin Only
router.post('/all', getAllWithdrawals);
router.post('/approve/:withdrawlId',adminMiddleware, approveWithdrawal);
router.post('/reject/:withdrawlId',adminMiddleware, rejectWithdrawal);




module.exports = router;