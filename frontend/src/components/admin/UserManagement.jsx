import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, Ban, Lock, Trash2, UserCheck, Wallet, Search, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, action, user }) => {
  const [reason, setReason] = useState('');
  const [lockDate, setLockDate] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const getTitle = () => {
    switch (action) {
      case 'ban': return 'Ban User';
      case 'lock': return 'Lock User';
      case 'delete': return 'Delete User';
      default: return 'Confirm Action';
    }
  };

  const isValid = () => {
    if (action === 'delete') {
      return confirmText === user.username;
    }
    if (action === 'ban') {
      return reason.length >= 10;
    }
    if (action === 'lock') {
      return lockDate && new Date(lockDate) > new Date();
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {action === 'ban' && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-700">Ban Reason (minimum 10 characters)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for banning user"
                className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {action === 'lock' && (
            <div className="space-y-2">
              <Label htmlFor="lockDate" className="text-gray-700">Lock Until Date</Label>
              <Input
                id="lockDate"
                type="datetime-local"
                value={lockDate}
                onChange={(e) => setLockDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {action === 'delete' && (
            <div className="space-y-2">
              <Label htmlFor="confirmText" className="text-gray-700">
                Type "{user.username}" to confirm deletion
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={user.username}
                className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm({ reason, lockDate })}
            disabled={!isValid()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirm {getTitle()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [token] = useState(localStorage.getItem('adminToken'));
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionUser, setActionUser] = useState(null);

  useEffect(() => {
    if (!token) {
      toast.error('No token found, please login again');
      return;
    }
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast.error('Error fetching users');
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, details = {}) => {
    try {
      const payload = {
        ...details
      };
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        toast.success(`User ${action} successful`);
        fetchUsers();
        setShowConfirmDialog(false);
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } catch (err) {
      toast.error(`Error during ${action}`);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const UserDetailsModal = ({ user, showUserModal, setShowUserModal, setPendingAction, setActionUser, setShowConfirmDialog }) => {
    if (!user) return null;
  
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };
  
    return (
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="min-w-6 h-[90vh] p-0 bg-white rounded-xl">
          <div className="h-full flex flex-col bg-white">
            <DialogHeader className="bg-white border-b p-6 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-3xl font-bold">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {user.username}
                  </DialogTitle>
                  <p className="text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>
            </DialogHeader>
  
            <Tabs defaultValue="overview" className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="border-b bg-white">
                <TabsList className="flex flex-row w-full bg-transparent p-2">
                  {['Overview', 'Financial', 'Security', 'Banking'].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab.toLowerCase()}
                      className="flex-1 px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-md"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Username:</span>
                            <span>{user.username}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Email:</span>
                            <span>{user.email}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Role:</span>
                            <span>{user.role}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Joined:</span>
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
  
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Referral Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Refer Code:</span>
                            <span className="bg-blue-50 px-2 py-1 rounded text-blue-700">{user.referCode}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Referred By:</span>
                            <span>{user.refBy || 'None'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
  
                <TabsContent value="financial" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Balance Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Current Balance:</span>
                            <span className="font-semibold text-green-600">₹{user.balance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Total Reward:</span>
                            <span className="font-semibold text-blue-600">₹{user.totalReward.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Total Pay In:</span>
                            <span className="font-semibold">₹{user.payin.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Total Pay Out:</span>
                            <span className="font-semibold">₹{user.payout.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
  
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Pending Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Pending Deposit:</span>
                            <span className={user.pendingDeposit > 0 ? "text-yellow-600 font-semibold" : "text-gray-500"}>
                              ${user.pendingDeposit.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Pending Withdrawal:</span>
                            <span className={user.pendingWithdrawal > 0 ? "text-yellow-600 font-semibold" : "text-gray-500"}>
                            ₹{user.pendingWithdrawal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Pending Orders:</span>
                            <span className={user.pendingOrder > 0 ? "text-yellow-600 font-semibold" : "text-gray-500"}>
                              {user.pendingOrder}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
  
                <TabsContent value="security" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Account Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 py-2 border-b">
                            <UserCheck className={`w-5 h-5 ${user.isVerified ? 'text-green-500' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">Verification Status:</span>
                                <Badge variant={user.isVerified ? "success" : "secondary"} className={user.isVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                                  {user.isVerified ? 'Verified' : 'Unverified'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 py-2 border-b">
                            <Ban className={`w-5 h-5 ${user.banned ? 'text-red-500' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">Ban Status:</span>
                                <Badge variant={user.banned ? "destructive" : "secondary"} className={user.banned ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}>
                                  {user.banned ? 'Banned' : 'Not Banned'}
                                </Badge>
                              </div>
                              {user.banned && user.banReason && (
                                <p className="text-sm text-red-600 mt-1">Reason: {user.banReason}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 py-2 border-b">
                            <Lock className={`w-5 h-5 ${user.isLocked ? 'text-yellow-500' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">Lock Status:</span>
                                <Badge variant={user.isLocked ? "warning" : "secondary"} className={user.isLocked ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}>
                                  {user.isLocked ? 'Locked' : 'Unlocked'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
  
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Security Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Failed Login Attempts:</span>
                            <span className={user.failedLoginAttempts > 2 ? "text-red-600 font-semibold" : "text-gray-600"}>
                              {user.failedLoginAttempts}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Email Preferences:</span>
                            <Badge variant={user.emailPreferences ? "outline" : "secondary"} className="bg-gray-100">
                              {user.emailPreferences ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
  
                <TabsContent value="banking" className="mt-0 space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Bank Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.bankDetails.length > 0 ? (
                        <div className="space-y-4">
                          {user.bankDetails.map((bank, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 w-32">Bank:</span>
                                  <span className="font-semibold">{bank.bankName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 w-32">Account Holder:</span>
                                  <span className="font-semibold">{bank.accountHolderName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 w-32">Account Number:</span>
                                  <span className="font-semibold">{bank.accountNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 w-32">IFSC:</span>
                                  <span className="font-semibold">{bank.ifscCode}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg border border-dashed">
                          <p className="text-gray-500">No bank accounts added</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
  
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">UPI Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.upiDetails.length > 0 ? (
                        <div className="space-y-4">
                          {user.upiDetails.map((upi, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-16">UPI ID:</span>
                                <span className="font-semibold text-blue-700 px-2 py-1 bg-blue-50 rounded">
                                  {upi.upiId}
                                </span>
                              </div>
                            </div>
                          ))}
                          </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-gray-500">No UPI details added</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t p-4 flex justify-end gap-2 bg-white flex-shrink-0">
            <Button
              variant="destructive"
              onClick={() => {
                setPendingAction('delete');
                setActionUser(user);
                setShowConfirmDialog(true);
                setShowUserModal(false);
              }}
              className="text-white flex items-center gap-2 bg-red-800 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete User
            </Button>
            <Button
              variant={user.banned ? "default" : "destructive"}
              onClick={() => {
                setPendingAction(user.banned ? 'unban' : 'ban');
                setActionUser(user);
                setShowConfirmDialog(true);
                setShowUserModal(false);
              }}
              className={`flex text-white items-center gap-2 ${user.banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              <Ban className="w-4 h-4" />
              {user.banned ? 'Unban User' : 'Ban User'}
            </Button>
            <Button
              variant={user.isLocked ? "default" : "warning"}
              onClick={() => {
                setPendingAction(user.isLocked ? 'unlock' : 'lock');
                setActionUser(user);
                setShowConfirmDialog(true);
                setShowUserModal(false);
              }}
              className={`flex text-white items-center gap-2 ${user.isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
            >
              <Lock className="w-4 h-4" />
              {user.isLocked ? 'Unlock User' : 'Lock User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 animate-pulse">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              User Management
            </CardTitle>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-blue-700/20 text-white placeholder-blue-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
              </div>
              <Button
                onClick={fetchUsers}
                variant="outline"
                className="bg-transparent border-blue-300 text-white hover:bg-blue-700 p-2"
              >
                <RefreshCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Refer Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <img className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" src={user.avatar} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">{user.username[0].toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {user.banned && (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border border-red-200">
                              Banned
                            </Badge>
                          )}
                          {user.isLocked && (
                            <Badge variant="warning" className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                              Locked
                            </Badge>
                          )}
                          {!user.isVerified && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border border-gray-200">
                              Unverified
                            </Badge>
                          )}
                          {!user.banned && !user.isLocked && user.isVerified && (
                            <Badge variant="success" className="bg-green-100 text-green-800 border border-green-200">
                            Active
                          </Badge>
                          )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Wallet className="w-4 h-4 text-blue-600 mr-2" />
                            <span className={`text-sm font-semibold ${user.balance > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                             ₹{user.balance.toFixed(2)}
                            </span>
                          </div>
                          {user.pendingWithdrawal > 0 && (
                            <div className="text-xs text-yellow-600 flex items-center mt-1">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              ₹{user.pendingWithdrawal.toFixed(2)} pending
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 font-medium">
                            {user.referCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={user.banned ? "default" : "destructive"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingAction(user.banned ? 'unban' : 'ban');
                                setActionUser(user);
                                setShowConfirmDialog(true);
                              }}
                              className={`h-8 text-white ${user.banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={user.isLocked ? "default" : "warning"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingAction(user.isLocked ? 'unlock' : 'lock');
                                setActionUser(user);
                                setShowConfirmDialog(true);
                              }}
                              className={`h-8 text-white ${user.isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingAction('delete');
                                setActionUser(user);
                                setShowConfirmDialog(true);
                              }}
                              className="h-8 text-white bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Search className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="text-gray-500 text-lg">No users found</p>
                          <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
  
        {selectedUser && (
         <UserDetailsModal 
         user={selectedUser}
         showUserModal={showUserModal}
         setShowUserModal={setShowUserModal}
         setPendingAction={setPendingAction}
         setActionUser={setActionUser}
         setShowConfirmDialog={setShowConfirmDialog}
       />
        )}
        
        {showConfirmDialog && actionUser && (
          <ConfirmationDialog 
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={(details) => handleUserAction(actionUser._id, pendingAction, details)}
            action={pendingAction}
            user={actionUser}
          />
        )}
      </div>
    );
  };
  
  export default UserManagement;