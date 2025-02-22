const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase(); // Random 5-character code
};

module.exports = generateReferralCode;
