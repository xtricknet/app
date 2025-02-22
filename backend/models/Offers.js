const mongoose = require("mongoose");

const OffersSchema = new mongoose.Schema({
  active:{type: Boolean, default: true},
  title: { type: String, required: true },
  description: { type: String, required: true },
  depositAmount: { type: Number, required: true },
  rewardAmount: { type: Number, required: true },
  currency: { type: String, default: "USDT" },
  network: { type: String, default: "BEP20" },
  expiry: { type: Date, required: true },
  userSpecific: { type: Boolean, default: false },
  eligibleUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  allUsers: { type: Boolean, default: false },
  totalAmountReceive: { type: Number, default: 0 },
  exchangeRate: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Offers", OffersSchema);


