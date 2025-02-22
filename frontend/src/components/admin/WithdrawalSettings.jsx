import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save, Edit2, Check, X } from "lucide-react";

const WithdrawalSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedSettings, setEditedSettings] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/withdrawal-settings`, {
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
      setError("Failed to fetch withdrawal settings");
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

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/withdrawal-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(editedSettings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSettings(data.data);
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

  const handleInputChange = (field, value) => {
    setEditedSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-600">Loading Settings...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Withdrawal Settings
          </CardTitle>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditedSettings(settings);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Settings
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Withdrawal Amount
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={editedSettings.minAmount}
                  onChange={(e) => handleInputChange("minAmount", parseFloat(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="100"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-lg font-medium text-gray-900">
                  {settings.minAmount.toLocaleString()} INR
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Withdrawal Amount
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={editedSettings.maxAmount}
                  onChange={(e) => handleInputChange("maxAmount", parseFloat(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="100"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-lg font-medium text-gray-900">
                  {settings.maxAmount.toLocaleString()} INR
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Fee
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={editedSettings.feePercentage}
                  onChange={(e) => handleInputChange("feePercentage", parseFloat(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.01"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded text-lg font-medium text-gray-900">
                  {settings.feePercentage}%
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {editMode ? (
                <select
                  value={editedSettings.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              ) : (
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  settings.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {settings.status.charAt(0).toUpperCase() + settings.status.slice(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSettings;