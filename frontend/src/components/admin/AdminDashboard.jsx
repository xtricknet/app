import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ChartPie, Users, Wallet, BadgePercent, TicketSlash, ArrowDownCircle, ArrowUpCircle, Settings, Settings2, LogOut, Menu, X } from 'lucide-react';
import Status from './Status';
import UserManagement from './UserManagement';
import DepositManagement from './DepositManagement';
import WithdrawalManagement from './WithdrawalManagement';
import TransactionManagement from './TransactionManagement';
import SettingManagement from './SettingManagement';
import WithdrawalSettings from './WithdrawalSettings';
import ReferralLevels from './ReferralLevels';
import Offers from './Offers';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('status');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'status', label: 'Status', icon: ChartPie },
    { id: 'users', label: 'UserManagement', icon: Users },
    { id: 'deposits', label: 'DepositManagement', icon: ArrowDownCircle },
    { id: 'withdrawals', label: 'WithdrawalManagement', icon: ArrowUpCircle },
    { id: 'transactions', label: 'TransactionManagement', icon: Wallet },
    { id: 'settings', label: 'Deposit SettingManagement', icon: Settings },
    { id: 'withdrawalsettings', label: 'Withdrawal SettingManagement', icon: Settings2 },
    { id: 'referrallevels', label: 'Referral SettingManagement', icon: TicketSlash },
    { id: 'specialoffers', label: 'Special Offers Management', icon: BadgePercent } 
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/logout`, {}, { withCredentials: true });
      toast.success('Logged out successfully');
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      navigate('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'status':
        return <Status />;
      case 'users':
        return <UserManagement />;
      case 'deposits':
        return <DepositManagement />;
      case 'withdrawals':
        return <WithdrawalManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'settings':
        return <SettingManagement />;
      case 'withdrawalsettings':
        return <WithdrawalSettings />;
      case 'referrallevels':
        return <ReferralLevels />
      case 'specialoffers':
        return <Offers />
      default:
        return <Status />;
    }
  };

  const handleMenuItemClick = (id) => {
    setActiveTab(id);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-lg"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative w-64 bg-white shadow-lg flex flex-col z-10 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <nav className="flex-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
              isLoggingOut 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="p-8 pt-16 lg:pt-8">
          {renderContent()}
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminDashboard;