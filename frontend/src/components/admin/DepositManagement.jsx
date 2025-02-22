import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ChevronLeft, ChevronRight, RefreshCw, Filter, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import toast, { Toaster } from "react-hot-toast";

// ReviewModal component with improved visuals
const ReviewModal = ({ deposit, onClose, onReject, onApprove, processing }) => {
  const [localRejectionReason, setLocalRejectionReason] = useState("");

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "user_confirmed":
        return "bg-blue-100 text-blue-800";
      case "admin_approved":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRejectClick = () => {
    if (!localRejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    onReject(deposit.depositId, localRejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <Card className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 border-0">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center text-xl">
            <span className="mr-2 text-blue-600">Review Deposit</span>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-auto ${getStatusColor(deposit.status)}`}>
              {deposit.status}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* User Information */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              User Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-lg font-semibold mt-1 text-gray-800">{deposit.user.username || 'Deleted Account'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(deposit.status)}`}>
                  {deposit.status}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Transaction Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-semibold mt-1 text-gray-800">
                  {deposit.amount} {deposit.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Network</p>
                <p className="text-lg font-semibold mt-1 text-gray-800">{deposit.network}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rate</p>
                <p className="text-lg font-semibold mt-1 text-gray-800">₹{deposit.rate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Received Amount (INR)</p>
                <p className="text-lg font-semibold mt-1 text-gray-800">₹{deposit.receivedAmountINR}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Received Amount (INR)</p>
                <p className="text-lg font-semibold mt-1 text-gray-800">₹{deposit.reward}</p>
              </div>
              {deposit.userTransactionId && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">User Transaction ID</p>
                  <div className="relative mt-1">
                    <p className="text-base font-semibold break-all bg-white p-2 rounded border border-gray-200">
                      {deposit.userTransactionId}
                    </p>
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700" 
                      onClick={() => {
                        navigator.clipboard.writeText(deposit.userTransactionId);
                        toast.success('Transaction ID copied to clipboard');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timing Information */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Timing Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-base font-semibold mt-1 text-gray-800">
                  {formatDate(deposit.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="text-base font-semibold mt-1 text-gray-800">
                  {formatDate(deposit.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={localRejectionReason}
                onChange={(e) => setLocalRejectionReason(e.target.value)}
                placeholder="Enter rejection reason (required for rejecting)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {localRejectionReason.length} characters
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRejectClick}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors focus:ring-2 focus:ring-red-500 disabled:opacity-50 font-medium flex items-center justify-center"
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Reject
                  </>
                )}
              </button>
              <button
                onClick={() => onApprove(deposit.depositId)}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium flex items-center justify-center"
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Approve
                  </>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-500 font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DepositManagement = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const depositsPerPage = 9;
  const [refreshing, setRefreshing] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalAmount: 0,
    totalAmountINR:0,
    completed: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    user_confirmed: { count: 0, amount: 0 },
    admin_approved: { count: 0, amount: 0 }
  });

  const calculateStats = (depositData) => {
    const newStats = {
      totalDeposits: depositData.length,
      totalAmount: 0,
      totalAmountINR:0,
      completed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      user_confirmed: { count: 0, amount: 0 },
      admin_approved: { count: 0, amount: 0 }
    };

    depositData.forEach((deposit) => {
      const amounts = parseFloat(deposit.amount || 0);
      const amountINR = parseFloat(deposit.receivedAmountINR ||0)
      newStats.totalAmount += amounts;
      newStats.totalAmountINR +=amountINR;

      if (newStats[deposit.status]) {
        newStats[deposit.status].count += 1;
        newStats[deposit.status].amount += amounts;
      }
    });

    setStats(newStats);
  };

  const fetchDeposits = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/deposits`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      // Sort deposits by date in descending order (newest first)
      const sortedDeposits = res.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setDeposits(sortedDeposits);
      calculateStats(sortedDeposits);
      setError(null);
      if (!loading) toast.success("Data refreshed successfully");
    } catch (err) {
      setError("Failed to fetch deposits");
      toast.error("Failed to fetch deposits");
      console.error("Error fetching deposits:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (depositId) => {
    setProcessingId(depositId);
    setError(null);
  
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/deposits/approve/${depositId}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      toast.success("Deposit approved successfully!");
      setSelectedDeposit(null);
      fetchDeposits();
    } catch (err) {
      setError("Failed to approve deposit");
      toast.error("Failed to approve deposit!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (depositId, reason) => {
    setProcessingId(depositId);
    setError(null);
  
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/deposits/reject/${depositId}`,
        { reason }, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      toast.success("Deposit rejected successfully!");
      setSelectedDeposit(null);
      fetchDeposits();
    } catch (err) {
      setError("Failed to reject deposit");
      toast.error("Failed to reject deposit!");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "user_confirmed":
        return "bg-blue-100 text-blue-800";
      case "admin_approved":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Format currency with commas and two decimal places
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const filteredDeposits = deposits.filter(deposit => 
    filterStatus === "all" ? true : deposit.status === filterStatus
  );

  // Pagination logic
  const indexOfLastDeposit = currentPage * depositsPerPage;
  const indexOfFirstDeposit = indexOfLastDeposit - depositsPerPage;
  const currentDeposits = filteredDeposits.slice(indexOfFirstDeposit, indexOfLastDeposit);
  const totalPages = Math.ceil(filteredDeposits.length / depositsPerPage);

  // Stat Card Component with gradient backgrounds
  const StatCard = ({ title, value, icon, gradient }) => (
    <div className={`${gradient} rounded-xl p-6 shadow-md transition-transform hover:scale-105 cursor-default`}>
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-white text-sm font-medium ml-2">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );

  const DepositCard = ({ deposit }) => (
    <Card className="rounded-xl shadow-md hover:shadow-xl transition-all hover:translate-y-[-4px] duration-300 overflow-hidden border-0">
      <div className="relative">
        <div className={`absolute right-0 top-0 w-3 h-full ${
          deposit.status === "completed" ? "bg-green-500" :
          deposit.status === "rejected" ? "bg-red-500" :
          deposit.status === "user_confirmed" ? "bg-blue-500" :
          deposit.status === "admin_approved" ? "bg-purple-500" :
          "bg-yellow-500"
        }`}></div>
        
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">{deposit.user.username || 'Deleted Account'}</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                {deposit.status}
              </span>
            </CardTitle>
            <p className="text-sm text-gray-500">
              Created {new Date(deposit.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {deposit.amount} {deposit.currency}
            </p>
            <p className="text-sm text-gray-500">₹{deposit.receivedAmountINR}</p>
          </div>
        </CardHeader>
      </div>
      
      <CardContent className="pt-4 pb-2">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
              <span className="text-gray-500">Network</span>
            </div>
            <div className="text-right font-medium text-gray-800">{deposit.network}</div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-500">Rate</span>
            </div>
            <div className="text-right font-medium text-gray-800">₹{deposit.rate}</div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-500">Recived Reward</span>
            </div>
            <div className="text-right font-medium text-gray-800">₹{deposit.reward}</div>

            
          </div>
          
          {deposit.userTransactionId && (
            <div className="pt-2 border-t border-gray-100 mt-3">
              <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
              <div className="relative">
                <p className="text-sm font-medium text-gray-800 truncate pr-8" title={deposit.userTransactionId}>
                  {deposit.userTransactionId}
                </p>
                <button 
                  className="absolute right-0 top-0 text-blue-500 hover:text-blue-700" 
                  onClick={() => {
                    navigator.clipboard.writeText(deposit.userTransactionId);
                    toast.success('Transaction ID copied to clipboard');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-1 pb-4">
        {deposit.status === "user_confirmed"&& (
          <button
            className="w-full mt-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 font-medium flex items-center justify-center"
            onClick={() => setSelectedDeposit(deposit)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Review Deposit
          </button>
        )}
      </CardFooter>
    </Card>
  );

  const Pagination = () => (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 flex items-center shadow-sm hover:bg-gray-50 transition-colors disabled:hover:bg-white"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </button>
      <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
        <span className="font-medium text-gray-700">
          Page {currentPage} of {totalPages || 1}
        </span>
      </div>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 flex items-center shadow-sm hover:bg-gray-50 transition-colors disabled:hover:bg-white"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 animate-pulse">Loading deposits...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg border-0 overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Deposit Management
              </CardTitle>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => fetchDeposits()}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center font-medium"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <div className="relative">
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center font-medium shadow-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 hidden">
                    {/* Filter options would go here */}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Deposits"
                value={stats.totalDeposits}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-100" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard 
                title="Total Amount"
                value={`${formatCurrency(stats.totalAmount)}`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-100" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard 
                title="Total Amount (INR)"
                value={`₹${stats.totalAmountINR.toFixed(2)}`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-100" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <StatCard 
                title="Pending Review"
                value={stats.pending?.count || 0}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-100" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>}
                gradient="bg-gradient-to-br from-orange-500 to-orange-600"
              />
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800">All Deposits</h2>
              <div className="flex items-center">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="user_confirmed">User Confirmed</option>
                  <option value="admin_approved">Admin Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {filteredDeposits.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">No deposits found</p>
                <p className="text-sm text-gray-500 mb-6">
                  {filterStatus === "all" 
                    ? "There are no deposits in the system yet."
                    : `No deposits with '${filterStatus}' status found.`}
                </p>
                <button
                  onClick={() => setFilterStatus("all")}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 font-medium inline-flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentDeposits.map((deposit) => (
                    <DepositCard key={deposit.depositId} deposit={deposit} />
                  ))}
                </div>
                <Pagination />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDeposit && (
        <ReviewModal
          deposit={selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          onReject={handleReject}
          onApprove={handleApprove}
          processing={!!processingId}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
};

export default DepositManagement;