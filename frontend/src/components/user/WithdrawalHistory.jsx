import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Clock} from 'lucide-react';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StatusIcon = ({ status }) => {
  const icons = {
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    processing: <Clock className="w-5 h-5 text-yellow-500" />,
    rejected: <XCircle className="w-5 h-5 text-red-500" />,
    failed: <XCircle className="w-5 h-5 text-red-500" />,
    pending: <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
  };
  return icons[status] || <Clock className="w-5 h-5 text-yellow-500" />;
};

const WithdrawalItem = ({ withdrawal }) => {
  const getStatusStyle = () => {
    switch (withdrawal.status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/10';
      case 'rejected':
      case 'failed':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10';
      default:
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/10';
    }
  };

  const getAmountColor = () => {
    switch (withdrawal.status) {
      case 'completed': return 'text-emerald-500';
      case 'processing': return 'text-amber-500';
      case 'rejected':
      case 'failed': return 'text-rose-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="group relative rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Status and Time */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle()}`}>
              {withdrawal.method?.toUpperCase()}
            </span>
            <StatusIcon status={withdrawal.status} />
          </div>
          <time className="text-sm text-gray-500">
            {formatDate(withdrawal.time)}
          </time>
        </div>

        {/* Right side - Amount */}
        <div className="flex flex-col items-end space-y-1">
          <span className={`font-semibold text-lg ${getAmountColor()}`}>
            ₹{withdrawal.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Withdrawal Details */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex flex-col space-y-1">
          <span className="text-xs text-gray-500">
            ID: #{withdrawal.id.slice(0, 8)}
          </span>
          
          {withdrawal.transactionId && (
            <span className="text-xs text-gray-500">
              Transaction ID: {withdrawal.transactionId}
            </span>
          )}
          
          {withdrawal.utrNumber && (
            <p className="text-xs text-gray-500">
              UTR: {withdrawal.utrNumber}
            </p>
          )}
          
          {withdrawal.rejectionReason && (
            <p className="text-xs text-rose-500">
              Reason: {withdrawal.rejectionReason}
            </p>
          )}

          {withdrawal.processedAt && (
            <p className="text-xs text-gray-500">
              Processed: {formatDate(withdrawal.processedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const WithdrawalHistory = ({ userId, onBack }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWithdrawalHistory();
  }, [userId]);

  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/withdrawl/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setWithdrawals(response.data.withdrawals);
      } else {
        throw new Error(response.data.message || 'Failed to fetch withdrawals');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch withdrawal history');
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
        <h2 className="text-lg font-bold text-gray-800">Withdrawal History</h2>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Withdrawals List */}
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
        ) : withdrawals.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg border">
            <p className="text-gray-500">No withdrawal history found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <WithdrawalItem key={withdrawal.id} withdrawal={withdrawal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalHistory;