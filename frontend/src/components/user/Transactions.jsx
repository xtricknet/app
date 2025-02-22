import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BottomNavigation from './BottomNavigation';

const TransactionStatusIcon = ({ status }) => {
  const icons = {
    pending: <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    failed: <XCircle className="w-5 h-5 text-red-500" />
  };
  return icons[status] || null;
};

const TransactionItem = ({ transaction }) => {
  const { transactionId, type, amount, fee, status, createdAt, transactionHash } = transaction;
  
  const getTypeStyle = () => {
    if (type === 'deposit') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10';
    if (type === 'withdrawal') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10';
    return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-emerald-500';
      case 'pending': return 'text-amber-500';
      case 'failed': return 'text-rose-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="group relative rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Type and Time */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTypeStyle()}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
            <TransactionStatusIcon status={status} />
          </div>
          <time className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
        </div>

        {/* Right side - Amount, Fee, and ID */}
        <div className="flex flex-col items-end space-y-1">
          <span className={`font-semibold text-lg ${getStatusColor()}`}>
            {`${type === 'deposit' ? '$' : '₹'}${amount.toFixed(2)}`}
          </span>
          {fee > 0 && (
            <span className="text-xs text-gray-500">
              Fee: ₹{fee.toFixed(2)}
            </span>
          )}
          <span className="text-xs text-gray-400">
            #{transactionId.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Transaction Hash - Only shown if available */}
      {transactionHash && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-mono">
            TxID: {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
          </p>
        </div>
      )}
    </div>
  );
};

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionType, setTransactionType] = useState('payin'); // payin or payout
  const { userData } = useSelector((state) => state.user);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userData?.userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const sortedTransactions = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sortedTransactions);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userData?.userId, token]);

  const filteredTransactions = transactions.filter(tx => {
    if (transactionType === 'payin') return tx.type === 'deposit';
    if (transactionType === 'payout') return tx.type === 'withdrawal';
    if (transactionType === 'others') return tx.type === 'special_offer_reward' || tx.type === 'referral_reward';

    return tx.type === 'others';
  });

  if (!userData?.userId) {
    return (navigate("/login"));
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 pb-12 m-8 min-h-screen">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
        <button 
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
         {/* Clock for future */}
        </button>
      </div>

      {/* Transaction Type Toggle */}
      <div className="p-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-4">
          <button 
            className={`flex-1 py-2 rounded-md text-center transition-all ${
              transactionType === 'payin' ? 'bg-white shadow-sm font-medium' : 'text-gray-600 hover:bg-white/50'
            }`}
            onClick={() => setTransactionType('payin')}
          >
            Pay In
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-center transition-all ${
              transactionType === 'payout' ? 'bg-white shadow-sm font-medium' : 'text-gray-600 hover:bg-white/50'
            }`}
            onClick={() => setTransactionType('payout')}
          >
            Pay Out
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-center transition-all ${
              transactionType === 'others' ? 'bg-white shadow-sm font-medium' : 'text-gray-600 hover:bg-white/50'
            }`}
            onClick={() => setTransactionType('others')}
          >
            Others
          </button>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg border">
            <p className="text-gray-500">
              No {transactionType === 'payin' 
                ? 'deposits' 
                : transactionType === 'payout' 
                ? 'withdrawals' 
                : 'other transactions'} found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.transactionId} 
                transaction={transaction}
              />
            ))}
          </div>
        )}
      </div>
      {/* Bottom Navigation */}
      <BottomNavigation userData={userData} />
    </div>
  );
};

export default Transactions;