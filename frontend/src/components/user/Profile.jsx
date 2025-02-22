import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ChevronRight,
  Shield,
  Gift,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Handshake
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSensitiveData } from '../../../redux/userSlice';
import BottomNavigation from './BottomNavigation';
import toast, {Toaster} from 'react-hot-toast';

const ProfileSection = ({ icon: Icon, title, value, onClick, showArrow = true }) => (
  <div 
    className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="text-gray-800">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-gray-600">{value}</span>}
      {showArrow && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, showSensitiveData } = useSelector((state) => state.user);

  const handleNavigate = (path, data) => {
    if (userData?.banned) return;
    navigate(path, { state: { userData: data } });
  };

  const handleCopyId = () => {
    if (userData?.referCode) {
      navigator.clipboard.writeText(userData.referCode);
      toast.success("Referral code Copied");
    }
  };

  const profileSections = [
    {
      title: 'Account Security',
      icon: Shield,
      onClick: () => handleNavigate('/security', userData)
    },
    {
      title: 'Transaction History',
      icon: History,
      onClick: () => handleNavigate('/transactions', userData)
    },
    {
      title: 'Deposite',
      icon: ArrowUpCircle,
      onClick: () => handleNavigate('/deposit', userData)
    },
    {
      title: 'Withdraw',
      icon: ArrowDownCircle,
      onClick: () => handleNavigate('/withdraw', userData)
    },
    {
      title: 'Rewards',
      icon: Gift,
      onClick: () => handleNavigate('/rewards', userData)
    },
    {
      title: 'Referrals',
      icon: Handshake,
      onClick: () => handleNavigate('/referrals', userData)
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
             </button>
          <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        </div>
        <button 
          onClick={() => handleNavigate('/setting', userData)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="p-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-400 rounded-full overflow-hidden">
                <img
                  src={userData?.avatar || '/default-avatar.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {userData?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {userData?.username || 'Anonymous'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  Referal ID: {showSensitiveData ? userData?.referCode : '****'}
                </span>
                <button 
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={() => dispatch(toggleSensitiveData())}
                >
                </button>
                <button 
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={handleCopyId}
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {profileSections.map((section) => (
            <ProfileSection
              key={section.title}
              icon={section.icon}
              title={section.title}
              onClick={section.onClick}
            />
          ))}
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

export default Profile;