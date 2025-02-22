import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  ChevronDown, 
  RefreshCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DepositHistory from './DepositHistory';
import toast, { Toaster } from 'react-hot-toast';

const getCryptoIconPath = (symbol) => {
  const normalizedSymbol = symbol.toLowerCase();
  return `/node_modules/cryptocurrency-icons/svg/color/${normalizedSymbol}.svg`;
};

// Fallback mechanism for when an icon doesn't load
const handleImageError = (e) => {
  e.target.onerror = null; // Prevent infinite error loop
  e.target.src = '/node_modules/cryptocurrency-icons/svg/color/generic.svg';
};

// Network mappings to corresponding cryptocurrency symbols
const networkToCryptoMap = {
  'TRC20': 'trx',   // TRON
  'BEP20': 'bnb',   // Binance Smart Chain
  'ERC20': 'eth',   // Ethereum
  'MATIC': 'matic', // Polygon
  'SOL': 'sol',     // Solana
  'ALGO': 'algo',   // Algorand
  'AVAX': 'avax',   // Avalanche
};

// Get network icon using the cryptocurrency-icons package
const getNetworkIconPath = (network) => {
  const cryptoSymbol = networkToCryptoMap[network];
  if (cryptoSymbol) {
    return getCryptoIconPath(cryptoSymbol);
  }else if(network){
    return getCryptoIconPath(network);
  }
    return getCryptoIconPath('generic');
  
};

// Network background colors for visual distinction
const getNetworkBackgroundColor = (network) => {
  const networkColors = {
    'TRC20': 'bg-red-50',     // TRON (reddish)
    'BEP20': 'bg-yellow-50',  // Binance (yellow)
    'ERC20': 'bg-blue-50',    // Ethereum (blue)
    'MATIC': 'bg-purple-50',  // Polygon (purple)
    'SOL': 'bg-green-50',     // Solana (green)
    'ALGO': 'bg-blue-50',     // Algorand (blue)
    'AVAX': 'bg-red-50',      // Avalanche (red)
  };
  
  return networkColors[network] || 'bg-gray-50';
};

