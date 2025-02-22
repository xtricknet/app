import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Clock, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast ,{Toaster} from 'react-hot-toast';
import WithdrawalHistory from './WithdrawalHistory';


const Withdraw = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [showAddNew, setShowAddNew] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [savedMethods, setSavedMethods] = useState({ UPI: [], BANK: [] });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  
  // New method form state
  const [newMethod, setNewMethod] = useState({
    upiId: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: ''
  });

  // Fetch saved payment methods on component mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
  
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/methods`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

     
  
      if (response.data.success) {
        setSavedMethods({
          UPI: response.data.upiDetails.map(upi => ({
            id: upi._id,
            upiId: upi.upiId
          })),
          BANK: response.data.bankDetails.map(bank => ({
            id: bank._id,
            accountNumber: bank.accountNumber,
            accountHolderName: bank.accountHolderName,
            bankName: bank.bankName,
            ifscCode: bank.ifscCode
          }))
        });
      }
    } catch (error) {
      toast.error("Failed to fetch payment methods");
    }
  };

  const handleAddNewMethod = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = selectedMethod === 'UPI' ? '/upi' : '/bank';
      
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user${endpoint}`, 
        selectedMethod === 'UPI' 
          ? { upiId: newMethod.upiId } 
          : {
              bankName: newMethod.bankName,
              accountNumber: newMethod.accountNumber,
              ifscCode: newMethod.ifscCode,
              accountHolderName: newMethod.accountHolderName
            }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (response.data.success) {
        await fetchPaymentMethods();
        setShowAddNew(false);
        setNewMethod({
          upiId: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          bankName: ''
        });
        toast.success("Payment method added successfully");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add payment method");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMethod = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = selectedMethod === 'UPI' ? `/upi/${id}` : `/bank/${id}`;
  
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/user${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.success) {
        await fetchPaymentMethods();
        if (selectedAccount?.id === id) setSelectedAccount(null);
        toast.success("Payment method deleted successfully");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete payment method");
    }
  };
  

