const DepositSettings = require('../models/DepositSettings');
const Deposit = require('../models/Deposit');
const Transaction = require('../models/Transaction');
const ReferralLevel = require('../models/ReferralLevel'); 
const User = require('../models/User');
const QRCode = require('qrcode');
const crypto = require('crypto');


exports.getDepositSettings = async (req, res) => {
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

exports.createDeposit = async (req, res) => {
  try {
    let { amount, currency, network, reward } = req.body;
    currency = currency?.toUpperCase().trim();

    const settings = await DepositSettings.findOne();
    if (!settings || settings.status !== "active") {
      return res.status(400).json({ success: false, message: "Deposits are currently disabled" });
    }

    // Validate currency
    const currencySetting = settings.currencySettings.find((c) => c.currency === currency);
    if (!currencySetting) {
      return res.status(400).json({ success: false, message: "Invalid currency selected" });
    }

    // Validate network
    if (!settings.networkOptions.includes(network)) {
      return res.status(400).json({ success: false, message: "Invalid network selected" });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than zero" });
    }
    if (amount < currencySetting.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit amount is ${currencySetting.minAmount} ${currency}`
      });
    }

    // Find an active wallet for the selected currency and network
    const wallet = settings.wallets.find((w) => w.currency === currency && w.network === network && w.isActive);
    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Selected network is currently unavailable for this currency"
      });
    }

    // Ensure user exists before updating pendingDeposit
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Create deposit entry with reward if provided
    const deposit = new Deposit({
      user: req.user.id,
      amount,
      currency,
      network,
      rate: currencySetting.exchangeRate,
      receivedAmountINR: amount * currencySetting.exchangeRate,
      status: "pending",
      reward: reward || 0 
    });

    await deposit.save();

    // Update user's pending deposit amount
    await User.findByIdAndUpdate(req.user.id, { $inc: { pendingDeposit: amount } });

    return res.json({
      success: true,
      deposit: {
        ...deposit.toObject(),
        walletAddress: wallet.address,
        qrCode: wallet.qrCode
      }
    });
  } catch (error) {
    console.error("Error creating deposit:", error);
    return res.status(500).json({ success: false, message: "Error creating deposit" });
  }
};
// User confirms transaction
exports.confirmTransaction = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { userTransactionId } = req.body;

    if (!userTransactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    // Find by depositId string directly
    const deposit = await Deposit.findOne({ depositId });
    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    if (deposit.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Deposit has already been processed' });
    }

    deposit.userTransactionId = userTransactionId;
    deposit.status = 'user_confirmed';
    deposit.userConfirmationTime = new Date();
    await deposit.save();

    // Create transaction with string depositId
    await Transaction.create({
      user: deposit.user,
      depositId: deposit.depositId,
      type: "deposit",
      amount: deposit.amount,
      status: "pending",
    });    

    return res.json({
      success: true,
      message: 'Transaction confirmed successfully',
      deposit: {
        id: deposit.depositId,
        status: deposit.status,
        userTransactionId: deposit.userTransactionId,
        confirmationTime: deposit.userConfirmationTime
      }
    });
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return res.status(500).json({ success: false, message: 'Error confirming transaction' });
  }
};
// Get deposit history
exports.getDepositHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const deposits = await Deposit.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      deposits: deposits.map(deposit => ({
        id: deposit.depositId,
        amount: deposit.amount,
        currency: deposit.currency,
        network: deposit.network,
        status: deposit.status,
        inr: deposit.receivedAmountINR,
        time: deposit.createdAt,
        type: deposit.network,
        transactionHash: deposit.transactionHash,
        userTransactionId: deposit.userTransactionId,
        userConfirmationTime: deposit.userConfirmationTime,
        adminActionTime: deposit.adminActionTime,
        rejectionReason: deposit.rejectionReason
      }))
    });
  } catch (error) {
    console.error('Error fetching deposit history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching deposit history'
    });
  }
};
// Get specific deposit status
exports.getDepositStatus = async (req, res) => {
  try {
    const { depositId } = req.params;
    const deposit = await Deposit.findOne({ depositId })
      .populate('user', 'username email');

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    if (deposit.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    return res.json({
      success: true,
      deposit: {
        ...deposit.toObject(),
        user: {
          username: deposit.user.username,
          email: deposit.user.email
        }
      }
    });
  } catch (error) {
    console.error('Error fetching deposit status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching deposit status'
    });
  }
};
// Get all deposits (admin only)
exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username email');

    return res.json({
      success: true,
      deposits: deposits.map(deposit => ({
        ...deposit.toObject(),
        user: {
          username: deposit.user.username,
          email: deposit.user.email
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching all deposits:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching deposits'
    });
  }
};

// Approve deposit (admin only)
exports.approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;

    const deposit = await Deposit.findOne({ depositId });
    if (!deposit) {
      return res.status(404).json({ success: false, message: "Deposit not found" });
    }

    if (deposit.status !== "user_confirmed") {
      return res.status(400).json({ success: false, message: "Can only approve user-confirmed deposits" });
    }

    // Generate a unique transactionHash
    let transactionHash;
    do {
      transactionHash = crypto.createHash("sha256")
        .update(deposit.user + deposit.depositId + Date.now().toString())
        .digest("hex");
    } while (await Transaction.exists({ transactionHash }));

    // Update deposit
    deposit.status = "completed";
    deposit.transactionHash = transactionHash;
    deposit.adminActionTime = new Date();
    await deposit.save();

    // Update Transaction Model
    await Transaction.findOneAndUpdate(
      { depositId: deposit.depositId },
      { status: "completed", transactionHash: transactionHash }
    );

    // Fetch user's referrer chain
    const user = await User.findById(deposit.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch Active Referral Levels
    const referralSystem = await ReferralLevel.findOne({ systemStatus: 'active' });
    if (!referralSystem) {
      console.log("Referral system is not configured or is disabled");
      // Continue with deposit approval without referral rewards
    } else {
      // Get active levels
      const activeLevels = referralSystem.levels.filter(level => level.status === 'active');
      
      // Initialize reward distribution
      let referrer = user.refBy;
      let currentLevel = 1;
      
      while (referrer && currentLevel <= activeLevels.length) {
        // Find the level configuration
        const levelConfig = activeLevels.find(l => l.level === currentLevel);
        
        if (levelConfig) {
          // Ensure numerical value for reward calculation
          const receivedAmount = parseFloat(deposit.receivedAmountINR) || 0;
          const rewardPercentage = parseFloat(levelConfig.rewardPercentage) || 0;
          const refRewardAmount = parseFloat((receivedAmount * (rewardPercentage / 100)).toFixed(2));
          
          // Fetch Referrer
          const referrerUser = await User.findById(referrer);
          if (referrerUser) {
            // Initialize values if they don't exist and ensure they're numbers
            const currentTotalReward = parseFloat(referrerUser.totalReward || 0);
            const currentBalance = parseFloat(referrerUser.balance || 0);
            
            // Update with proper numerical values
            referrerUser.totalReward = parseFloat((currentTotalReward + refRewardAmount).toFixed(2));
            referrerUser.balance = parseFloat((currentBalance + refRewardAmount).toFixed(2));
            
            // Validate before saving
            if (isNaN(referrerUser.totalReward) || isNaN(referrerUser.balance)) {
              throw new Error(`Invalid numerical values for referrer ${referrerUser._id}`);
            }
            
            await referrerUser.save();

            // Log transaction
            await Transaction.create({
              user: referrerUser._id,
              depositId: deposit.depositId,
              type: 'referral_reward',
              amount: refRewardAmount,
              status: 'completed',
              fee: 0,
              transactionHash: crypto.randomBytes(16).toString('hex'),
              description: `Level ${currentLevel} Referral Reward from ${user.username} (${levelConfig.description || ''})`
            });
          }

          // Move to next referrer
          referrer = referrerUser?.refBy;
          currentLevel++;
        } else {
          // If level config not found, break the loop
          break;
        }
      }
    }

    // Update user's balance and other details...
    const currentBalance = parseFloat(user.balance || 0);
    const depositAmount = parseFloat(deposit.receivedAmountINR || 0);
    user.balance = parseFloat((currentBalance + depositAmount).toFixed(2));
    
    if (deposit.reward && deposit.reward > 0) {
      const rewardAmount = parseFloat(deposit.reward);
      user.balance = parseFloat((user.balance + rewardAmount).toFixed(2));
      user.totalReward = parseFloat((parseFloat(user.totalReward || 0) + rewardAmount).toFixed(2));
      
      if (isNaN(user.balance) || isNaN(user.totalReward)) {
        throw new Error('Invalid numerical values for user balance or total reward');
      }
      
      await Transaction.create({
        user: user._id,
        depositId: deposit.depositId,
        type: 'special_offer_reward',
        amount: rewardAmount,
        status: 'completed',
        fee: 0,
        description: 'Special Offer Bonus Reward',
        transactionHash: crypto.randomBytes(16).toString('hex'),
      });
    }

    user.pendingDeposit = parseFloat((parseFloat(user.pendingDeposit || 0) - parseFloat(deposit.amount || 0)).toFixed(2));
    user.payin = parseFloat((parseFloat(user.payin || 0) + parseFloat(deposit.receivedAmountINR || 0)).toFixed(2));

    if (isNaN(user.pendingDeposit) || isNaN(user.payin)) {
      throw new Error('Invalid numerical values for pending deposit or payin');
    }

    await user.save();

    return res.json({ success: true, message: "Deposit approved successfully", transactionHash });
  } catch (error) {
    console.error("Error approving deposit:", error);
    return res.status(500).json({ success: false, message: error.message || "Error approving deposit" });
  }
};

// Reject deposit (admin only)
exports.rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { reason } = req.body;

    const deposit = await Deposit.findOne({ depositId });
    if (!deposit) {
      return res.status(404).json({ success: false, message: "Deposit not found" });
    }

    if (deposit.status !== "user_confirmed") {
      return res.status(400).json({ success: false, message: "Can only reject user-confirmed deposits" });
    }

    // Update deposit
    deposit.status = "rejected";
    deposit.rejectionReason = reason;
    deposit.adminActionTime = new Date();
    await deposit.save();

    // Update Transaction Model (Use correct depositId type)
    await Transaction.findOneAndUpdate(
      { depositId: deposit.depositId }, // ✅ Use correct depositId type (String)
      { status: "failed" }
    );

    // Deduct from pending deposit safely
    const user = await User.findById(deposit.user);
    if (user) {
      user.pendingDeposit = Math.max(0, user.pendingDeposit - deposit.amount);
      await user.save();
    }

    return res.json({ success: true, message: "Deposit rejected successfully" });
  } catch (error) {
    console.error("Error rejecting deposit:", error);
    return res.status(500).json({ success: false, message: "Error rejecting deposit" });
  }
};

// Update deposit settings (admin only)
exports.updateDepositSettings = async (req, res) => {
  try {
    const { currencySettings, networkOptions, status, wallets } = req.body;

    let settings = await DepositSettings.findOne();

    if (!settings) {
      settings = new DepositSettings({
        currencySettings: [{
          currency: "USDT",
          exchangeRate: 80,
          minAmount: 10
        }],
        networkOptions: ["TRC20", "BEP20"],
        status: "active",
        wallets: []
      });
    }

    // Update network options
    if (networkOptions && Array.isArray(networkOptions)) {
      settings.networkOptions = networkOptions;
    }

    // Validate and update status
    if (status && ["active", "inactive"].includes(status)) {
      settings.status = status;
    }

    // Update currency settings with duplicate prevention
    if (currencySettings && Array.isArray(currencySettings)) {
      const seenCurrencies = new Set();
      settings.currencySettings = currencySettings.filter(setting => {
        if (seenCurrencies.has(setting.currency)) return false;
        seenCurrencies.add(setting.currency);
        return setting.currency && typeof setting.exchangeRate === 'number' && setting.exchangeRate >= 0 &&
               typeof setting.minAmount === 'number' && setting.minAmount >= 0;
      });
    }

    // Update wallets
    if (wallets && Array.isArray(wallets)) {
      const validCurrencies = new Set(settings.currencySettings.map(s => s.currency));

      const updatedWallets = await Promise.all(
        wallets
          .filter(wallet => validCurrencies.has(wallet.currency))
          .map(async wallet => {
            if (wallet.address) {
              try {
                wallet.qrCode = await QRCode.toDataURL(wallet.address);
              } catch (error) {
                console.error("Error generating QR code:", error);
              }
            }
            return wallet;
          })
      );

      // Check for duplicate addresses
      const addresses = new Set();
      const duplicateFound = updatedWallets.some(wallet => {
        if (addresses.has(wallet.address)) return true;
        addresses.add(wallet.address);
        return false;
      });

      if (duplicateFound) {
        return res.status(400).json({
          success: false,
          message: "Duplicate wallet addresses are not allowed"
        });
      }

      settings.wallets = updatedWallets;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings
    });
  } catch (error) {
    console.error("Error updating deposit settings:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Wallet address must be unique"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating deposit settings"
    });
  }
};