const Deposit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [depositAmount, setDepositAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(true);

  const [settings, setSettings] = useState({
    currencySettings: [], 
    networkOptions: [],
    wallets: [], 
    status: 'inactive', 
  });
  
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }
    fetchDepositSettings();
  }, [userData, navigate]);

  const fetchDepositSettings = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/deposits/deposit-settings`);
      if (response.data.success) {
        const settingsData = response.data.data;
        
        setSettings(settingsData);
        console.log(settingsData);
        if (settingsData.currencySettings.length > 0) {
          setSelectedCurrency(settingsData.currencySettings[0].currency);
        }
  
        if (settingsData.networkOptions.length > 0) {
          setSelectedNetwork(settingsData.networkOptions[0]);
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch settings");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch deposit settings");
    } finally {
      setLoading(false);
    }
  };
  
  const currencyData = settings?.currencySettings?.find(
    (item) => item.currency === selectedCurrency
  );

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) < settings.minAmount) {
      toast.error(`Please enter a valid amount (minimum ${settings.minAmount} ${selectedCurrency})`);
      return;
    }
  
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/deposits/create`, {
        amount: parseFloat(depositAmount),
        currency: selectedCurrency,
        network: selectedNetwork
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.success && response.data.deposit) {
        navigate('/crypto-deposit', {
          state: {
            depositData: {
              ...response.data.deposit,
              currency: selectedCurrency,
              network: selectedNetwork,
              receivedAmountINR: currencyData
                ? (parseFloat(depositAmount) * currencyData.exchangeRate).toFixed(2)
                : 0 
            }
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to create deposit');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount) => {
    const safeAmount = amount ?? 0;
    return safeAmount.toLocaleString('en-IN');
  };

  const formatSensitiveAmount = (amount) => {
    if (!showSensitiveData) return '****';
    return `₹${formatAmount(amount)}`;
  };

  const NetworkOption = ({ network }) => {
    return (
      <div
        onClick={() => {
          setSelectedNetwork(network);
          setIsNetworkDropdownOpen(false);
        }}
        className="p-4 hover:bg-gray-50 cursor-pointer border-t border-gray-100 last:border-b-0 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${getNetworkBackgroundColor(network)} rounded-lg flex items-center justify-center`}>
            <img 
              src={getNetworkIconPath(network)} 
              alt={network} 
              className="w-8 h-8"
              onError={handleImageError}
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-800">{network}</h3>
            <p className="text-xs text-gray-500">Deposit Network</p>
          </div>
          {selectedNetwork === network && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (showHistory) {
    return <DepositHistory userId={userData?.userId} onBack={() => setShowHistory(false)} />;
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchDepositSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Deposit</h2>
        <button 
          onClick={() => setShowHistory(true)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <Clock className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Balance Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span>Available Balance</span>
              <button onClick={() => setShowSensitiveData(!showSensitiveData)}>
                {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xl font-bold">
              {formatSensitiveAmount(userData?.balance)} INR
            </div>
          </div>

          {/* Currency Selection */}
          <div className="border-t pt-4">
            <div className="text-gray-600 text-sm mb-2">Select Currency</div>
            <div className="flex flex-wrap items-center gap-2">
            {settings.currencySettings.map(({ currency }) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedCurrency === currency 
                      ? 'bg-blue-50 border border-blue-200 text-blue-600 font-semibold' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <img 
                    src={getCryptoIconPath(currency)}
                    alt={currency}
                    className="w-5 h-5"
                    onError={handleImageError}
                  />
                  {currency}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Network Selection */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="text-gray-600 text-sm mb-2">Select Network</div>
          <div className="relative">
            <button
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="w-full bg-gray-100 p-3 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getNetworkBackgroundColor(selectedNetwork)} rounded-lg flex items-center justify-center`}>
                  <img 
                    src={getNetworkIconPath(selectedNetwork)}
                    alt={selectedNetwork}
                    className="w-6 h-6"
                    onError={handleImageError}
                  />
                </div>
                <span className="font-semibold text-gray-800">{selectedNetwork}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                isNetworkDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {isNetworkDropdownOpen && (
              <div className="absolute w-full mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-10 overflow-hidden">
                {settings.networkOptions.map((network) => (
                  <NetworkOption key={network} network={network} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deposit Amount */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="text-gray-600 text-sm mb-2">Deposit Amount</div>
          <div className="relative">
            <input
              type="text"
              placeholder={`Enter amount (min. ${(() => {
                const currencyData = settings?.currencySettings?.find(
                  (item) => item.currency === selectedCurrency
                );
                return currencyData ? `${currencyData.minAmount} ${selectedCurrency}` : 'N/A';
              })()})`}
              value={depositAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setDepositAmount(value);
                }
              }}
              className="w-full bg-gray-100 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center bg-gray-100 gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <img 
                  src={getCryptoIconPath(selectedCurrency)}
                  alt={selectedCurrency}
                  className="w-5 h-5"
                  onError={handleImageError}
                />
              </div>
              <span className="text-gray-600">{selectedCurrency}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm mt-2 px-1">
              {selectedCurrency && settings?.currencySettings && (
                (() => {
                  const currencyData = settings.currencySettings.find(
                    (item) => item.currency === selectedCurrency
                  );

                  return currencyData ? (
                    <>
                      <span className="text-blue-600">
                        Min. {currencyData.minAmount} {selectedCurrency}
                      </span>
                      {depositAmount && !isNaN(depositAmount) && (
                        <span className="text-gray-600">
                          ≈ ₹{(parseFloat(depositAmount) * currencyData.exchangeRate).toFixed(2)}
                        </span>
                      )}
                    </>
                  ) : null;
                })()
              )}
            </div>

        </div>

        {/* Deposit Button */}
        <button 
          onClick={handleDeposit}
          disabled={!depositAmount || settings.status !== 'active' || isProcessing}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 px-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <RefreshCcw className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : settings.status === 'active' ? (
            <>
              <img 
                src={getCryptoIconPath(selectedCurrency)}
                alt="Deposit"
                className="w-5 h-5"
                onError={handleImageError}
              />
              Confirm Deposit
            </>
          ) : 'Deposits Disabled'}
        </button>
      </div>
       <Toaster       
            position='top-right'
            reverseOrder={false} 
            />
    </div>
  );
};

export default Deposit;