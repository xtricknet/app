const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For encryption

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referCode: { type: String, required: true, unique: true },
    refBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    
    balance: { type: Number, default: 0, min: 0 },
    totalReward: { type: Number, default: 0 },

    payin: { type: Number, default: 0, min: 0 },  
    payout: { type: Number, default: 0, min: 0 },
    
    transactionDetails: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    
    pendingDeposit: { type: Number, default: 0 },
    pendingWithdrawal: { type: Number, default: 0 },
    pendingOrder: { type: Number, default: 0 },
    
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    
    role: { type: String, enum: ["user", "admin"], default: "user" },
    
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date, default: null },
    
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
    
    avatar: { type: String, default: null },
    emailPreferences: { type: Boolean, default: true },
    
    deleted: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    banLiftDate: { type: Date, default: null },
    
    bankDetails: [
      {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true},
        ifscCode: { type: String, required: true },
        accountHolderName: { type: String, required: true },
      },
    ],
    upiDetails: [
      {
        upiId: { type: String, required: true},
      },
    ], isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

/** PRE-SAVE HOOK: Prevent Negative Balance */
userSchema.pre("save", function (next) {
  if (this.balance < 0) {
    return next(new Error("Balance cannot be negative"));
  }
  next();
});

/** PASSWORD ENCRYPTION */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/** AUTO-REMOVE SENSITIVE FIELDS WHEN CONVERTED TO JSON */
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.otp;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpiry;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
