import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { signup, verifyOtp } from '../../../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { refId } = useParams();


  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    referCode:refId || '' 
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (formData.password || formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!passwordsMatch) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }
    return errors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await dispatch(signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        referCode: formData.referCode
      })).unwrap();
      
      if (response.success) {
        toast.success(response.message || 'OTP sent successfully!');
        setIsOtpSent(true);
      } else {
        toast.error(response.message || 'Signup failed');
      }
    } catch (error) {
      toast.error(error.message || 'Signup failed');
      setFormErrors({ submit: error.message });
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
        toast.success('Account verified successfully!');
        localStorage.setItem('token', response.token);
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
  
  const validatePassword = (password) => {
    const requirements = [
      { met: password.length >= 8, text: 'Length not less than 8' },
      { met: /[A-Z]/.test(password), text: 'Contains at least one uppercase letter' },
      { met: /\d/.test(password), text: 'Contains at least one number' }
    ];
    return requirements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
       <Toaster       
            position='top-right'
            reverseOrder={false} 
            />
      <div className="max-w-md mx-auto pt-4">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center">
            <div className="text-white text-xl rotate-45">▲</div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sign Up</h2>
          </div>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">MAKING JOURNEY</h1>
          <p className="text-gray-600">Welcome to AngelX Speedo</p>
        </div>

        {!isOtpSent ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <input
                type="text"
                name="username"
                className="w-full px-4 py-3 rounded-lg bg-gray-50/80 border border-gray-200 focus:outline-none focus:border-indigo-500"
                placeholder="Create Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-50/80 border border-gray-200 focus:outline-none focus:border-indigo-500"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50/80 border ${
                    formErrors.password ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:border-indigo-500`}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50/80 border ${
                    !passwordsMatch ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:border-indigo-500`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!passwordsMatch && formData.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            <input
              type="text"
              name="referCode"
              className="w-full px-4 py-3 rounded-lg bg-gray-50/80 border border-gray-200 focus:outline-none focus:border-indigo-500"
              placeholder="Referral Code (optional)"
              value={formData.referCode}
              onChange={handleChange}
            />

            <div className="space-y-2">
              <p className="text-gray-700">Password must</p>
              {validatePassword(formData.password).map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    req.met ? 'border-none bg-green-500' : 'border-gray-300'
                  }`}>
                    {req.met && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm text-gray-500">{req.text}</span>
                </div>
              ))}
            </div>

            {formErrors.submit && (
              <p className="text-red-500 text-sm text-center">{formErrors.submit}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="w-full h-12 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign Up'}
            </button>

            <div className="text-center">
              <span className="text-gray-600">Already have an account?</span>{" "}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Login
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
                className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;