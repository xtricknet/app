import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Search, 
  Download,
  Hash,
  User,
  Mail,
  Calendar,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      const data = await response.json();
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" /> 
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <Clock className="w-4 h-4 text-yellow-600" /> 
      },
      failed: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <XCircle className="w-4 h-4 text-red-600" /> 
      },
    };
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${statusMap[status]?.color}`}>
        {statusMap[status]?.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedAndFilteredTransactions = transactions
    .filter(transaction => {
      const matchesFilter = filter === 'all' || transaction.type === filter;
      const matchesSearch = 
        transaction.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  // Calculate pagination values after sortedAndFilteredTransactions is defined
  const totalPages = Math.ceil(sortedAndFilteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = sortedAndFilteredTransactions.slice(startIndex, endIndex);

  const getTransactionAmount = (type, amount) => {
    const className = type === 'deposit' ? 'text-green-600' : 'text-blue-600';
    const sign = type === 'deposit' ? '+' : '-';
    return <span className={`font-medium ${className}`}>
    {sign}{type === 'deposit' ? '$' : '₹'}{amount.toLocaleString()}
  </span>;
  };

  const DetailItem = ({ icon, label, value, className = "" }) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`mt-1 font-medium break-all ${className}`}>{value}</div>
      </div>
    </div>
  );

  const TransactionDetails = ({ transaction, onClose }) => {
    if (!transaction) return null;

    return (
      <Dialog open={!!transaction} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about transaction {transaction.transactionId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-6">
            {/* User Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<User className="w-5 h-5 text-gray-400" />}
                  label="Username"
                  value={transaction.user.username}
                />
                <DetailItem 
                  icon={<Mail className="w-5 h-5 text-gray-400" />}
                  label="Email"
                  value={transaction.user.email}
                />
              </div>
            </div>

            {/* Transaction Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Transaction Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={transaction.type === 'deposit' ? 
                    <ArrowUpCircle className="w-5 h-5 text-green-500" /> : 
                    <ArrowDownCircle className="w-5 h-5 text-blue-500" />}
                  label="Type"
                  value={<span className="capitalize">{transaction.type}</span>}
                />
                <DetailItem 
                  icon={<Hash className="w-5 h-5 text-gray-400" />}
                  label="Amount"
                  value={getTransactionAmount(transaction.type, transaction.amount)}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Technical Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <DetailItem 
                  icon={<Hash className="w-5 h-5 text-gray-400" />}
                  label="Transaction ID"
                  value={<span className="font-mono">{transaction.transactionId}</span>}
                />
                {transaction.transactionHash && (
                  <DetailItem 
                    icon={<Hash className="w-5 h-5 text-gray-400" />}
                    label="Transaction Hash"
                    value={<span className="font-mono">{transaction.transactionHash}</span>}
                  />
                )}
                {transaction.depositId && (
                  <DetailItem 
                    icon={<Hash className="w-5 h-5 text-gray-400" />}
                    label="Deposit ID"
                    value={<span className="font-mono">{transaction.depositId}</span>}
                  />
                )}
                {transaction.withdrawalId && (
                  <DetailItem 
                    icon={<Hash className="w-5 h-5 text-gray-400" />}
                    label="Withdrawal ID"
                    value={<span className="font-mono">{transaction.withdrawalId}</span>}
                  />
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Timestamps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<Calendar className="w-5 h-5 text-gray-400" />}
                  label="Created At"
                  value={formatDate(transaction.createdAt)}
                />
                <DetailItem 
                  icon={<RefreshCw className="w-5 h-5 text-gray-400" />}
                  label="Last Updated"
                  value={formatDate(transaction.updatedAt)}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Format transaction data for export
  const formatTransactionDataForExport = () => {
    return sortedAndFilteredTransactions.map(transaction => ({
      Username: transaction.user.username,
      Email: transaction.user.email,
      TransactionId: transaction.transactionId,
      Type: transaction.type,
      Amount: transaction.amount,
      Status: transaction.status,
      CreatedAt: formatDate(transaction.createdAt),
      UpdatedAt: formatDate(transaction.updatedAt),
      TransactionHash: transaction.transactionHash || '',
      DepositId: transaction.depositId || '',
      WithdrawalId: transaction.withdrawalId || ''
    }));
  };

  // Get current date and time formatted
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(':', '');
    
    return `${date}_${time}`;
  };

  // Export transactions to Excel
  const exportToExcel = () => {
    const formattedData = formatTransactionDataForExport();
    
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Add title as header
    XLSX.utils.sheet_add_aoa(worksheet, [['Transaction Export Report']], { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(worksheet, [['Generated on: ' + formatDate(new Date())]], { origin: 'A2' });
    XLSX.utils.sheet_add_aoa(worksheet, [['']], { origin: 'A3' });
    
    // Adjust column widths
    const cols = Object.keys(formattedData[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = cols;
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Generate filename with current date and time
    const dateTime = getCurrentDateTime();
    const filename = `Transactions_Export_${dateTime}.xlsx`;
    
    // Export to Excel file
    XLSX.writeFile(workbook, filename);
  };

  // Export transactions to PDF
  const exportToPDF = () => {
    const formattedData = formatTransactionDataForExport();
    const dateTime = getCurrentDateTime();
    const filename = `Transactions_Export_${dateTime}.pdf`;
    
    // Load jsPDF and jsPDF-AutoTable if not already loaded
    const loadPDFLibraries = async () => {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        const jsPDFScript = document.createElement('script');
        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jsPDFScript.async = true;
        document.body.appendChild(jsPDFScript);
        
        await new Promise((resolve) => {
          jsPDFScript.onload = resolve;
        });
        
        const autoTableScript = document.createElement('script');
        autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
        autoTableScript.async = true;
        document.body.appendChild(autoTableScript);
        
        await new Promise((resolve) => {
          autoTableScript.onload = resolve;
        });
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('landscape');
      
      // Add header with logo and title
      doc.setFontSize(18);
      doc.text('Transaction Export Report', 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Generated on: ${formatDate(new Date())}`, 14, 30);
      
      // Add filter information if applied
      if (filter !== 'all' || searchTerm) {
        let filterText = 'Filters applied: ';
        if (filter !== 'all') filterText += `Type: ${filter} `;
        if (searchTerm) filterText += `Search: "${searchTerm}" `;
        doc.text(filterText, 14, 38);
      }
      
      // Define the table columns 
      const columns = [
        { header: 'Username', dataKey: 'Username' },
        { header: 'Transaction ID', dataKey: 'TransactionId' },
        { header: 'Type', dataKey: 'Type' },
        { header: 'Amount', dataKey: 'Amount' },
        { header: 'Status', dataKey: 'Status' },
        { header: 'Created At', dataKey: 'CreatedAt' },
      ];
      
      // Generate the table
      doc.autoTable({
        columns,
        body: formattedData,
        startY: 45,
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        headerStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
      
      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 20, 
          doc.internal.pageSize.height - 10
        );
      }
      
      // Save the PDF
      doc.save(filename);
    };
    
    loadPDFLibraries();
  };

  // Load the XLSX library when component mounts
  useEffect(() => {
      const loadExportLibraries = async () => {
        // Load XLSX library if not already loaded
        if (!window.XLSX) {
          const scriptXLSX = document.createElement('script');
          scriptXLSX.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          scriptXLSX.async = true;
          document.body.appendChild(scriptXLSX);
          
          await new Promise((resolve) => {
            scriptXLSX.onload = resolve;
          });
        }
      };
      
      loadExportLibraries();
    }, []); 

  return (
    <div className="p-6 space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Hash className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Stats */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-xl font-bold">Transaction Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-evenly gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Amount (Deposits)</p>
              <p className="text-2xl font-bold text-green-600">
                ${transactions
                  .filter(t => t.type === 'deposit' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Amount (Withdrawals)</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{transactions
                  .filter(t => t.type === 'withdrawal' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Amount (Rewards)</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{transactions
                  .filter(t => t.type === 'referral_reward' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">
                {new Set(transactions.map(t => t.user._id)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Transactions</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-white border rounded-lg shadow-lg" align="end">
                <div className="bg-white rounded-md">
                  <button 
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors rounded-md"
                    onClick={exportToExcel}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Export as Excel
                  </button>
                  <button 
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors rounded-md"
                    onClick={exportToPDF}
                  >
                    <FileText className="w-4 h-4 text-red-600" />
                    Export as PDF
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or transaction ID..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white border shadow-sm">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-gray-500">User</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-500">Type</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-500 cursor-pointer" 
                          onClick={() => handleSort('amount')}>
                        <div className="flex items-center gap-1">
                          Amount
                          {sortConfig.key === 'amount' && (
                            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center gap-1">
                          Date
                          {sortConfig.key === 'createdAt' && (
                            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-500">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((transaction) => (
                        <tr 
                          key={transaction._id} 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <td className="p-4">
                            <div className="font-medium">{transaction.user.username}</div>
                            <div className="text-sm text-gray-500">{transaction.user.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {transaction.type === 'deposit' ? (
                                <ArrowUpCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <ArrowDownCircle className="w-5 h-5 text-blue-500" />
                              )}
                              <span className="capitalize">{transaction.type}</span>
                            </div>
                          </td>
                          <td className="p-4">{getTransactionAmount(transaction.type, transaction.amount)}</td>
                          <td className="p-4">{getStatusBadge(transaction.status)}</td>
                          <td className="p-4 text-gray-600">{formatDate(transaction.createdAt)}</td>
                          <td className="p-4">
                            <span className="font-mono text-sm">{transaction.transactionId.slice(0, 8)}...</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 p-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredTransactions.length)} of {sortedAndFilteredTransactions.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-3xl bg-white">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
                {getStatusBadge(selectedTransaction.status)}
              </div>
            </DialogHeader>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">User</p>
                    <p className="font-medium">{selectedTransaction.user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">{getTransactionAmount(selectedTransaction.type, selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-mono">{selectedTransaction.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedTransaction.type === 'deposit' ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-blue-500" />
                      )}
                      <span className="capitalize">{selectedTransaction.type}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="mt-6 space-y-4">
                {selectedTransaction.transactionHash && (
                  <div>
                    <p className="text-sm text-gray-500">Transaction Hash</p>
                    <p className="font-mono break-all">{selectedTransaction.transactionHash}</p>
                  </div>
                )}
                {selectedTransaction.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="mt-1">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransactionManagement;