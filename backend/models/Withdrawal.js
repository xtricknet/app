const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const withdrawalSchema = new mongoose.Schema(
  {
    withdrawalId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      required: false,
      min: 0,
    },
    fee: {
      type: Number,
      required: false,
      min: 0,
    },
    withdrawalMethod: {
      type: String,
      enum: ["bank", "upi"],
      required: true,
    },
    bankDetails: {
      accountNumber: { type: String },
      accountHolderName: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      branch: { type: String },
    },
    upiDetails: {
      upiId: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected", "failed"],
      default: "pending",
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      default: null,
    },
    utrNumber: {
      type: String,
      default: null,
    },
    processingAttempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
withdrawalSchema.index({ user: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: 1 });

// Validation to ensure required details based on withdrawal method
withdrawalSchema.pre("validate", function (next) {
  if (this.withdrawalMethod === "bank") {
    if (!this.bankDetails || !this.bankDetails.accountNumber || !this.bankDetails.ifscCode) {
      return next(new Error("Bank details are required for bank withdrawal."));
    }
  } else if (this.withdrawalMethod === "upi") {
    if (!this.upiDetails || !this.upiDetails.upiId) {
      return next(new Error("UPI ID is required for UPI withdrawal."));
    }
  }
  next();
});


module.exports = mongoose.model("Withdrawal", withdrawalSchema);
