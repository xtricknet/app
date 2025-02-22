const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      default: () => uuidv4(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    depositId: {
      type: String,
      ref: "Deposit",
      default: null,
    },
    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Withdrawal",
      default: null,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "special_offer_reward", "referral_reward"],
      required: true,
    },
    fee: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    description:{
      type: String,
      required: false,
    },
    transactionHash: {
      type: String,
      default: function () {
        return crypto.randomBytes(16).toString("hex");
      },
    },
  },
  { timestamps: true }
);


transactionSchema.index({ transactionHash: 1 }, { unique: true, sparse: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;