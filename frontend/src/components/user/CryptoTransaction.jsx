import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader, AlertTriangle, Info, Copy } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const CryptoTransaction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { depositData } = location.state || {};
  const { leftTime } = location.state || {};
  const [status, setStatus] = useState('loading');
  const [timeLeft, setTimeLeft] = useState(leftTime || 60*60); 
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [depositDetails, setDepositDetails] = useState(null);
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => {
    if (!depositData || !depositData.depositId) {
      navigate('/');
      return;
    }

    // Set initial timer if available in deposit data
    if (depositData.expiryTimestamp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = Math.floor(new Date(depositData.expiryTimestamp).getTime() / 1000);
      const remainingTime = expiryTime - currentTime;
      
      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
      } else {
        setIsTimerActive(false);
      }
    }

    // Initial status check
    checkTransactionStatus();
    
    // Set up polling interval
    const statusInterval = setInterval(() => {
      if (isPolling) {
        checkTransactionStatus();
      }
    }, 15000); 
    
    return () => clearInterval(statusInterval);
  }, [depositData, navigate, isPolling]);

  // Timer countdown with warnings
  useEffect(() => {
    if (timeLeft > 0 && isTimerActive) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerActive(false);
            return 0;
          }
          
          // Show warnings at specific times
          if (prev === 300) { // 5 minutes
            toast.warning('5 minutes remaining for transaction confirmation');
          } else if (prev === 60) { // 1 minute
            toast.warning('Only 1 minute remaining!');
          }
          
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isTimerActive]);

  const formatTime = (seconds) => {
    if (seconds > 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const checkTransactionStatus = async () => {
    if (!depositData || !depositData.depositId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/status/${depositData.depositId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        const depositInfo = response.data.deposit;
        setDepositDetails(depositInfo);
        setStatus(depositInfo.status);

        
        if (['completed', 'rejected', 'failed'].includes(depositInfo.status)) {
          setIsPolling(false);
          
          if (depositInfo.status === 'completed') {
            toast.success('Deposit successfully completed!');
          } else if (['rejected', 'failed'].includes(depositInfo.status)) {
          }
        }
      }
    } catch (error) {
    }
  };

  // Render timer component
  const renderTimer = () => {
    if (!isTimerActive || timeLeft <= 0) return null;
    
    let timerColorClass = 'bg-blue-50 text-blue-600';
    if (timeLeft < 300) timerColorClass = 'bg-amber-50 text-amber-600';
    if (timeLeft < 60) timerColorClass = 'bg-red-50 text-red-600';
    
    return (
      <div className="mb-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 ${timerColorClass} rounded-full`}>
          <Clock className="w-4 h-4" />
          <span className="font-medium">{formatTime(timeLeft)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {timeLeft > 300 
            ? "Time remaining for transaction confirmation" 
            : timeLeft > 60 
              ? "Less than 5 minutes remaining!" 
              : "Final minute - confirmation needed urgently!"}
        </p>
      </div>
    );
  };

  // Render deposit details
  const renderDepositDetails = () => {
    if (!depositDetails) return null;

    return (
      <div className="w-full mb-6 mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Transaction Details</h3>
          <button 
            onClick={() => setShowFullDetails(!showFullDetails)} 
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showFullDetails ? 'Show Less' : 'Show More'}
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="text-gray-500">Amount</div>
            <div className="font-medium">{depositDetails.amount} {depositDetails.currency}</div>
            
            <div className="text-gray-500">Value in INR</div>
            <div className="font-medium">₹{depositDetails.receivedAmountINR.toLocaleString()}</div>
            
            <div className="text-gray-500">Network</div>
            <div className="font-medium">{depositDetails.network}</div>
            
            <div className="text-gray-500">Exchange Rate</div>
            <div className="font-medium">{depositDetails.rate} INR/{depositDetails.currency}</div>
          </div>

          {showFullDetails && (
            <>
              <div className="border-t border-gray-200 my-3"></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-gray-500">Transaction ID</div>
                <div className="font-medium flex items-center">
                  <span className="truncate w-24">{depositDetails.userTransactionId}</span>
                  <button 
                    onClick={() => handleCopy(depositDetails.userTransactionId)}
                    className="ml-1 text-gray-400 hover:text-blue-600"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-gray-500">Submitted</div>
                <div className="font-medium">{formatDate(depositDetails.userConfirmationTime)}</div>
                
                <div className="text-gray-500">Created</div>
                <div className="font-medium">{formatDate(depositDetails.createdAt)}</div>

                {depositDetails.status === 'completed' && depositDetails.transactionHash && (
                  <>
                    <div className="text-gray-500">Transaction Hash</div>
                    <div className="font-medium flex items-center">
                      <span className="truncate w-24">{depositDetails.transactionHash}</span>
                      <button 
                        onClick={() => handleCopy(depositDetails.transactionHash)}
                        className="ml-1 text-gray-400 hover:text-blue-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}

                {['rejected', 'failed'].includes(depositDetails.status) && depositDetails.rejectionReason && (
                  <>
                    <div className="text-gray-500">Reason</div>
                    <div className="font-medium text-red-600">{depositDetails.rejectionReason}</div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render appropriate status UI
  const renderStatusContent = () => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Deposit Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your deposit of {depositDetails?.amount} {depositDetails?.currency} has been confirmed and added to your balance.
            </p>
            {renderDepositDetails()}
            <button
                onClick={() => navigate('/support', { 
                    state: { 
                    issueType: 'deposit_issue',
                    depositId: depositData.depositId
                    } 
                })}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm flex-1"
                >
                Contact Support
            </button>
          </div>
        );

      case 'rejected':
      case 'failed':
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Deposit Failed</h2>
            <p className="text-gray-600 mb-6">
              Unfortunately, your deposit of {depositDetails?.amount} {depositDetails?.currency} could not be processed. 
              {depositDetails?.rejectionReason ? ` Reason: ${depositDetails.rejectionReason}` : ''}
            </p>
            {renderDepositDetails()}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex-1"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/support',{ 
                    state: { 
                    issueType: 'deposit_issue',
                    depositId: depositData.depositId
                    } 
                })}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm flex-1"
              >
                Contact Support
              </button>
            </div>
          </div>
        );

      case 'pending':
      case 'user_confirmed':
      default:
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Confirming Your Transaction</h2>
            <p className="text-gray-600 mb-6">
              {status === 'user_confirmed' 
                ? "We've received your transaction ID and are waiting for blockchain confirmation." 
                : "We're verifying your deposit transaction on the blockchain."}
            </p>
            
            {renderTimer()}
            {renderDepositDetails()}
            
            <div className="bg-blue-50 p-4 rounded-lg w-full max-w-sm mb-4">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Blockchain confirmations typically take 10-30 minutes depending on network conditions.
                  You can safely close this page and check your transaction history later.
                </p>
              </div>
            </div>
            
            {!isTimerActive && timeLeft <= 0 && status !== 'completed' && (
              <div className="bg-amber-50 p-4 rounded-lg w-full max-w-sm">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    The confirmation window has expired, but we're still processing your transaction.
                    No action is needed from your side at this time.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  if (!depositData) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-6 shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Transaction Status</h1>
            <p className="text-sm text-gray-500">
              Deposit ID: <span className="font-mono">{depositData.depositId}</span>
            </p>
          </div>
        </div>

        {renderStatusContent()}
      </div>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      />
    </div>
  );
};

export default CryptoTransaction;