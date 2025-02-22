const crypto = require('crypto');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const WithdrawalSettings = require('../models/WithdrawalSettings');
const mongoose = require('mongoose')
const { validationResult } = require('express-validator');


//Getting all withdrawal for the user
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure the requesting user can only access their own withdrawal history
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Fetch withdrawals for the user
    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      withdrawals: withdrawals.map(withdrawal => ({
        id: withdrawal.withdrawalId,
        amount: withdrawal.amount,
        status: withdrawal.status,
        method: withdrawal.withdrawalMethod,
        paidAmount: withdrawal.paidAmount,
        fee: withdrawal.fee,
        time: withdrawal.createdAt,
        transactionId: withdrawal.transactionId,
        rejectionReason: withdrawal.rejectionReason,
        utrNumber: withdrawal.utrNumber,
        processedBy: withdrawal.processedBy,
        processedAt: withdrawal.processedAt,
        type: withdrawal.withdrawalMethod,
      }))
    });
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching withdrawal history"
    });
  }
};

// Getting Withdrawal settings
exports.getPaymentMethods = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      upiDetails: req.user.upiDetails || [],
      bankDetails: req.user.bankDetails || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment methods",
      error: error.message
    });
  }
};

// Add new UPI ID
exports.addUpiId = async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId) {
      return res.status(400).json({ success: false, message: "UPI ID is required" });
    }

    const userId = req.user._id; // Get user ID from token

    // Check if UPI ID already exists
    const existingUpi = await User.findOne({
      _id: userId,
      "upiDetails.upiId": upiId
    });

    if (existingUpi) {
      return res.status(409).json({ success: false, message: "UPI ID already exists" });
    }

    // Add the new UPI ID
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { upiDetails: { upiId } } },
      { new: true, select: "upiDetails" }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(201).json({ success: true, message: "UPI ID added successfully", upiDetails: user.upiDetails });
  } catch (error) {
    console.error("Error adding UPI ID:", error);
    res.status(500).json({ success: false, message: "Error adding UPI ID", error: error.message });
  }
};

// Add new bank account
exports.addBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, ifscCode, accountHolderName } = req.body;

    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      return res.status(400).json({ success: false, message: "All bank details are required" });
    }

    const userId = req.user._id; // Get user ID from token

    // Check if the bank account already exists
    const existingAccount = await User.findOne({
      _id: userId,
      "bankDetails.accountNumber": accountNumber
    });

    if (existingAccount) {
      return res.status(409).json({ success: false, message: "Bank account already exists" });
    }

    // Add the new bank account
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { bankDetails: { bankName, accountNumber, ifscCode, accountHolderName } } },
      { new: true, select: "bankDetails" }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(201).json({ success: true, message: "Bank account added successfully", bankDetails: user.bankDetails });
  } catch (error) {
    console.error("Error adding bank account:", error);
    res.status(500).json({ success: false, message: "Error adding bank account", error: error.message });
  }
};

// Delete UPI ID
exports.deleteUpiId = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { upiDetails: { _id: id } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or UPI ID not found" });
    }

    res.json({ success: true, message: "UPI ID deleted successfully", upiDetails: user.upiDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting UPI ID", error: error.message });
  }
};
// Delete bank account
exports.deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { bankDetails: { _id: id } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or Bank Account not found" });
    }

    res.json({ success: true, message: "Bank account deleted successfully", bankDetails: user.bankDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting bank account", error: error.message });
  }
};

