const ReferralLevel = require("../models/ReferralLevel");

const referralLevelController = {
  // Get all referral levels and system status
  getLevels: async (req, res) => {
    try {
      let settings = await ReferralLevel.findOne();
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = await ReferralLevel.create({
          systemStatus: 'active',
          levels: [
            { level: 1, rewardPercentage: 5, status: 'active', description: 'First Level Referral' },
            { level: 2, rewardPercentage: 3, status: 'active', description: 'Second Level Referral' },
            { level: 3, rewardPercentage: 1, status: 'active', description: 'Third Level Referral' }
          ]
        });
      }
      
      res.json({ 
        success: true, 
        data: {
          systemStatus: settings.systemStatus,
          levels: settings.levels
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  // Update referral levels and system status
  updateLevels: async (req, res) => {
    try {
      const { systemStatus, levels } = req.body;
      
      // Validate levels array
      if (!Array.isArray(levels)) {
        return res.status(400).json({ 
          success: false, 
          message: "Levels must be an array" 
        });
      }

      // Validate system status
      if (!['active', 'disabled'].includes(systemStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid system status"
        });
      }

      // Validate level numbers are unique
      const levelNumbers = levels.map(l => l.level);
      if (new Set(levelNumbers).size !== levelNumbers.length) {
        return res.status(400).json({
          success: false,
          message: "Level numbers must be unique"
        });
      }

      let referralSettings = await ReferralLevel.findOne();
      
      if (!referralSettings) {
        referralSettings = new ReferralLevel();
      }
      
      referralSettings.systemStatus = systemStatus;
      referralSettings.levels = levels;
      await referralSettings.save();

      res.json({ 
        success: true, 
        data: {
          systemStatus: referralSettings.systemStatus,
          levels: referralSettings.levels
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = referralLevelController;