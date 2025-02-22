import React, { useState, useEffect } from 'react';
import { Share2, Users, Gift, ChevronRight, Copy, ArrowLeft, Clock, Award, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ReferralCard = ({ title, value, icon: Icon, subtitle, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200 border border-gray-100"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-100 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </div>
);

const ReferralLevelCard = ({ level, percentage, count, description, isActive }) => (
  <div className={`p-4 border rounded-xl ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {level}
        </div>
        <span className={`font-medium ${isActive ? 'text-blue-800' : 'text-gray-700'}`}>Level {level}</span>
      </div>
      <span className={`text-sm font-bold px-2 py-1 rounded-full ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
        {percentage}% Reward
      </span>
    </div>
    <div className="flex items-center gap-2 mb-3">
      <Users className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
      <span className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
        {count} referrals
      </span>
    </div>
    {description && (
      <p className={`text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'} mt-1 bg-opacity-30 p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-50'}`}>
        {description}
      </p>
    )}
  </div>
);

const Referrals = () => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/referrals`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      if (response.data.success) {
        setReferralStats(response.data.data);
        console.log(response.data.data);
      } else {
        setError('Failed to fetch referral stats');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralLink = async () => {
    if (!referralStats?.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/referrals/${referralStats.referralCode}`
      );
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy: ' + err);
    }
  };

  // Mock data based on API response
  const mockResponse = {
    "referralCode": "327DL",
    "totalReferrals": 1,
    "activeReferrals": 0,
    "totalRewards": 9000,
    "levels": [
      {
        "level": 1,
        "percentage": 5,
        "count": 1,
        "description": "First Level Referral",
        "active": true
      },
      {
        "level": 2,
        "percentage": 3,
        "count": 0,
        "description": "Second Level Referral",
        "active": true
      },
      {
        "level": 3,
        "percentage": 1,
        "count": 0,
        "description": "Third Level Referral",
        "active": true
      }
    ]
  };

  // Use mock data or actual data
  const displayData = referralStats || mockResponse;

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your referral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="p-8 text-center bg-white rounded-xl shadow-sm max-w-xs mx-auto">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchReferralStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header - Keeping as requested */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button 
          onClick={() => window.history.back()}
          className="hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Referral Program</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 pb-16">
        {/* Share Section - Kept the same */}
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <h2 className="text-xl font-bold mb-2">Invite Friends & Earn Rewards</h2>
            <p className="text-sm text-blue-100">Share your unique link and get rewards for every successful referral</p>
          </div>
          <CardContent className="p-4">
            <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between mb-2 border border-gray-200">
              <span className="text-sm font-mono text-gray-600 truncate">
                {window.location.origin}/referrals/{displayData.referralCode}
              </span>
              <button
                onClick={handleCopyReferralLink}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary Card - Updated with API data */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Your Referral Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{displayData.totalReferrals}</div>
                <div className="text-xs text-gray-600 mt-1">Total Referrals</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{displayData.activeReferrals}</div>
                <div className="text-xs text-gray-600 mt-1">Active Referrals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats Cards - Updated with API data */}
        <div className="space-y-3">
          <ReferralCard
            title="Total Earnings"
            value={`₹${(displayData.totalRewards)}`}
            subtitle="Based on your referral commissions and other rewards"
            icon={Gift}
            onClick={() => {}}
          />
          <ReferralCard
            title="Pending Referrals"
            value={displayData.totalReferrals - displayData.activeReferrals}
            subtitle="Will be active after first purchase"
            icon={Clock}
            onClick={() => {}}
          />
        </div>

        {/* Referral Levels - Updated with API data */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Referral Levels
              </span>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 flex items-center gap-1"
              >
                {showDetails ? 'Hide' : 'Show'} Details
                <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className={`transition-all duration-300 mb-20 ${showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden p-0'}`}>
            <div className="space-y-3 pt-2">
              {displayData.levels.map((level) => (
                <ReferralLevelCard
                  key={level.level}
                  level={level.level}
                  percentage={level.percentage}
                  count={level.count}
                  description={level.description}
                  isActive={level.active}
                />
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
      <Toaster 
        position='top-right'
      reverseOrder={false} 
      />
    </div>
  );
};

export default Referrals;