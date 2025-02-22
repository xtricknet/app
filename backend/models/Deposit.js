const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const depositSchema = new mongoose.Schema(
  {
    depositId: {
      type: String,
      default: uuidv4,
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
    currency: {
      type: String,
      required: true,
    },
    reward:{
      type: Number,
      required: true,
      min: 0,
    },
    network: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    receivedAmountINR: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "user_confirmed", "admin_approved", "completed", "rejected"],
      default: "pending",
    },
    userTransactionId: {
      type: String,
      default: null,
    },
    userConfirmationTime: {
      type: Date,
      default: null,
    },
    adminActionTime: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      ref: "Transaction",
      default: null,
    },
    transactionHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Confirm deposit by user & create a pending transaction
depositSchema.methods.confirmByUser = async function (transactionId) {
  if (this.status !== "pending") {
    throw new Error("Deposit cannot be confirmed at this stage.");
  }

  this.userTransactionId = transactionId;
  this.status = "user_confirmed";
  this.userConfirmationTime = new Date();
  await this.save();

  // Check if a transaction already exists using depositId
  let transaction = await mongoose.model("Transaction").findOne({ 
    depositId: this.depositId 
  });

  if (!transaction) {
    transaction = await mongoose.model("Transaction").create({
      user: this.user,
      depositId: this.depositId,
      type: "deposit",
      amount: this.amount,
      status: "pending",
    });

    this.transactionId = transaction.transactionId;
    await this.save();
  }

  return this;
};

// Approve deposit by admin & update transaction status
depositSchema.methods.approveByAdmin = async function (transactionHash) {
  if (this.status !== "user_confirmed") {
    throw new Error("Deposit can only be approved if it is user-confirmed.");
  }

  this.status = "completed";
  this.transactionHash = transactionHash;
  this.adminActionTime = new Date();
  await this.save();

  const transaction = await mongoose.model("Transaction").findOneAndUpdate(
    { depositId: this.depositId },
    { status: "completed", transactionHash },
    { new: true }
  );

  if (!transaction) {
    throw new Error("Transaction record not found for this deposit.");
  }

  return this;
};

depositSchema.methods.rejectByAdmin = async function (reason) {
  if (this.status !== "user_confirmed") {
    throw new Error("Deposit can only be rejected if it is user-confirmed.");
  }

  this.status = "rejected";
  this.rejectionReason = reason;
  this.adminActionTime = new Date();
  await this.save();

  const transaction = await mongoose.model("Transaction").findOneAndUpdate(
    { depositId: this.depositId },
    { status: "failed" },
    { new: true }
  );

  if (!transaction) {
    throw new Error("Transaction record not found for this deposit.");
  }

  return this;
};

// Consolidated indexes
depositSchema.index({ user: 1, status: 1 });
depositSchema.index({ depositId: 1 }, { unique: true });

const Deposit = mongoose.model("Deposit", depositSchema);
module.exports = Deposit;