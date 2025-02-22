import React, { useState, useEffect, useCallback } from 'react';
import { 
  Eye, 
  EyeOff, 
  RefreshCcw, 
  Bell, 
  AlertCircle,
  ArrowRight,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  ShieldAlert,
  Ban,
  Sparkles,
  Timer,
  Flame,
  Lock,
  Trash2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, toggleSensitiveData } from '../../../redux/userSlice';
import BottomNavigation from './BottomNavigation';
import toast , {Toaster} from 'react-hot-toast';
import axios from 'axios';

const AccountStatusOverlay = ({ userData }) => {
  if (userData?.banned) {
    const formattedDate = userData.banLiftDate ? new Date(userData.banLiftDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Indefinite';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Ban className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-red-600 mb-2">Account Suspended</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-medium text-red-800">Reason for Suspension:</div>
              <div className="text-red-600 mt-1">{userData.banReason || 'Violation of terms of service'}</div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-800">Ban Duration:</div>
              <div className="text-gray-600 mt-1">Until: {formattedDate}</div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              For any queries regarding your account suspension, please contact support.
            </div>

            <Link 
              to='/support'
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (userData?.isLocked) {
    const formattedLockDate = userData.lockUntil ? new Date(userData.lockUntil).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Unknown';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-yellow-600 mb-2">Account Locked</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="font-medium text-yellow-800">Account Access Restricted</div>
              <div className="text-yellow-600 mt-1">Your account has been temporarily locked due to multiple failed login attempts.</div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-800">Lock Duration:</div>
              <div className="text-gray-600 mt-1">Until: {formattedLockDate}</div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Please try again later or contact support if you need immediate assistance.
            </div>

            <Link to="/support" 
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (userData?.isDeleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Trash2 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-600 mb-2">Account Deleted</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-800">Account Status:</div>
              <div className="text-gray-600 mt-1">This account has been permanently deleted.</div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-800">Deletion Date:</div>
              <div className="text-gray-600 mt-1">
                {new Date(userData.deletedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              If you believe this was done in error, please contact support.
            </div>

            <Link to="/support" 
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;


const SpecialOfferCard = ({ offer, onExpire }) => {
  const expiryTime = new Date(offer.expiry).getTime();
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.floor((expiryTime - Date.now()) / 1000)));
  const [totalTime, setTotalTime] = useState(timeLeft);
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeout(() => onExpire(offer._id), 0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(0, prevTime - 1);
        if (newTime === 0) {
          clearInterval(timer);
          setTimeout(() => onExpire(offer._id), 0);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offer._id]);

  const progressWidth = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleClaimOffer = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      // Create deposit using offer data
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/deposits/create`, {
        amount: parseFloat(offer.depositAmount),
        currency: offer.currency,
        network: offer.network,
        reward: offer.rewardAmount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.deposit) {
        navigate('/crypto-deposit', {
          state: {
            depositData: {
              ...response.data.deposit,
              currency: offer.currency,
              network: offer.network,
              receivedAmountINR: offer.totalAmountReceive || 
                (parseFloat(offer.depositAmount) * offer.exchangeRate).toFixed(2)
            }
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to claim offer');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim special offer');
      console.error("Error claiming offer:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (timeLeft <= 0) return null;

  return (
    <div className="animate-slideIn">
      <div 
        className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 p-[2px] rounded-xl mb-3 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-white rounded-xl p-4 relative overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-yellow-50 to-red-50 opacity-50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZDcwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] animate-pulse"></div>
          </div>

          <div className="relative">
            {/* Header section */}
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-2 rounded-lg rotate-3 hover:rotate-6 transition-transform">
                <Gift className="w-5 h-5 text-white animate-bounce" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">
                    {offer.title}
                  </h3>
                  <div className="bg-gradient-to-r from-red-500 to-yellow-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md animate-pulse">
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-1">{offer.description}</p>
              </div>
            </div>

            {/* Reward section */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 p-2 rounded-lg transform hover:scale-105 transition-transform">
                <div className="text-xs text-gray-500">Deposit Amount</div>
                <div className="font-bold text-red-600">{offer.depositAmount} {offer.currency}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-red-50 p-2 rounded-lg transform hover:scale-105 transition-transform">
                <div className="text-xs text-gray-500">Reward Amount</div>
                <div className="font-bold text-yellow-600">{offer.rewardAmount} INR</div>
              </div>
            </div>

            {/* Action section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                <Timer className="w-4 h-4 text-red-500 animate-spin-slow" />
                <span className="text-red-500 font-medium">Limited time offer</span>
              </div>
              <button
                onClick={handleClaimOffer}
                disabled={isProcessing}
                className={`bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg px-4 py-1.5 text-sm font-medium 
                  transform transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 group
                  ${isHovered ? 'animate-pulse' : ''} ${isProcessing ? 'opacity-75 cursor-wait' : ''}`}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Claim Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-linear relative"
                style={{ width: `${progressWidth}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const MainPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, loading, showSensitiveData } = useSelector((state) => state.user);
  const [specialOffers, setSpecialOffers] = useState([]);
  const userId = localStorage.getItem("userId");
  const validOffers = specialOffers.filter((offer) => {
    const expiryTime = new Date(offer.expiry).getTime();
    return expiryTime > Date.now(); 
  });


  const fetchOffers = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/offers/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch offers");
  
      const data = await response.json();
      setSpecialOffers(data.offers); // Update state with actual API data
    } catch (err) {
      console.error("Error loading offers:", err);
    }
  }, []);
  
  useEffect(() => {
    fetchOffers(); 
    const interval = setInterval(() => {
      fetchOffers();
    }, 600000); 
    return () => clearInterval(interval);
  }, [fetchOffers]);

  const handleOfferExpire = (offerId) => {
    setSpecialOffers(prev => prev.filter(offer => offer.id !== offerId));
  };

  const handleRefresh = () => {
    fetchOffers(); 
  };

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.5s ease-out;
    }
  `;
  document.head.appendChild(style);

  const handleNavigate = (path, data) => {
    if (userData?.banned) {
      return;
    }
    navigate(path, { state: { userData: data } });
  };

  const formatAmount = (amount) => {
    const safeAmount = amount ?? 0;
    return safeAmount.toLocaleString('en-IN');
  };

  const formatSensitiveAmount = (amount) => {
    if (!showSensitiveData) return '****';
    return `₹${formatAmount(amount)}`;
  };

  const actionButtons = [
    {
      label: 'Deposit',
      path: '/deposit',
      data: userData,
      icon: <ArrowUpCircle className="w-5 h-5" />
    },
    {
      label: 'Withdraw',
      path: '/withdraw',
      data: userData,
      icon: <ArrowDownCircle className="w-5 h-5" />
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      data: userData,
      icon: <Wallet className="w-5 h-5" />
    }
  ];
  const isAccountRestricted = userData?.banned || userData?.isLocked || userData?.isDeleted;

  const getAccountStatusIcon = () => {
    if (userData?.banned) return <ShieldAlert className="w-3 h-3 text-white" />;
    if (userData?.isLocked) return <Lock className="w-3 h-3 text-white" />;
    if (userData?.isDeleted) return <Trash2 className="w-3 h-3 text-white" />;
    if (userData?.isVerified) return (
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
      </svg>
    );
    return null;
  };

  const getAccountStatusBadge = () => {
    if (userData?.banned) return "Suspended";
    if (userData?.isLocked) return "Locked";
    if (userData?.isDeleted) return "Deleted";
    return null;
  };

  const getStatusBadgeColor = () => {
    if (userData?.banned) return "bg-red-100 text-red-800";
    if (userData?.isLocked) return "bg-yellow-100 text-yellow-800";
    if (userData?.isDeleted) return "bg-gray-100 text-gray-800";
    return "";
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative pb-20">
    {/* Status Overlay */}
    <AccountStatusOverlay userData={userData} />

    {/* Top Navigation */}
    <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <div className="relative">
          <div className="w-12 h-12 bg-yellow-400 rounded-full overflow-hidden">
            <img
              src={userData?.avatar || 'https://i.ibb.co/c655HzS/default-avatar.jpg'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {getAccountStatusIcon() && (
            <div className={`absolute -bottom-1 -right-1 ${
              userData?.banned ? 'bg-red-500' : 
              userData?.isLocked ? 'bg-yellow-500' : 
              userData?.isDeleted ? 'bg-gray-500' : 
              'bg-green-500'
            } rounded-full p-1`}>
              {getAccountStatusIcon()}
            </div>
          )}
        </div>
        <div className="ml-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-800">
              {userData?.username || 'Anonymous'}
            </h2>
            {getAccountStatusBadge() && (
              <span className={`${getStatusBadgeColor()} text-xs px-2 py-1 rounded-full`}>
                {getAccountStatusBadge()}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            ID: {showSensitiveData ? userData?.userId : '****'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-600 relative">
          <Bell className="w-6 h-6" />
          {!isAccountRestricted && (userData?.pendingDeposit > 0 || userData?.pendingOrder > 0) && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
              !
            </span>
          )}
        </button>
      </div>
    </div>

      {/* Main Content */}
      <div className={`p-4 ${userData?.banned ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Balance Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="mb-4">
            <div className="flex items-center justify-between text-gray-600 mb-1">
              <div className="flex items-center gap-2">
                Balance
                <button 
                  className="text-gray-600"
                  onClick={() => dispatch(toggleSensitiveData())}
                >
                  {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {loading ? '---' : `${formatSensitiveAmount((userData?.balance) - (userData?.pendingWithdrawal))} INR`}
            </div>
          </div>

          {/* Rewards Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              Total Rewards
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-green-600">
              {loading ? '---' : formatSensitiveAmount(userData?.totalReward)}
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <div className="text-gray-600 text-sm mb-1">Pay In</div>
              <div className="font-semibold">
                {loading ? '---' : formatSensitiveAmount(userData?.payin)}
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm mb-1">Pay Out</div>
              <div className="font-semibold">
                {loading ? '---' : formatSensitiveAmount(userData?.payout)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {actionButtons.map((button) => (
            <button 
              key={button.label}
              onClick={() => handleNavigate(button.path, button.data)}
              className="bg-white rounded-lg py-3 px-4 text-center text-gray-700 shadow-sm hover:bg-gray-50 transition-colors flex flex-col items-center gap-2"
              disabled={userData?.banned}
            >
              {button.icon}
              <span>{button.label}</span>
            </button>
          ))}
        </div>

        {/* Special Offers Section */}
        <div className="relative mb-8">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-transparent to-yellow-50 opacity-50 rounded-2xl" />
          
          {/* Header */}
          <div className="relative px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-1.5 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">
                  Special Offers
                </h2>
              </div>
              
              {validOffers.length > 0 && (
                <span className="text-sm font-medium text-gray-500">
                  {validOffers.length} Active {validOffers.length === 1 ? 'Offer' : 'Offers'}
                </span>
              )}
            </div>
          </div>

          {/* Offers Container */}
          <div className="px-4 relative">
            {validOffers.length > 0 ? (
              <div className="space-y-3">
                {validOffers.map((offer) => (
                  <SpecialOfferCard 
                    key={offer._id} 
                    offer={offer} 
                    onExpire={handleOfferExpire}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                  <Gift className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">No Special Offers Available</p>
                <p className="text-sm text-gray-400">Check back later for new offers!</p>
              </div>
            )}
          </div>

          {/* Decorative elements */}
          {validOffers.length > 0 && (
            <>
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 blur-xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-200 rounded-full opacity-20 translate-y-1/2 -translate-x-1/2 blur-xl" />
            </>
          )}
        </div>

        {/* Refresh Button */}
        <div className="px-4 mb-4">
          <button 
            onClick={handleRefresh}
            className="w-full rounded-lg py-3 px-4 text-center shadow-sm transition-colors duration-150 relative overflow-hidden group"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 opacity-90" />
            
            <div className="relative flex items-center justify-center gap-2">
              <RefreshCcw className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-300" />
              <span className="font-medium text-white">
                Refresh Offers
              </span>
            </div>
            
            {/* Hover effect */}
           </button>
        </div>


      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userData={userData} />
       <Toaster       
            position='top-right'
            reverseOrder={false} 
            />
    </div>
  );
};

export default MainPage;