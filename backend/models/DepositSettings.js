const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  network: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    unique: true 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: {
    type: String, 
    required: true
  }
});

const currencySettingSchema = new mongoose.Schema({
  currency: {
    type: String,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: [0, "Exchange rate must be non-negative"]
  },
  minAmount: {
    type: Number,
    required: true,
    min: [0, "Minimum amount must be non-negative"]
  }
});

const depositSettingsSchema = new mongoose.Schema(
  {
    currencySettings: [currencySettingSchema],
    networkOptions: {
      type: [String]
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    wallets: [walletSchema]
  },
  { timestamps: true }
);
const DepositSettings = mongoose.model("DepositSettings", depositSettingsSchema);
module.exports = DepositSettings;
