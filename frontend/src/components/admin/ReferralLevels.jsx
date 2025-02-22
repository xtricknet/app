import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save, Edit2, Check, X, Plus, Trash2, Power } from "lucide-react";


const ReferralLevels = () => {
    const [systemStatus, setSystemStatus] = useState('active');
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
  
    const fetchLevels = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/levels`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setSystemStatus(result.data.systemStatus);
          setLevels(result.data.levels);
        } else {
          throw new Error("Failed to fetch referral levels");
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching levels:", err);
        setError("Failed to fetch referral levels");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchLevels();
    }, []);
  
    const handleSaveLevels = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/levels`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ 
            systemStatus,
            levels 
          }),
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to save settings");
        }
  
        setSystemStatus(data.data.systemStatus);
        setLevels(data.data.levels);
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
  
    const handleToggleSystem = async () => {
      if (!editMode) {
        setEditMode(true);
      }
      setSystemStatus(prev => prev === 'active' ? 'disabled' : 'active');
    };

  const handleAddLevel = () => {
    const maxLevel = Math.max(...levels.map(l => l.level), 0);
    setLevels([
      ...levels,
      {
        level: maxLevel + 1,
        rewardPercentage: 0,
        status: "active",
        description: ""
      }
    ]);
  };

  const handleDeleteLevel = (levelToDelete) => {
    if (!window.confirm("Are you sure you want to delete this level?")) return;
    setLevels(levels.filter(level => level.level !== levelToDelete));
  };

  const handleInputChange = (level, field, value) => {
    setLevels(prev =>
      prev.map(l =>
        l.level === level ? { ...l, [field]: value } : l
      )
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-600">Loading Referral Levels...</div>
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
          <div className="flex items-center gap-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Referral System
            </CardTitle>
            <button
              onClick={handleToggleSystem}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                systemStatus === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <Power className="w-4 h-4" />
              System {systemStatus === 'active' ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSaveLevels}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save All
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchLevels(); // Reset to original data
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditMode(true);
                    handleAddLevel();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Level
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit All
                </button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      
      <CardContent className="p-6">
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>All levels saved successfully!</span>
          </div>
        )}

        <div className="space-y-4">
          {levels.map((level) => (
            <div key={level.level} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={level.level}
                      onChange={(e) => handleInputChange(level.level, "level", parseInt(e.target.value))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded text-lg font-medium text-gray-900">
                      Level {level.level}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Percentage
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={level.rewardPercentage}
                      onChange={(e) => handleInputChange(level.level, "rewardPercentage", parseFloat(e.target.value))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded text-lg font-medium text-gray-900">
                      {level.rewardPercentage}%
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={level.description}
                      onChange={(e) => handleInputChange(level.level, "description", e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded text-lg font-medium text-gray-900">
                      {level.description || "-"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  {editMode ? (
                    <select
                      value={level.status}
                      onChange={(e) => handleInputChange(level.level, "status", e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  ) : (
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      level.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {level.status.charAt(0).toUpperCase() + level.status.slice(1)}
                    </div>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDeleteLevel(level.level)}
                    className="flex items-center gap-2 px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

    </Card>
  );
};

export default ReferralLevels;