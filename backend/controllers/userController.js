const User = require("../models/User");
const Offers = require("../models/Offers");
const Transaction = require("../models/Transaction");
const ReferralLevel = require("../models/ReferralLevel");


// Get user details (for the logged-in user)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user.email || req.user.token)
      .select("-password -otp -resetPasswordToken -resetPasswordExpiry") // Exclude sensitive fields
      .populate("transactionDetails refBy");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user details", error });
  }
};
// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const allowedUpdates = ["username", "emailPreferences", "avatar"];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation)
      return res
        .status(400)
        .json({ message: "Invalid updates. You can only update certain fields." });

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    }).select("username email referCode balance");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error });
  }
};
// Get user's transaction details
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch transactions linked to the user
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};
//User update, ban, delete function (Admin Only)
exports.banUser = async (req, res) => {
  try {
    const { reason, duration } = req.body;
    const banLiftDate = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banned = true;
    user.banReason = reason || 'Violation of terms of service';
    user.banLiftDate = banLiftDate;

    await user.save();

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Error banning user' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banned = false;
    user.banReason = null;
    user.banLiftDate = null;

    await user.save();

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ message: 'Error unbanning user' });
  }
};

exports.lockUser = async (req, res) => {
  try {
    const { duration } = req.body; // Duration in hours
    const lockUntil = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isLocked = true;
    user.lockUntil = lockUntil;

    await user.save();

    res.json({ message: 'User locked successfully' });
  } catch (error) {
    console.error('Error locking user:', error);
    res.status(500).json({ message: 'Error locking user' });
  }
};

exports.unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isLocked = false;
    user.lockUntil = null;
    user.failedLoginAttempts = 0;

    await user.save();

    res.json({ message: 'User unlocked successfully' });
  } catch (error) {
    console.error('Error unlocking user:', error);
    res.status(500).json({ message: 'Error unlocking user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = [
      'username',
      'email',
      'isVerified',
      'emailPreferences',
      'role'
    ];

    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -otp -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Get offers for users
exports.getAllOffers = async (req, res) => {
  const userId = req.params.userId;

  try {
    const offers = await Offers.find({
      active: true, // Ensuring only active offers are fetched
      $or: [
        { allUsers: true },
        { eligibleUsers: userId }
      ]
    });

    res.status(200).json({ offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching offers", error });
  }
};

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user ID from auth middleware

    // Get the user with their direct referrals
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all referral levels
    const referralLevelSystem = await ReferralLevel.findOne({ 
      systemStatus: 'active' 
    });

    if (!referralLevelSystem) {
      return res.status(404).json({
        success: false,
        message: "Referral system not found"
      });
    }

    // Get all users referred by current user
    const referredUsers = await User.find({ 
      refBy: userId,
      banned: false,
      deleted: false 
    });

    // Calculate referrals by level
    const referralsByLevel = await Promise.all(
      referralLevelSystem.levels
        .filter(level => level.status === 'active')
        .map(async (level) => {
          // For level 1: direct referrals
          if (level.level === 1) {
            return {
              level: level.level,
              percentage: level.rewardPercentage,
              count: referredUsers.length,
              description: level.description,
              active: true
            };
          }

          // For higher levels: find users who were referred by your referrals
          let levelUsers = [];
          let previousLevelUsers = referredUsers;

          // Traverse through levels
          for (let i = 1; i < level.level; i++) {
            const nextLevelUserIds = previousLevelUsers.map(user => user._id);
            previousLevelUsers = await User.find({
              refBy: { $in: nextLevelUserIds },
              banned: false,
              deleted: false
            });
            if (i === level.level - 1) {
              levelUsers = previousLevelUsers;
            }
          }

          return {
            level: level.level,
            percentage: level.rewardPercentage,
            count: levelUsers.length,
            description: level.description,
            active: true
          };
        })
    );

    // Calculate active referrals (users who have made at least one deposit)
    const activeReferrals = await User.countDocuments({
      refBy: userId,
      banned: false,
      deleted: false,
      payin: { $gt: 0 }
    });

    return res.json({
      success: true,
      data: {
        referralCode: user.referCode,
        totalReferrals: referredUsers.length,
        activeReferrals,
        totalRewards: user.totalReward,
        levels: referralsByLevel
      }
    });

  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching referral statistics"
    });
  }
};