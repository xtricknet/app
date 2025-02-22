import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { 
  sendPasswordResetOtp, 
  resetPassword,
  clearResetPasswordState
} from '../../../redux/authSlice';
const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await dispatch(sendPasswordResetOtp({
        email: formData.email
      })).unwrap();
      
      if (response.success) {
        toast.success(response.message || 'OTP sent successfully!');
        setIsOtpSent(true);
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await dispatch(resetPassword({
        email: formData.email,
        otp: otp,
        newPassword: formData.newPassword
      })).unwrap();
      
      if (response.success) {
        toast.success(response.message || 'Password reset successful!');
        navigate('/login');
      } else {
        toast.error(response.message || 'Password reset failed');
      }
    } catch (error) {
      toast.error(error.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    return () => {
      dispatch(clearResetPasswordState());
    };
  }, [dispatch]);

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
          <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-gray-600">Don't worry, we'll help you reset it</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-sm">
          {!isOtpSent ? (
            // Email Form
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
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
                ) : 'Send OTP'}
              </button>
            </form>
          ) : (
            // OTP and New Password Form
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <div className="space-y-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
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
                ) : 'Reset Password'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="w-full text-gray-600 hover:underline"
              >
                Back to Email
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;