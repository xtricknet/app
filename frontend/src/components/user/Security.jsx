import React from 'react';
import { ArrowLeft, Shield, Fingerprint, RectangleEllipsis, Eye, Lock, Headphones } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import BottomNavigation from './BottomNavigation';

const SettingItem = ({ icon: Icon, text, value, onClick }) => (
  <div 
    className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center space-x-4">
      <Icon className="w-6 h-6 text-gray-600" />
      <span className="text-lg text-gray-900">{text}</span>
    </div>
    {(value || true) && (
      <div className="flex items-center">
        {value && <span className="text-gray-500 mr-2">{value}</span>}
        <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
      </div>
    )}
  </div>
);

const Security = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData, loading, showSensitiveData } = useSelector((state) => state.user);

  const handleSecurityOption = (option) => {
    navigate(`/${option}`)
  };

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen pb-16">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold ml-2">Security</h1>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        <SettingItem 
          icon={Lock}
          text="Forget Password"
          onClick={() => handleSecurityOption('forget-password')}
        />
        <SettingItem 
          icon={RectangleEllipsis}
          text="Change Password"
          onClick={() => handleSecurityOption('change-password')}
        />
        <SettingItem 
          icon={Eye}
          text="Password Reset"
          onClick={() => handleSecurityOption('privacy')}
        />
        <SettingItem 
          icon={Headphones}
          text="Customar Support"
          onClick={() => handleSecurityOption('support')}
        />
      </div>


      <BottomNavigation userData={userData} />
    </div>
  );
};

export default Security;