//Create the withdrawal 
exports.createWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, withdrawalMethod, bankDetails, upiDetails } = req.body;
    const settings = await WithdrawalSettings.findOne();

    if (!settings || settings.status !== "active") {
      return res.status(400).json({ success: false, message: "Withdrawals are currently disabled" });
    }

    if (amount < settings.minAmount || amount > settings.maxAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Withdrawal amount must be between ${settings.minAmount} and ${settings.maxAmount} INR`
      });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user || user.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // ✅ Only update pendingWithdrawal (do not deduct balance yet)
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { pendingWithdrawal: amount } },
      { session }
    );

    // Calculate fee
    const fee = (amount * settings.feePercentage) / 100;
    const paidAmount = amount - fee;

    // Create transaction
    const transaction = await Transaction.create(
      [
        {
          user: req.user._id,
          type: "withdrawal",
          fee,
          amount,
          status: "pending",
          transactionHash: crypto.createHash("sha256").update(`${req.user._id}-${Date.now()}-${Math.random()}`).digest("hex"),
        },
      ],
      { session }
    );

    // Create withdrawal record
    const withdrawal = await Withdrawal.create(
      [
        {
          user: req.user._id,
          amount,
          fee,
          paidAmount,
          withdrawalMethod,
          status: "pending",
          transactionId: transaction[0]._id,
          ...(withdrawalMethod === "bank" && { bankDetails }),
          ...(withdrawalMethod === "upi" && { upiDetails }),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "Withdrawal request created successfully",
      withdrawal: withdrawal[0],
      transaction: transaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating withdrawal:", error);
    return res.status(500).json({ success: false, message: "Error creating withdrawal" });
  }
};

//Approve the withdrawal from (Admin Only)
exports.approveWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawlId } = req.params;
    const { utrNumber } = req.body;

    if (!utrNumber) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "UTR number is required for approval" });
    }

    const withdrawal = await Withdrawal.findById(withdrawlId).session(session);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Withdrawal not found" });
    }    

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Can only approve pending withdrawals" });
    }

    const user = await User.findById(withdrawal.user).session(session);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const amount = Number(withdrawal.amount);
    if (!amount || isNaN(amount)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
    }

    // ✅ Deduct from balance and remove from pendingWithdrawal
    await User.findByIdAndUpdate(
      withdrawal.user,
      {
        $inc: { 
          balance: -amount, 
          pendingWithdrawal: -amount, 
          payout: amount 
        },
      },
      { session }
    );

    // ✅ Update withdrawal status
    withdrawal.status = "completed";
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    withdrawal.utrNumber = utrNumber;
    await withdrawal.save({ session });

    // ✅ Update transaction
    if (withdrawal.transactionId) {
      await Transaction.findByIdAndUpdate(
        withdrawal.transactionId,
        {
          status: "completed",
          transactionHash: crypto.createHash("sha256")
            .update(withdrawal._id.toString() + Date.now().toString())
            .digest("hex"),
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({ success: true, message: "Withdrawal approved successfully", withdrawal });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error approving withdrawal:", error);
    return res.status(500).json({ success: false, message: "Error approving withdrawal" });
  }
};


//Reject the withdrawal from (Admin Only)
exports.rejectWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawlId } = req.params;
    const { rejectionReason } = req.body;

    console.log("Withdrawal ID:", withdrawlId);

    const withdrawal = await Withdrawal.findById(withdrawlId).session(session);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Withdrawal not found" });
    }
    
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Can only reject pending withdrawals" });
    }

    // ✅ Only remove from pendingWithdrawal (do not touch balance)
    await User.findByIdAndUpdate(
      withdrawal.user,
      {
        $inc: { pendingWithdrawal: -Number(withdrawal.amount) || 0 },
      },
      { session }
    );

    // Update withdrawal status
    withdrawal.status = "rejected";
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save({ session });

    // Update transaction
    if (withdrawal.transactionId) {
      await Transaction.findByIdAndUpdate(withdrawal.transactionId, {
        status: "failed"
      }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({ success: true, message: "Withdrawal rejected successfully", withdrawal });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error rejecting withdrawal:", error);
    return res.status(500).json({ success: false, message: "Error rejecting withdrawal" });
  }
};


// Getting all the withdrawl (Admin Only)
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 })
      .populate("user", "username email")
      .populate("processedBy", "username email"); 

    return res.json({
      success: true,
      withdrawals: withdrawals.map((withdrawal) => ({
        ...withdrawal.toObject(),
        user: withdrawal.user
          ? {
              username: withdrawal.user.username,
              email: withdrawal.user.email,
            }
          : null,
        processedBy: withdrawal.processedBy
          ? {
              username: withdrawal.processedBy.username,
              email: withdrawal.processedBy.email,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching all withdrawals:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching withdrawals",
    });
  }
};

// Get withdrawal details (Admin Only)
exports.getWithdrawalSettings = async (req, res) => {
  try {
    let settings = await WithdrawalSettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = new WithdrawalSettings({
        minAmount: 1000,
        maxAmount: 100000,
        feePercentage: 0,
        status: "active"
      });
      await settings.save();
    }

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error in getWithdrawalSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching withdrawal settings"
    });
  }
};
// update withdrawal details (Admin Only)
exports.updateWithdrawalSettings = async (req, res) => {
  try {
    const { minAmount, maxAmount, feePercentage, status } = req.body;

    let settings = await WithdrawalSettings.findOne();

    if (!settings) {
      settings = new WithdrawalSettings({
        minAmount: minAmount || 1000,
        maxAmount: maxAmount || 100000,
        feePercentage: feePercentage || 0,
        status: status || "active"
      });
    } else {
      // Validate min/max amount relationship
      if (minAmount && maxAmount && minAmount > maxAmount) {
        return res.status(400).json({
          success: false,
          message: "Minimum amount cannot be greater than maximum amount"
        });
      }

      // Update only provided fields
      if (minAmount !== undefined) settings.minAmount = minAmount;
      if (maxAmount !== undefined) settings.maxAmount = maxAmount;
      if (feePercentage !== undefined) settings.feePercentage = feePercentage;
      if (status) settings.status = status;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Withdrawal settings updated successfully",
      data: settings
    });
  } catch (error) {
    console.error("Error updating withdrawal settings:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating withdrawal settings"
    });
  }
};



