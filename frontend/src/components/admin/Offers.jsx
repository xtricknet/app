import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    title: '',
    description: '',
    depositAmount: '',
    rewardAmount: '',
    currency: 'USDT',
    network: 'BEP20',
    expiry: '',
    userSpecific: false,
    eligibleUsers: [],
    allUsers: false,
    exchangeRate: '',
    totalAmountReceive: 0
  });

  const [editingOffer, setEditingOffer] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/admin`;

  // Fetch all offers
  const fetchOffers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch offers');
      const data = await response.json();
      setOffers(data.offers);
    } catch (err) {
      setError('Error loading offers: ' + err.message);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Error loading users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (formData.userSpecific) {
      fetchUsers();
    }
  }, [formData.userSpecific]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = {
        ...prev,
        [name]: value
      };
  
      // Calculate totalAmountReceive when depositAmount or exchangeRate changes
      if (name === 'depositAmount' || name === 'exchangeRate') {
        if (newState.depositAmount && newState.exchangeRate) {
          newState.totalAmountReceive = (
            Number(newState.depositAmount) * Number(newState.exchangeRate)
          ).toFixed(2);
        }
      }
  
      return newState;
    });
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };

  const handleCheckboxChange = (name) => {
    setFormData(prev => {
      const newState = {
        ...prev,
        [name]: !prev[name]
      };

      if (name === 'allUsers' && !prev.allUsers) {
        newState.eligibleUsers = [];
        newState.userSpecific = false;
        setSelectedUsers([]);
      }

      if (name === 'userSpecific' && !prev.userSpecific) {
        newState.allUsers = false;
      }

      return newState;
    });
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      const isSelected = prev.includes(userId);
      if (isSelected) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setFormData({
      ...offer,
      userSpecific: offer.eligibleUsers?.length > 0,
      allUsers: !offer.eligibleUsers?.length
    });
    setSelectedUsers(offer.eligibleUsers || []);
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete offer');
      
      setSuccess('Offer deleted successfully!');
      fetchOffers();
    } catch (err) {
      setError('Error deleting offer: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!formData.title || !formData.description || !formData.depositAmount || 
          !formData.rewardAmount || !formData.expiry || 
          !formData.exchangeRate) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.userSpecific && selectedUsers.length === 0) {
        throw new Error('Please select at least one user for specific user offer');
      }

      let submitData = {
        ...formData,
        eligibleUsers: formData.userSpecific ? selectedUsers : []
      };

      submitData.depositAmount = Number(submitData.depositAmount);
      submitData.rewardAmount = Number(submitData.rewardAmount);
      submitData.exchangeRate = Number(submitData.exchangeRate);
      submitData.totalAmountReceive = Number(submitData.totalAmountReceive);

      const url = editingOffer 
        ? `${API_BASE_URL}/offers/${editingOffer._id}`
        : `${API_BASE_URL}/offers`;

      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingOffer ? 'update' : 'create'} offer`);
      }

      setSuccess(`Offer ${editingOffer ? 'updated' : 'created'} successfully!`);
      
      // Reset form
      setFormData({
        active: true,
        title: '',
        description: '',
        depositAmount: '',
        rewardAmount: '',
        currency: '',
        network: '',
        expiry: '',
        userSpecific: false,
        eligibleUsers: [],
        allUsers: false,
        exchangeRate: '',
        totalAmountReceive: 0
      });
      setSelectedUsers([]);
      setEditingOffer(null);
      fetchOffers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(user => 
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?._id?.includes(searchTerm)
  );

  return (
    <div className="flex gap-4 p-4">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active Status</label>
            <Switch
              checked={formData.active}
              onCheckedChange={handleSwitchChange}
              className={`${formData.active ? 'bg-blue-500' : 'bg-gray-500'} 
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${formData.active ? 'translate-x-6' : 'translate-x-1'} 
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter offer title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter offer description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deposit Amount</label>
                <Input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  placeholder="Enter deposit amount"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reward Amount</label>
                <Input
                  type="number"
                  name="rewardAmount"
                  value={formData.rewardAmount}
                  onChange={handleInputChange}
                  placeholder="Enter reward amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange Rate</label>
              <Input
                type="number"
                name="exchangeRate"
                value={formData.exchangeRate}
                onChange={handleInputChange}
                placeholder="Enter exchange rate"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount Received</label>
              <Input
                type="number"
                name="totalAmountReceive"
                value={formData.totalAmountReceive}
                onChange={handleInputChange}
                placeholder="Enter total amount received"
                disabled={!editingOffer}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Input
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  placeholder="USDT"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Network</label>
                <Input
                  name="network"
                  value={formData.network}
                  onChange={handleInputChange}
                  placeholder="BEP20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input
                type="datetime-local"
                name="expiry"
                value={formData.expiry}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.allUsers}
                  onCheckedChange={() => handleCheckboxChange('allUsers')}
                  id="allUsers"
                />
                <label htmlFor="allUsers" className="text-sm font-medium">
                  Available for all users
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.userSpecific}
                  onCheckedChange={() => handleCheckboxChange('userSpecific')}
                  id="userSpecific"
                />
                <label htmlFor="userSpecific" className="text-sm font-medium">
                  Specific users only
                </label>
              </div>

              {formData.userSpecific && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Users</label>
                    <Input
                      type="text"
                      placeholder="Search by email or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {loading ? (
                    <div className="text-sm text-gray-500">Loading users...</div>
                  ) : (
                    <ScrollArea className="h-48 border rounded-md p-2">
                      <div className="space-y-2">
                        {filteredUsers.map(user => (
                          <div key={user._id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedUsers.includes(user._id)}
                              onCheckedChange={() => handleUserSelection(user._id)}
                              id={user._id}
                            />
                            <label htmlFor={user._id} className="text-sm">
                              {user.email} ({user._id})
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {selectedUsers.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Selected Users</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => (
                          <div key={userId} 
                               className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-2">
                            <span className="text-sm">{userId}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>

            {editingOffer && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingOffer(null);
                  setFormData({
                    active: true,
                    title: '',
                    description: '',
                    depositAmount: '',
                    rewardAmount: '',
                    currency: 'USDT',
                    network: 'BEP20',
                    expiry: '',
                    userSpecific: false,
                    eligibleUsers: [],
                    allUsers: false,
                    exchangeRate: '',
                    totalAmountReceive: 0
                  });
                  setSelectedUsers([]);
                }}
              >
                Cancel Edit
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Existing Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[800px]">
            <div className="space-y-4">
              {offers.map(offer => (
                <Card key={offer._id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{offer.title}</h3>
                        <Badge variant={offer.active ? "success" : "secondary"}>
                          {offer.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{offer.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditOffer(offer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteOffer(offer._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Deposit Amount:</p>
                      <p>${offer.depositAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reward Amount:</p>
                      <p>₹{offer.rewardAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Network:</p>
                      <p>{offer.network}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Exchange Rate:</p>
                      <p>{offer.exchangeRate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount Received:</p>
                      <p>{offer.totalAmountReceive}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expiry:</p>
                      <p>{new Date(offer.expiry).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created:</p>
                      <p>{new Date(offer.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Eligible Users:</p>
                      {offer.eligibleUsers?.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {offer.eligibleUsers.map(userId => (
                            <span key={userId} className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                              {userId}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>All users</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {offers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No offers found
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Offers;