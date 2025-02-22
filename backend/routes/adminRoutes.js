const express = require("express");
const { adminLogin, logoutAdmin } = require("../controllers/adminController");
const {getAllUsers, getAllDeposits, getAllWithdrawals, getAllTransactions, getDepositSettings} = require("../controllers/adminActionController");
const adminMiddleware = require("../middlewares/adminMiddleware");
const depositController = require("../controllers/depositController");
const withdrawController = require("../controllers/withdrawController")
const referralLevelController = require('../controllers/referralLevelController');
const {
    createOffer,
    updateOffer,
    getAllOffers,
    deleteOffer} = require('../controllers/OffersController');

const userController = require("../controllers/userController");

const router = express.Router();

// Admin Login Route
router.post("/login", adminLogin);
router.post("/logout", logoutAdmin); 


// Get all the details by admin

router.get("/users", adminMiddleware, getAllUsers);
router.get("/deposits", adminMiddleware, getAllDeposits);
router.get("/withdrawals", adminMiddleware, getAllWithdrawals);
router.get("/transactions", adminMiddleware, getAllTransactions);


router.get("/settings", adminMiddleware, getDepositSettings);
router.put("/settings", adminMiddleware, depositController.updateDepositSettings);
router.get("/withdrawal-settings", adminMiddleware, withdrawController.getWithdrawalSettings);
router.put("/withdrawal-settings", adminMiddleware, withdrawController.updateWithdrawalSettings);


// Route to get all referral levels and system status and update it
router.get('/levels', adminMiddleware, referralLevelController.getLevels);
router.put('/levels', adminMiddleware, referralLevelController.updateLevels);

//Routes for user Actions

router.put('/users/:userId', adminMiddleware, userController.updateUser);
router.post('/users/:userId/ban', adminMiddleware, userController.banUser);
router.post('/users/:userId/unban', adminMiddleware, userController.unbanUser);
router.post('/users/:userId/lock', adminMiddleware, userController.lockUser);
router.post('/users/:userId/unlock', adminMiddleware, userController.unlockUser);
router.post('/users/:userId/delete', adminMiddleware, userController.deleteUser);

//Special offers routes
router.post('/offers', adminMiddleware, createOffer);
router.put('/offers/:offerId', adminMiddleware, updateOffer);
router.get('/offers', adminMiddleware, getAllOffers);
router.delete('/offers/:offerId', adminMiddleware, deleteOffer);


module.exports = router;
