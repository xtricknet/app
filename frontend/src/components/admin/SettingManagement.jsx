import React, { useEffect, useState } from "react";

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedSettings, setEditedSettings] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newCurrency, setNewCurrency] = useState("");

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setEditedSettings(result.data);
      } else {
        throw new Error("Failed to fetch settings");
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const settingsToSave = {
        ...editedSettings,
        wallets: editedSettings.wallets.map(wallet => ({
          _id: wallet._id,
          network: wallet.network,
          currency: wallet.currency,
          address: wallet.address,
          isActive: wallet.isActive
        }))
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(settingsToSave),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSettings(data.data);
      setEditedSettings(data.data);
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Currency Management Functions
  const handleAddCurrency = () => {
    if (!newCurrency) return;
    
    setEditedSettings(prev => ({
      ...prev,
      currencySettings: [
        ...prev.currencySettings,
        {
          currency: newCurrency,
          exchangeRate: 0,
          minAmount: 0
        }
      ]
    }));
    setNewCurrency("");
  };

  const handleRemoveCurrency = (currency) => {
    setEditedSettings(prev => ({
      ...prev,
      currencySettings: prev.currencySettings.filter(
        setting => setting.currency !== currency
      ),
      // Also remove any wallets associated with this currency
      wallets: prev.wallets.filter(wallet => wallet.currency !== currency)
    }));
  };

  const handleCurrencySettingChange = (currency, field, value) => {
    setEditedSettings(prev => ({
      ...prev,
      currencySettings: prev.currencySettings.map(setting =>
        setting.currency === currency
          ? { ...setting, [field]: value }
          : setting
      )
    }));
  };

  // Wallet Management Functions
  const handleWalletChange = (index, field, value) => {
    setEditedSettings(prev => ({
      ...prev,
      wallets: prev.wallets.map((wallet, i) =>
        i === index ? { ...wallet, [field]: value } : wallet
      )
    }));
  };

  const handleAddWallet = () => {
    if (!editedSettings.currencySettings.length) {
      setError("Please add at least one currency before adding a wallet");
      return;
    }

    setEditedSettings(prev => ({
      ...prev,
      wallets: [...prev.wallets, {
        network: prev.networkOptions[0],
        currency: prev.currencySettings[0].currency,
        address: "",
        isActive: true,
      }]
    }));
  };

  const handleRemoveWallet = (index) => {
    setEditedSettings(prev => ({
      ...prev,
      wallets: prev.wallets.filter((_, i) => i !== index)
    }));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-600">Loading Settings...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Deposit Settings</h2>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditedSettings(settings);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Settings
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Settings Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Currency Settings</h3>
            {editMode && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                  placeholder="Currency code"
                  className="w-24 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCurrency}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {(editMode ? editedSettings : settings).currencySettings.map((currencySetting) => (
              <div key={currencySetting.currency} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{currencySetting.currency}</h4>
                  {editMode && (
                    <button
                      onClick={() => handleRemoveCurrency(currencySetting.currency)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Exchange Rate (INR/{currencySetting.currency})
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        value={currencySetting.exchangeRate}
                        onChange={(e) => handleCurrencySettingChange(
                          currencySetting.currency,
                          "exchangeRate",
                          parseFloat(e.target.value)
                        )}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <div className="p-2 bg-gray-100 rounded">
                        {currencySetting.exchangeRate} INR/{currencySetting.currency}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Minimum Deposit ({currencySetting.currency})
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        value={currencySetting.minAmount}
                        onChange={(e) => handleCurrencySettingChange(
                          currencySetting.currency,
                          "minAmount",
                          parseFloat(e.target.value)
                        )}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <div className="p-2 bg-gray-100 rounded">
                        {currencySetting.minAmount} {currencySetting.currency}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet Management Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Wallet Management</h3>
            {editMode && (
              <button
                onClick={handleAddWallet}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                disabled={!editedSettings.currencySettings.length}
              >
                Add Wallet
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {(editMode ? editedSettings : settings).wallets.map((wallet, index) => (
              <div key={wallet._id || index} className="bg-white p-4 rounded-lg shadow-sm">
                {editMode ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Wallet #{index + 1}</h4>
                      <button
                        onClick={() => handleRemoveWallet(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Currency</label>
                      <select
                        value={wallet.currency}
                        onChange={(e) => handleWalletChange(index, "currency", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {editedSettings.currencySettings.map(setting => (
                          <option key={setting.currency} value={setting.currency}>
                            {setting.currency}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Network</label>
                      <select
                        value={wallet.network}
                        onChange={(e) => handleWalletChange(index, "network", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {settings.networkOptions.map(network => (
                          <option key={network} value={network}>{network}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <input
                        type="text"
                        value={wallet.address}
                        onChange={(e) => handleWalletChange(index, "address", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter wallet address"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={wallet.isActive}
                        onChange={(e) => handleWalletChange(index, "isActive", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                        id={`active-${index}`}
                      />
                      <label htmlFor={`active-${index}`} className="text-sm font-medium">
                        Active
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Wallet #{index + 1}</h4>
                      <span className={`text-sm px-2 py-1 rounded ${
                        wallet.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {wallet.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Currency:</span> {wallet.currency}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Network:</span> {wallet.network}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span> {wallet.address}
                      </p>
                      {wallet.qrCode && (
                        <img 
                          src={wallet.qrCode} 
                          alt="QR Code" 
                          className="w-24 h-24 object-contain bg-white p-2 rounded"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>{/* Global Settings Section */}
        <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-semibold mb-4">Global Settings</h3>
          
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">System Status</label>
              {editMode ? (
                <select
                  value={editedSettings.status}
                  onChange={(e) => setEditedSettings(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  settings.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {settings.status}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Network Options</label>
              {editMode ? (
                <div className="flex gap-2 flex-wrap">
                  {editedSettings.networkOptions.map((network, index) => (
                    <div key={network} className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                      <span>{network}</span>
                      <button
                        onClick={() => {
                          setEditedSettings(prev => ({
                            ...prev,
                            networkOptions: prev.networkOptions.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-600 hover:text-red-700 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const network = prompt("Enter new network name:");
                      if (network && !editedSettings.networkOptions.includes(network)) {
                        setEditedSettings(prev => ({
                          ...prev,
                          networkOptions: [...prev.networkOptions, network]
                        }));
                      }
                    }}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Add Network
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {settings.networkOptions.map(network => (
                    <span key={network} className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {network}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Message if no currencies are configured */}
      {editMode && editedSettings.currencySettings.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
          Please add at least one currency to configure deposit settings.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default SettingsManagement;