import React from 'react';
import { ArrowLeft, Headphones, RefreshCw, Package, Box, Lock, PencilLine} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingItem = ({ icon: Icon, text, value }) => (
  <div className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 cursor-pointer">
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

const Setting = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // First clear all localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    
    // Use window.location instead of navigate
    window.location.href = '/login';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold ml-2">Setting</h1>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        <SettingItem 
          icon={Headphones}
          text="Customer service"
        />
        <SettingItem 
          icon={RefreshCw}
          text="Version"
          value="v1.1.0"
        />
        <SettingItem 
          icon={Package}
          text="Privacy policy"
        />
        <SettingItem 
          icon={Box}
          text="Install the official version"
        />
      </div>

      <div className="px-6 py-8">
        <button 
          className="w-full py-3 text-indigo-600 text-lg font-medium hover:bg-red-100 rounded-lg transition-colors duration-200"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Setting;