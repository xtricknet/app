import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Mail, AlertTriangle, Send, ArrowLeft, Loader, Clock } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Constants for form configuration
const CONTACT_METHODS = [
  { 
    id: 'form', 
    label: 'Support Ticket', 
    icon: Mail, 
    description: 'Submit a detailed support request for our team to review' 
  }
];

const ISSUE_TYPES = [
  { 
    id: 'deposit_issue', 
    label: 'Deposit Issue', 
    description: 'Problems with cryptocurrency deposits including failed or delayed transactions' 
  },
  { 
    id: 'withdrawal_issue', 
    label: 'Withdrawal Issue', 
    description: 'Issues related to withdrawing funds from your account' 
  },
  { 
    id: 'kyc_verification', 
    label: 'KYC Verification', 
    description: 'Questions or issues regarding identity verification processes' 
  },
  { 
    id: 'account_access', 
    label: 'Account Access', 
    description: 'Problems with logging in, account lock, suspicious activity alerts' 
  },
  { 
    id: 'platform_bug', 
    label: 'Platform Bug', 
    description: 'Technical issues or unexpected behavior with our platform' 
  },
  { 
    id: 'other', 
    label: 'Other Inquiry', 
    description: 'For any other questions or concerns not listed above' 
  }
];

const PLACEHOLDER_TEXTS = {
  deposit_issue: `Please provide details about your deposit: transaction date, amount, cryptocurrency, and the issue you're experiencing. Include any error messages you received.`,
  withdrawal_issue: 'Please describe your withdrawal issue including: transaction date, amount, destination address, and any error messages you received.',
  kyc_verification: `Please explain what issues you're having with KYC verification. Include any error messages or specific steps where you're experiencing difficulty.`,
  account_access: `Please describe the access issue you're experiencing. Include any error messages and when the problem started.`,
  platform_bug: 'Please describe the bug in detail including: what you were trying to do, what happened instead, and steps to reproduce the issue.',
  default: 'Please provide a detailed description of your issue. Include relevant dates, transaction IDs, and steps to reproduce if applicable.'
};

const SupportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { issueType, depositId, withdrawalId } = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(issueType || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    transactionId: depositId || withdrawalId || '',
    description: '',
    attachments: []
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setUserInfo(data.user);
          setFormData(prev => ({
            ...prev,
            name: data.user.username || '',
            email: data.user.email || ''
          }));
        }
      } catch (error) {
        toast.error('Failed to load user information');
      }
    };

    fetchUserProfile();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 3) {
      toast.error('Maximum 3 files can be uploaded');
      return;
    }
    
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      toast.error('Files must be less than 5MB each');
      return;
    }
    
    setFormData(prev => ({ ...prev, attachments: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'attachments') {
          formDataToSend.append(key, value);
        }
      });
      
      formDataToSend.append('issueType', selectedIssue);
      formData.attachments.forEach(file => {
        formDataToSend.append('attachments', file);
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/support/ticket`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Support ticket submitted successfully');
        setTimeout(() => {
          navigate('/support/tickets', { state: { ticketId: data.ticketId } });
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit ticket');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit support request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContactMethodCard = ({ method }) => (
    <div 
      onClick={() => setSelectedMethod(method.id)}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <method.icon className="h-6 w-6" />
        </div>
        <h3 className="font-medium mb-2">{method.label}</h3>
        <p className="text-sm text-gray-500">{method.description}</p>
      </div>
    </div>
  );

  const IssueTypeCard = ({ issue }) => (
    <div 
      onClick={() => setSelectedIssue(issue.id)}
      className={`rounded-xl p-6 cursor-pointer transition-all ${
        selectedIssue === issue.id 
          ? 'bg-blue-50 border-2 border-blue-500' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <h3 className="font-medium mb-2">{issue.label}</h3>
      <p className="text-sm text-gray-500">{issue.description}</p>
    </div>
  );

  const SupportForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Your Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Email Address"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <textarea
        name="description"
        value={formData.description}
        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
        rows="5"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={PLACEHOLDER_TEXTS[selectedIssue] || PLACEHOLDER_TEXTS.default}
        required
      />

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          accept="image/*, application/pdf"
        />
        <label 
          htmlFor="file-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          Click to upload files
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Max 3 files (JPG, PNG, PDF) under 5MB each
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader className="animate-spin h-5 w-5 mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Submit Support Request
          </>
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Customer Support</h2>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">How can we help you?</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Select an option below to get started with your support request
            </p>
          </div>

          <div className="p-6">
            {!selectedMethod && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CONTACT_METHODS.map(method => (
                  <ContactMethodCard key={method.id} method={method} />
                ))}
              </div>
            )}

            {selectedMethod && !selectedIssue && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ISSUE_TYPES.map(issue => (
                  <IssueTypeCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}

            {selectedMethod && selectedIssue && <SupportForm />}
          </div>
        </div>

        {userInfo && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/support/tickets')}
              className="w-full bg-white text-blue-600 hover:bg-gray-50 py-4 rounded-xl shadow-sm font-medium flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>View your support ticket history</span>
            </button>
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default SupportPage;