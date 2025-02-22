const mongoose = require("mongoose");

const WithdrawalSettingsSchema = new mongoose.Schema({
    minAmount: { type: Number, required: true, default: 1000 }, 
    maxAmount: { type: Number, required: true, default: 100000 },
    feePercentage: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["active", "disabled"], default: "active" } 
});

const WithdrawalSettings = mongoose.model("WithdrawalSettings", WithdrawalSettingsSchema);

module.exports = WithdrawalSettings;
