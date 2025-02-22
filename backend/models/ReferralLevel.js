const mongoose = require("mongoose");

const referralLevelSchema = new mongoose.Schema(
  {
    systemStatus: { type: String, required: true, enum: ['active', 'disabled'], default: 'active' },
    levels: [{
      level: { type: Number, required: true },
      rewardPercentage: { type: Number, required: true, min: 0, max: 100 },
      status: { type: String, required: true, enum: ['active', 'disabled'], default: 'active' },
      description: { type: String }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReferralLevel", referralLevelSchema);