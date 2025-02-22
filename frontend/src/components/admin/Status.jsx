import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Wallet,
  Ban,
  LockKeyhole,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  Gift,
} from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/admin`;

const fetchWithAuth = async (endpoint, token) => {
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const StatCard = ({ icon: Icon, title, mainValue, subValue, trend }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
    <div className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-600">{title}</h3>
        </div>
        {trend && (
          <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {mainValue}
        </p>
        {subValue && (
          <p className="text-sm text-gray-500 font-medium">{subValue}</p>
        )}
      </div>
    </div>
  </div>
);

const Status = () => {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      banned: 0,
      locked: 0,
    },
    finances: {
      totalBalance: 0,
      totalRewards: 0,
    },
    transactions: {
      totalDeposits: 0,
      totalWithdrawals: 0,
      depositAmount: 0,
      withdrawalAmount: 0,
      total: 0,
    },
  });
  
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Users
        const users = await fetchWithAuth("users", token);
        const userStats = {
          total: users.length,
          banned: users.filter(u => u.banned).length,
          locked: users.filter(u => u.isLocked).length,
          totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
          totalRewards: users.reduce((sum, u) => sum + u.totalReward, 0),
        };

        // Fetch Deposits
        const deposits = await fetchWithAuth("deposits", token);
        const depositStats = {
          total: deposits.length,
          amount: deposits.reduce((sum, d) => sum + d.receivedAmountINR, 0),
        };

        // Fetch Withdrawals
        const withdrawals = await fetchWithAuth("withdrawals", token);
        const withdrawalStats = {
          total: withdrawals.length,
          amount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
        };

        // Fetch Transactions
        const transactions = await fetchWithAuth("transactions", token);

        setStats({
          users: {
            total: userStats.total,
            banned: userStats.banned,
            locked: userStats.locked,
          },
          finances: {
            totalBalance: userStats.totalBalance,
            totalRewards: userStats.totalRewards,
          },
          transactions: {
            totalDeposits: depositStats.total,
            totalWithdrawals: withdrawalStats.total,
            depositAmount: depositStats.amount,
            withdrawalAmount: withdrawalStats.amount,
            total: transactions.length,
          },
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [token]);

  const formatCurrency = (amount) => 
    `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            System Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            mainValue={stats.users.total.toLocaleString()}
            subValue="Active accounts in system"
            trend={2.5}
          />
          <StatCard
            icon={Ban}
            title="Banned Users"
            mainValue={stats.users.banned.toLocaleString()}
            subValue="Restricted accounts"
            trend={-1.2}
          />
          <StatCard
            icon={LockKeyhole}
            title="Locked Users"
            mainValue={stats.users.locked.toLocaleString()}
            subValue="Temporarily locked"
            trend={0.8}
          />
          <StatCard
            icon={Wallet}
            title="System Balance"
            mainValue={formatCurrency(stats.finances.totalBalance)}
            subValue="Total user balances"
            trend={3.7}
          />
          <StatCard
            icon={Gift}
            title="Total Rewards"
            mainValue={formatCurrency(stats.finances.totalRewards)}
            subValue="Distributed rewards"
            trend={5.2}
          />
          <StatCard
            icon={ArrowDownToLine}
            title="Deposits"
            mainValue={stats.transactions.totalDeposits.toLocaleString()}
            subValue={`Total: ${formatCurrency(stats.transactions.depositAmount)}`}
            trend={4.3}
          />
          <StatCard
            icon={ArrowUpFromLine}
            title="Withdrawals"
            mainValue={stats.transactions.totalWithdrawals.toLocaleString()}
            subValue={`Total: ${formatCurrency(stats.transactions.withdrawalAmount)}`}
            trend={-2.1}
          />
          <StatCard
            icon={Receipt}
            title="Transactions"
            mainValue={stats.transactions.total.toLocaleString()}
            subValue="Total system transactions"
            trend={1.9}
          />
        </div>
      </div>
    </div>
  );
};

export default Status;