const express = require("express");
const { getUserDetails, updateUserProfile, getUserTransactions, getAllOffers, getReferralStats } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");
const depositController = require("../controllers/depositController")
const {getPaymentMethods, addUpiId, addBankAccount, deleteUpiId, deleteBankAccount} = require("../controllers/withdrawController");


const router = express.Router();

// User routes
router.get("/me", verifyToken, getUserDetails);
router.put("/me", verifyToken, updateUserProfile);
router.get("/transactions", verifyToken, getUserTransactions);
router.get("/status/:depositId", verifyToken, depositController.getDepositStatus);


//Withdrawal user routes
router.get('/methods', verifyToken, getPaymentMethods);
router.post('/upi', verifyToken, addUpiId);
router.post('/bank', verifyToken, addBankAccount);
router.delete('/upi/:id', verifyToken, deleteUpiId);
router.delete('/bank/:id', verifyToken, deleteBankAccount);

//Get Offers for users
router.get('/offers/:userId', verifyToken, getAllOffers);

//Get referrals ststus
router.get('/referrals', verifyToken, getReferralStats);





module.exports = router;