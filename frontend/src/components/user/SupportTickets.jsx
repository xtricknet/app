import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, CheckCircle, Clock, RefreshCcw, ArrowLeft, PaperclipIcon, Send } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const SupportTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketId } = location.state || {};
  
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchTickets();
    
    // If ticketId is provided in location state, open that ticket
    if (ticketId) {
      fetchTicketDetails(ticketId);
    }
  }, [ticketId]);
  
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/support/tickets`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTicketDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/support/tickets/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSelectedTicket(response.data.ticket);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
    }
  };
  
  const handleTicketSelect = (ticket) => {
    fetchTicketDetails(ticket.id);
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Open</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Resolved</span>;
      case 'closed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Closed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };
  
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/support/tickets/${selectedTicket.id}/reply`,
        { message: replyText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setReplyText('');
        fetchTicketDetails(selectedTicket.id);
        toast.success('Reply submitted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to submit reply');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderTicketList = () => (
    <div className="w-full md:w-1/3 border-r border-gray-200 pr-4 overflow-y-auto max-h-[70vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your Tickets</h2>
        <button 
          onClick={fetchTickets}
          className="text-blue-600 hover:text-blue-800"
          title="Refresh tickets"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p>No support tickets yet</p>
          <button
            onClick={() => navigate('/support')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Create new support request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => handleTicketSelect(ticket)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedTicket?.id === ticket.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 truncate max-w-[70%]">
                  {ticket.issueType === 'deposit_issue' ? 'Deposit Issue' :
                   ticket.issueType === 'withdrawal_issue' ? 'Withdrawal Issue' :
                   ticket.issueType === 'kyc_verification' ? 'KYC Verification' :
                   ticket.issueType === 'account_access' ? 'Account Access' :
                   ticket.issueType === 'platform_bug' ? 'Platform Bug' : 'General Inquiry'}
                </h3>
                {getStatusBadge(ticket.status)}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                <div className="truncate">{ticket.description.substring(0, 60)}...</div>
                <div className="mt-1 text-xs text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(ticket.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/support')}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Create New Support Request
        </button>
      </div>
    </div>
  );
  
  const renderTicketDetails = () => {
    if (!selectedTicket) {
      return (
        <div className="w-full md:w-2/3 pl-0 md:pl-6 flex items-center justify-center h-[70vh]">
          <div className="text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg">Select a ticket to view details</p>
            <p className="text-sm mt-2">Or create a new support request</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full md:w-2/3 pl-0 md:pl-6 flex flex-col h-[70vh]">
        <div className="mb-4 flex items-center justify-between">
          <button 
            onClick={() => setSelectedTicket(null)}
            className="md:hidden flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Status:</span>
            {getStatusBadge(selectedTicket.status)}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="font-medium text-gray-900">
              {selectedTicket.issueType === 'deposit_issue' ? 'Deposit Issue' :
               selectedTicket.issueType === 'withdrawal_issue' ? 'Withdrawal Issue' :
               selectedTicket.issueType === 'kyc_verification' ? 'KYC Verification' :
               selectedTicket.issueType === 'account_access' ? 'Account Access' :
               selectedTicket.issueType === 'platform_bug' ? 'Platform Bug' : 'General Inquiry'}
            </h3>
            <span className="text-sm text-gray-500">
              Ticket #{selectedTicket.id}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Date Created:</span>
              <span className="ml-2">{formatDate(selectedTicket.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2">{formatDate(selectedTicket.updatedAt)}</span>
            </div>
            
            {selectedTicket.transactionId && (
              <div className="col-span-2">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="ml-2 font-mono">{selectedTicket.transactionId}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow mb-4 space-y-4">
          {/* Initial message */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                  {selectedTicket.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-2">
                  <p className="font-medium">{selectedTicket.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedTicket.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="text-gray-800 whitespace-pre-line">
              {selectedTicket.description}
            </div>
            
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <PaperclipIcon className="w-4 h-4 mr-1" /> Attachments:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTicket.attachments.map((file, idx) => (
                    <a 
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate flex items-center"
                    >
                      <PaperclipIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                      {file.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Reply messages */}
          {selectedTicket.messages && selectedTicket.messages.map((message, idx) => (
            <div 
              key={idx} 
              className={`rounded-lg p-4 ${
                message.isStaff 
                  ? 'bg-blue-50 border border-blue-100 ml-4' 
                  : 'bg-white border border-gray-200 mr-4'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                    message.isStaff ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    {message.isStaff ? 'S' : selectedTicket.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2">
                    <p className="font-medium">{message.isStaff ? 'Support Team' : selectedTicket.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(message.timestamp)}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-800 whitespace-pre-line">
                {message.content}
              </div>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <PaperclipIcon className="w-4 h-4 mr-1" /> Attachments:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {message.attachments.map((file, idx) => (
                      <a 
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate flex items-center"
                      >
                        <PaperclipIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                        {file.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Reply form */}
        {['open', 'in_progress'].includes(selectedTicket.status) && (
          <form onSubmit={handleReplySubmit} className="mt-auto">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full p-3 focus:outline-none"
                rows={3}
                required
              ></textarea>
              
              <div className="bg-gray-50 px-3 py-2 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedTicket.status === 'in_progress' && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-yellow-600" />
                      <span>A support agent is working on your case</span>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {selectedTicket.status === 'in_progress' && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure this issue is resolved? This will close the ticket.')) {
                      // Add API call to mark ticket as resolved
                      toast.success('Ticket marked as resolved');
                    }
                  }}
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark as Resolved
                </button>
              </div>
            )}
          </form>
        )}
        
        {/* Ticket closed/resolved notice */}
        {['resolved', 'closed'].includes(selectedTicket.status) && (
          <div className="mt-auto bg-gray-50 rounded-lg p-4 text-center">
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
              selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {selectedTicket.status === 'resolved' ? <CheckCircle className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </div>
            <p className="font-medium">
              {selectedTicket.status === 'resolved' 
                ? 'This ticket has been resolved' 
                : 'This ticket is closed'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedTicket.status === 'resolved'
                ? 'If you still have questions, you can create a new support ticket.'
                : 'This conversation is no longer active. Please create a new ticket if needed.'}
            </p>
            
            {selectedTicket.status === 'resolved' && (
              <button
                onClick={() => {
                  // Add API call to reopen ticket
                  toast.success('Ticket reopened');
                }}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                This issue is not resolved - Reopen ticket
              </button>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-5 md:p-8 shadow-md">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
              <p className="text-gray-600 mt-1">
                View and manage your support request history
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-6">
          {renderTicketList()}
          {renderTicketDetails()}
        </div>
      </div>
      
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      />
    </div>
  );
};

export default SupportTickets;