const User = require("../models/User");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");
const DepositSettings = require("../models/DepositSettings");
const QRCode = require("qrcode");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get all deposits
const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find().populate("user", "username email");
    res.status(200).json(deposits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deposits", error });
  }
};

// Get all withdrawals
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate("user", "username email");
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching withdrawals", error });
  }
};

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("user", "username email");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

// Get deposit settings
const getDepositSettings = async (req, res) => {
  try {
    let settings = await DepositSettings.findOne();

    if (!settings) {
      // Default currency settings
      const defaultCurrencySettings = [
        {
          currency: "USDT",
          exchangeRate: 80,
          minAmount: 10
        }
      ];

      // Generate QR codes for default wallets
      const defaultWallets = await Promise.all([
        {
          network: "TRC20",
          currency: "USDT",
          address: "your-default-trc20-address",
          isActive: true,
          qrCode: await QRCode.toDataURL("your-default-trc20-address")
        },
        {
          network: "BEP20",
          currency: "USDT",
          address: "your-default-bep20-address",
          isActive: true,
          qrCode: await QRCode.toDataURL("your-default-bep20-address")
        }
      ]);

      // Creating new settings with default values
      settings = new DepositSettings({
        currencySettings: defaultCurrencySettings,
        networkOptions: ["TRC20", "BEP20"],
        status: "active",
        wallets: defaultWallets
      });

      await settings.save();
    }

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error in getDepositSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching deposit settings",
      error: error.message
    });
  }
};


module.exports = {
    getAllUsers,
    getAllDeposits,
    getAllWithdrawals,
    getAllTransactions,
    getDepositSettings,
  };