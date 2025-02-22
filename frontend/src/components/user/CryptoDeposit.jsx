import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast, {Toaster} from 'react-hot-toast';

const CryptoDeposit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { depositData } = location.state || {};
  const [txnId, setTxnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [showDetails, setShowDetails] = useState(true);
  const [isTransactionSubmitted, setIsTransactionSubmitted] = useState(false);

  // Prevent back navigation if transaction not submitted
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isTransactionSubmitted) {
        e.preventDefault();
        e.returnValue = '';
        toast.error('Please submit transaction ID before leaving');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTransactionSubmitted]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (timeLeft === 300) {
          toast.warning('5 minutes remaining to complete the transaction!');
        }
        // Warning at 1 minute
        if (timeLeft === 60) {
          toast.warning('1 minute remaining! Please complete the transaction.');
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      toast.error('Time expired. Please create a new deposit request.');
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleTxnSubmit = async () => {
    if (!txnId || txnId.trim() === '') {
      setError('Transaction ID is required');
      toast.error('Transaction ID is required');
      return;
    }
  
    const txnIdRegex = /^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}|[A-Za-z0-9]{43,88}|[A-Z2-7]{52,64})$/;
    if (!txnIdRegex.test(txnId)) {
      setError('Enter a valid transaction ID');
      toast.error('Please enter a valid transaction ID');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/deposits/confirm/${depositData.depositId}`,
        { userTransactionId: txnId }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setIsTransactionSubmitted(true);
      setPaymentStatus('user_confirmed');
      toast.success('Transaction ID submitted successfully!');
      
      // Navigate to the transaction status page with the deposit data
      navigate('/crypto-transaction-status', { 
        state: { 
          depositData: {
            ...depositData,
            status: 'user_confirmed' 
          },
          leftTime: timeLeft
        }
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to confirm transaction';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!depositData) {
      toast.error('No deposit data found. Redirecting to deposit page...');
      navigate('/deposit');
      return null;
    }
  }, [depositData, navigate]);

  if (!depositData) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Status Banner */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="text-lg font-medium">Complete Your Payment</span>
        </div>

        {/* Timer Section */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">{formatTime(timeLeft)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Time remaining to complete payment</p>
        </div>

        {/* QR Code Section */}
        <div className="mb-6">
          <div className="flex flex-col items-center mb-4">
            {depositData.qrCode ? (
              <img 
                src={depositData.qrCode} 
                alt="Payment QR Code" 
                className="w-48 h-48 rounded-lg mb-2"
                onLoad={() => toast.success('QR Code loaded successfully')}
                onError={() => toast.error('Failed to load QR Code')}
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Amount and Wallet Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">Amount to Send</p>
              <p className="text-xl font-semibold">{depositData.amount} {depositData.currency}</p>
              <p className="text-sm text-gray-500">≈ ₹{depositData.receivedAmountINR}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Wallet Address ({depositData.network})</p>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                <p className="text-sm font-mono flex-1 break-all">{depositData.walletAddress}</p>
                <button 
                  onClick={() => handleCopy(depositData.walletAddress)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {timeLeft > 0 ? (
          <>
            {/* Transaction ID Input */}
            {paymentStatus === 'pending' && (
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-2">Enter Transaction ID</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="Enter your transaction ID"
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTransactionSubmitted}
                  />
                  <button
                    onClick={handleTxnSubmit}
                    disabled={isSubmitting || !txnId.trim() || isTransactionSubmitted}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 hover:bg-blue-700 transition-colors"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            )}

            {/* Payment Status */}
            {paymentStatus === 'user_confirmed' && (
              <div className="p-4 bg-blue-50 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  Transaction confirmed. Waiting for Blockchain confirmation.
                </p>
              </div>
            )}

            {/* Warning */}
            <div className="p-4 bg-yellow-50 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                Please make sure to send only {depositData.currency} through {depositData.network} network. 
                Other currencies or networks may result in permanent loss.
              </p>
            </div>

            {/* Transaction ID Display */}
            <div>
              <p className="text-gray-500 text-sm mb-2">Deposit ID</p>
              <p className="font-mono text-sm">{depositData.depositId}</p>
            </div>
          </>
        ) : (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              Time expired. Please create a new deposit request.
            </p>
          </div>
        )}
      </div>
      <Toaster       
           position='top-right'
           reverseOrder={false} 
      />
    </div>
  );
};

export default CryptoDeposit;