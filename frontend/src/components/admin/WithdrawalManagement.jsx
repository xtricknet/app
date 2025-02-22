import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowRight, CheckCircle, XCircle, Clock, AlertCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import QRCode from "react-qr-code";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

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

const WithdrawalCard = ({ withdrawal, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="rounded-xl shadow-md hover:shadow-xl transition-all hover:translate-y-[-4px] duration-300 overflow-hidden border-0">
      <div className="relative">
        <div className={`absolute right-0 top-0 w-3 h-full ${
          withdrawal.status === "completed" ? "bg-green-500" :
          withdrawal.status === "rejected" ? "bg-red-500" :
          "bg-yellow-500"
        }`}></div>
        
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">{withdrawal.user.username || 'Anonymous'}</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                {withdrawal.status}
              </span>
            </CardTitle>
            <p className="text-sm text-gray-500">
              Created {formatDate(withdrawal.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">₹{withdrawal.amount}</p>
            <p className="text-sm text-gray-500">Net: ₹{withdrawal.paidAmount}</p>
          </div>
        </CardHeader>
      </div>
      
      <CardContent className="pt-4 pb-2">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-500">Method</span>
            </div>
            <div className="text-right font-medium text-gray-800 capitalize">{withdrawal.withdrawalMethod}</div>
            
            {withdrawal.status === "completed" && (
              <>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                  </svg>
                  <span className="text-gray-500">UTR</span>
                </div>
                <div className="text-right font-medium text-gray-800">{withdrawal.utrNumber}</div>
              </>
            )}
          </div>
          {withdrawal.withdrawalMethod === 'upi' ? (
  withdrawal.upiDetails?.upiId && (
    <div className="pt-2 border-t border-gray-100 mt-3">
      <p className="text-xs text-gray-500 mb-1">UPI ID</p>
      <div className="relative">
        <p className="text-sm font-medium text-gray-800 truncate pr-8" title={withdrawal.upiDetails.upiId}>
          {withdrawal.upiDetails.upiId}
        </p>
        <button 
          className="absolute right-0 top-0 text-blue-500 hover:text-blue-700" 
          onClick={() => {
            navigator.clipboard.writeText(withdrawal.upiDetails.upiId);
            toast.success('UPI ID copied to clipboard');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
  )
            ) : withdrawal.withdrawalMethod === 'bank' ? (
              withdrawal.bankDetails?.accountNumber && (
                <div className="pt-2 border-t border-gray-100 mt-3">
                  <p className="text-xs text-gray-500 mb-1">Bank Account Number</p>
                  <div className="relative">
                    <p className="text-sm font-medium text-gray-800 truncate pr-8" title={withdrawal.bankDetails.accountNumber}>
                      {withdrawal.bankDetails.accountNumber}
                    </p>
                    <button 
                      className="absolute right-0 top-0 text-blue-500 hover:text-blue-700" 
                      onClick={() => {
                        navigator.clipboard.writeText(withdrawal.bankDetails.accountNumber);
                        toast.success('Account number copied to clipboard');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            ) : null}
        </div>
      </CardContent>
      
      <CardFooter className="pt-1 pb-4">
        {withdrawal.status === "pending" && (
          <button
            onClick={onClick}
            className="w-full mt-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 font-medium flex items-center justify-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            Review Request
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

// Review Modal component remains the same...
const ReviewModal = ({ withdrawal, onClose, onReject, onApprove, processing }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [utrNumber, setUtrNumber] = useState("");

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    onReject(withdrawal._id, rejectionReason);
  };

  const handleApprove = () => {
    if (!utrNumber.trim()) {
      toast.error("Please provide UTR number");
      return;
    }
    onApprove(withdrawal._id, utrNumber);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Review Withdrawal</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium 
            ${withdrawal.status === "completed" ? "bg-green-50 text-green-700" :
              withdrawal.status === "rejected" ? "bg-red-50 text-red-700" :
              "bg-yellow-50 text-yellow-700"}`}>
            {withdrawal.status === "completed" ? <CheckCircle className="h-4 w-4" /> :
            withdrawal.status === "rejected" ? <XCircle className="h-4 w-4" /> :
            <Clock className="h-4 w-4" />}
            {withdrawal.status === "completed" ? "Completed" :
            withdrawal.status === "rejected" ? "Rejected" :
            "Pending Review"}
          </div>

          {/* Amount and Method Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Amount</p>
              <p className="text-lg font-semibold">₹{withdrawal.amount}</p>
              <p className="text-sm text-gray-500 mt-1">Net: ₹{withdrawal.paidAmount}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Method</p>
              <p className="text-lg font-semibold capitalize">{withdrawal.withdrawalMethod}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-blue-900">Payment Details</h3>
            
            {withdrawal.withdrawalMethod === 'upi' ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-blue-700">UPI ID</p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded mt-1">
                    <p className="font-medium">{withdrawal.upiDetails?.upiId}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(withdrawal.upiDetails?.upiId);
                        toast.success('UPI ID copied');
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <QRCode
                    value={`upi://pay?pa=${withdrawal.upiDetails?.upiId}&am=${withdrawal.paidAmount}`}
                    size={120}
                    className="bg-white p-2 rounded"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Account Holder</p>
                  <p className="font-medium mt-1">{withdrawal.bankDetails?.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Account Number</p>
                  <p className="font-medium mt-1">{withdrawal.bankDetails?.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">IFSC Code</p>
                  <p className="font-medium mt-1">{withdrawal.bankDetails?.ifscCode}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Bank Name</p>
                  <p className="font-medium mt-1">{withdrawal.bankDetails?.bankName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UTR Number</label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter UTR number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                placeholder="Enter reason if rejecting"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleReject}
              disabled={processing}
              className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Reject Request"
              )}
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Approve & Process"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
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

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const withdrawalsPerPage = 12;

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/withdrawl/all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      setWithdrawals(res.data.withdrawals.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (error) {
      toast.error("Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  

  const handleApprove = async (id, utrNumber) => {
    setProcessingId(id);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/withdrawl/approve/${id}`,
        { utrNumber},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      toast.success("Withdrawal approved successfully");
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    setProcessingId(id);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/withdrawl/reject/${id}`,
        { rejectionReason: reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      toast.success("Withdrawal rejected successfully");
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject withdrawal");
    } finally {
      setProcessingId(null);
    }
  };
  const filteredWithdrawals = withdrawals.filter(w => 
    filterStatus === "all" ? true : w.status === filterStatus
  );

  const totalPages = Math.ceil(filteredWithdrawals.length / withdrawalsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * withdrawalsPerPage,
    currentPage * withdrawalsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Withdrawals"
          value={withdrawals.length}
          icon={<ArrowRight className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Pending"
          value={withdrawals.filter(w => w.status === "pending").length}
          icon={<Clock className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Completed"
          value={withdrawals.filter(w => w.status === "completed").length}
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Rejected"
          value={withdrawals.filter(w => w.status === "rejected").length}
          icon={<XCircle className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-r from-red-500 to-red-600"
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Withdrawals</CardTitle>
            <div className="flex gap-4 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={fetchWithdrawals}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedWithdrawals.map((withdrawal) => (
          <WithdrawalCard
            key={withdrawal._id}
            withdrawal={withdrawal}
            onClick={() => setSelectedWithdrawal(withdrawal)}
          />
        ))}
      </div>

      {paginatedWithdrawals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-50 rounded-full p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No withdrawals found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filterStatus === "all" 
              ? "There are no withdrawal requests yet"
              : `No ${filterStatus} withdrawals found`}
          </p>
        </div>
      )}

      {filteredWithdrawals.length > withdrawalsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      {selectedWithdrawal && (
        <ReviewModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processingId === selectedWithdrawal._id}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
};

export default WithdrawalManagement;