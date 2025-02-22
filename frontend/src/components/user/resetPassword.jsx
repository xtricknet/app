
import React, { useState } from 'react';
import { Shield, CreditCard, ArrowLeft } from "lucide-react";
import toast, {Toaster} from 'react-hot-toast';

const resetPassword= () => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneNumber = '+91 70****897';

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPassword(value);
    }
  };

  const handleSendOtp = () => {
    // Handle OTP sending logic here
    console.log('Sending OTP...');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length !== 6) {
      toast.error('Password must be 6 digits');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          type="button"
          className="p-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">
          Security
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Reset transaction password
          </h2>
          
          <p className="text-gray-500">
            SMS OTP send to {phoneNumber}
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Please enter SMS OTP"
            className="w-full border-none bg-transparent focus:outline-none p-0 h-auto placeholder:text-gray-400"
          />
          <button 
            type="button"
            onClick={handleSendOtp}
            className="text-blue-600 hover:text-blue-700 p-0 h-auto bg-transparent"
          >
            Send
          </button>
        </div>

        {/* Password Input */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <CreditCard className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Please enter transaction password"
            className="w-full border-none bg-transparent focus:outline-none p-0 h-auto placeholder:text-gray-400"
          />
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500">
          The transaction password must be composed of 6 digits only
        </p>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 h-auto rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Confirm'}
        </button>
      </form>

       <Toaster       
            position='top-right'
            reverseOrder={false} 
            />
    </div>
  );
};

export default resetPassword;