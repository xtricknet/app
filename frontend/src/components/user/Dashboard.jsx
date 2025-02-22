import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight, Users, Wallet, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import BottomNavigation from './BottomNavigation';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <Card className="p-4 bg-white shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 rounded-lg bg-gray-50">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
    </div>
    <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
    <p className="text-xl font-semibold">{value}</p>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userData);
  
  const stats = [
    {
      title: 'Total Balance',
      value: `₹${userData.balance.toFixed(2)}`,
      icon: Wallet,
      trend: 2.5
    },
    {
      title: 'Total Rewards',
      value: `₹${userData.totalReward.toFixed(2)}`,
      icon: BarChart3,
      trend: -1.2
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
        <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
          
        </button>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Transaction Summary */}
      <div className="p-4">
        <Card className="p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Pay In</p>
                  <p className="text-sm text-gray-500">{userData.transactionDetails.filter(t => t.type === 'deposit').length} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{userData.payin.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50">
                  <ArrowDownRight className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium">Pay Out</p>
                  <p className="text-sm text-gray-500">{userData.transactionDetails.filter(t => t.type === 'withdrawal').length} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{userData.payout.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="p-4 pb-24">
        <Card className="p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>
          <div className="space-y-3">
            <Link to={'/transactions'}>  
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-gray-600">Pending Deposits</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${userData.pendingDeposit.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link>
            <Link to={'/transactions'}>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-gray-600">Pending Withdrawal</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">₹{userData.pendingWithdrawal}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link> 
          </div>
        </Card>
      </div>
        {/* Bottom Navigation */}
       <BottomNavigation userData={userData} />
    </div>
  );
};

export default Dashboard;