// Update the handleWithdraw function
const handleWithdraw = async () => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    // Ensure user balance is available in state/context
    if (!userData || userData.balance === undefined || userData.pendingWithdrawal === undefined) {
      throw new Error("User balance data is missing.");
    }

    // Calculate available balance for withdrawal
    const availableBalance = userData.balance - userData.pendingWithdrawal;

    // Check if withdrawAmount is valid
    if (withdrawAmount <= 0) {
      throw new Error("Withdrawal amount must be greater than zero.");
    }

    // Ensure withdrawal amount does not exceed available balance
    if (withdrawAmount > availableBalance) {
      throw new Error("Insufficient balance. Please enter a valid amount.");
    }

    // Prepare the request payload based on selected method
    const withdrawalPayload = {
      amount: Number(withdrawAmount),
      withdrawalMethod: selectedMethod.toLowerCase(),
      ...(selectedMethod === "UPI"
        ? {
            upiDetails: {
              upiId: selectedAccount.upiId,
            },
          }
        : {
            bankDetails: {
              accountNumber: selectedAccount.accountNumber,
              accountHolderName: selectedAccount.accountHolderName,
              ifscCode: selectedAccount.ifscCode,
              bankName: selectedAccount.bankName,
            },
          }),
    };

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/withdrawl/create`,
      withdrawalPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      toast.success("Withdrawal initiated successfully");
      // Optionally update user balance in state/context if you're maintaining it
      navigate("/user");
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Withdrawal failed";
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
    setShowConfirmDialog(false);
  }
};


if (showHistory) {
  return <WithdrawalHistory userId={userData?.userId} onBack={() => setShowHistory(false)} />;
}


  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-3 mb-8 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Withdraw</h2>
        <button 
          onClick={() => setShowHistory(true)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <Clock className="w-6 h-6" />
        </button>
      </div>

      {/* Amount Section */}
      <div className="mb-8">
        <div className="relative mb-2">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
            <span className="font-medium">₹</span>
          </div>
          <input
            type="number"
            placeholder="Enter amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full p-4 border rounded-lg outline-none text-2xl"
          />
        </div>
        <p className="text-blue-600">Available: ₹{(userData?.balance) - (userData?.pendingWithdrawal)}</p>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-4">
          <button 
            className={`flex-1 py-2 rounded-md text-center ${
              selectedMethod === 'UPI' ? 'bg-white shadow-sm' : ''
            }`}
            onClick={() => {
              setSelectedMethod('UPI');
              setSelectedAccount(null);
            }}
          >
            UPI
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-center ${
              selectedMethod === 'BANK' ? 'bg-white shadow-sm' : ''
            }`}
            onClick={() => {
              setSelectedMethod('BANK');
              setSelectedAccount(null);
            }}
          >
            Bank Account
          </button>
        </div>

        {/* Saved Methods List */}
        {!showAddNew && (
          <div className="space-y-3">
            {savedMethods[selectedMethod].map(method => (
              <div 
                key={method.id}
                className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedAccount?.id === method.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedAccount(method)}
              >
                <div>
                  {selectedMethod === 'UPI' ? (
                    <p className="font-medium">{method.upiId}</p>
                  ) : (
                    <>
                      <p className="font-medium">{method.bankName}</p>
                      <p className="text-sm text-gray-600">AC: {method.accountNumber}</p>
                    </>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMethod(method.id);
                  }}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowAddNew(true)}
              className="w-full p-4 border border-dashed rounded-lg text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New {selectedMethod === 'UPI' ? 'UPI ID' : 'Bank Account'}
            </button>
          </div>
        )}

        {/* Add New Method Form */}
        {showAddNew && (
          <div className="space-y-4">
            <h3 className="font-medium">
              Add New {selectedMethod === 'UPI' ? 'UPI ID' : 'Bank Account'}
            </h3>
            
            {selectedMethod === 'UPI' ? (
              <input
                type="text"
                placeholder="Enter UPI ID"
                value={newMethod.upiId}
                onChange={(e) => setNewMethod({ ...newMethod, upiId: e.target.value })}
                className="w-full p-4 border rounded-lg outline-none"
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={newMethod.accountHolderName}
                  onChange={(e) => setNewMethod({ ...newMethod, accountHolderName: e.target.value })}
                  className="w-full p-4 border rounded-lg outline-none"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={newMethod.bankName}
                  onChange={(e) => setNewMethod({ ...newMethod, bankName: e.target.value })}
                  className="w-full p-4 border rounded-lg outline-none"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={newMethod.accountNumber}
                  onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                  className="w-full p-4 border rounded-lg outline-none"
                />
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={newMethod.ifscCode}
                  onChange={(e) => setNewMethod({ ...newMethod, ifscCode: e.target.value })}
                  className="w-full p-4 border rounded-lg outline-none"
                />
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddNew(false)}
                className="flex-1 py-3 border rounded-lg"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewMethod}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Confirm Withdrawal
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 mt-2">
                <div className="text-gray-700">Amount: ₹{withdrawAmount}</div>
                <div className="text-gray-700">Payment Method: {selectedMethod}</div>
                {selectedMethod === 'UPI' ? (
                  <div className="text-gray-700">UPI ID: {selectedAccount?.upiId}</div>
                ) : (
                  <>
                    <div className="text-gray-700">Bank: {selectedAccount?.bankName}</div>
                    <div className="text-gray-700">Account: {selectedAccount?.accountNumber}</div>
                    <div className="text-gray-700">IFSC: {selectedAccount?.ifscCode}</div>
                    <div className="text-gray-700">Name: {selectedAccount?.accountHolderName}</div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Button - move this button to trigger the dialog */}
      <button 
        onClick={() => setShowConfirmDialog(true)}
        className={`w-full py-4 rounded-full font-medium ${
          selectedAccount && withdrawAmount && !isLoading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!selectedAccount || !withdrawAmount || isLoading}
      >
        {isLoading ? 'Processing...' : `Withdraw ₹${withdrawAmount || '0'}`}
      </button>

       <Toaster       
            position='top-right'
            reverseOrder={false} 
            />
    </div>
  );
};

export default Withdraw;