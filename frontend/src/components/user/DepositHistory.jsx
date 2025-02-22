import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

const StatusIcon = ({ status }) => {
  const icons = {
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    user_confirmed: <Clock className="w-5 h-5 text-yellow-500" />,
    rejected: <XCircle className="w-5 h-5 text-red-500" />,
    pending: <Clock className="w-5 h-5 text-yellow-500" />
  };
  return icons[status] || <Clock className="w-5 h-5 text-yellow-500" />;
};

const DepositItem = ({ deposit }) => {
  const getStatusStyle = () => {
    switch (deposit.status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10';
      case 'user_confirmed':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/10';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10';
      default:
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/10';
    }
  };

  const getAmountColor = () => {
    switch (deposit.status) {
      case 'completed': return 'text-emerald-500';
      case 'user_confirmed': return 'text-amber-500';
      case 'rejected': return 'text-rose-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="group relative rounded-xl bg-white p-4 m-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Status and Time */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle()}`}>
              {deposit.type}
            </span>
            <StatusIcon status={deposit.status} />
          </div>
          <time className="text-sm text-gray-500">
            {deposit.time}
          </time>
        </div>

        {/* Right side - Amounts */}
        <div className="flex flex-col items-end space-y-1">
          <span className={`font-semibold text-lg ${getAmountColor()}`}>
            ${deposit.amount.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            ₹{deposit.inr.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            ID: #{deposit.id.slice(0, 8)}
          </span>
        </div>
        
        {deposit.txHash && (
          <p className="text-xs text-gray-500 font-mono mt-1">
            TxHash: {deposit.txHash.slice(0, 8)}...{deposit.txHash.slice(-8)}
          </p>
        )}
        
        {deposit.status === 'REJECTED' && deposit.rejectionReason && (
          <p className="mt-2 text-xs text-rose-500">
            Reason: {deposit.rejectionReason}
          </p>
        )}
      </div>
    </div>
  );
};

const DepositHistory = ({ userId, onBack }) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepositHistory();
  }, [userId]);

  const fetchDepositHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/deposits/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setDeposits(response.data.deposits);
        console.log(response.data.deposits)
      } else {
        throw new Error(response.data.message || 'Failed to fetch deposits');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch deposit history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={onBack}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Deposit History</h2>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Deposits List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : deposits.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg border">
            <p className="text-gray-500">No deposit history found</p>
          </div>
        ) : (
          <div className="space-y-3">
          {deposits.map((deposit) => (

            <Link 
              key={deposit.id}
              to="/crypto-transaction-status" 
              state={{
                depositData: {
                  depositId: deposit.id,
                  status: deposit.status 
                },
                leftTime: 0
              }}
            >
              
              <DepositItem deposit={deposit} />
            </Link>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default DepositHistory;