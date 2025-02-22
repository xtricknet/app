import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, verifyOtp } from '../../../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!privacyAccepted) {
      toast.error('Please accept the privacy policy to continue');
      return;
    }
    setIsLoading(true);
  
    try {
      const response = await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      if (response.success) {
        toast.success(response.message || 'OTP sent successfully!');
        setIsOtpSent(true);
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await dispatch(verifyOtp({
        email: formData.email,
        otp: otp
      })).unwrap();
      
      if (response.success) {
        toast.success(response.message || 'Login successful!');
        navigate('/user');
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
       <Toaster       
            position='top-right'
            reverseOrder={false} 
            />
      <div className="max-w-md mx-auto pt-8">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-2 mb-8">
          <div className="text-blue-600 font-bold text-2xl flex items-center">
            <div className="bg-blue-600 text-white p-2 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20h20" />
                <path d="M5 20V8.2a3 3 0 1 1 6 0V20" />
                <path d="M13 20V8.2a3 3 0 1 1 6 0V20" />
              </svg>
            </div>
            <span className="ml-2">AngelX <span className="text-yellow-400">SPEEDO</span></span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-left mb-8">
          <h1 className="text-2xl font-bold mb-2">Expert-approved</h1>
          <h1 className="text-2xl font-bold mb-4">exchange with instant rewards</h1>
          <p className="text-gray-600">Welcome to AngelX Speedo</p>
        </div>

        {/* Login/OTP Form */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-sm">
          {!isOtpSent ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter login ID"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              
              <div className="space-y-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600 font-medium">
                  I have read and agree{" "}
                  <Link to="/privacy" className="text-blue-600">
                    privacy policy
                  </Link>
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !privacyAccepted}
                className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Login'}
              </button>

              <div className="flex justify-center space-x-4 text-sm text-blue-600">
                <Link to="/forgot-password" className="hover:underline">
                  Forgot password?
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/signup" className="hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Verify OTP'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="w-full text-gray-600 hover:underline"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;