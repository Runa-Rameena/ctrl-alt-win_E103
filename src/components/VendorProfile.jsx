import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const allCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // Get user's campaigns
    const userCampaigns = allCampaigns.filter(c => c.vendorEmail === userData.email);
    
    // Get user's transactions
    const userTransactions = allTransactions.filter(t => t.vendorEmail === userData.email);

    const totalRaised = userTransactions.reduce((sum, t) => sum + t.amount, 0);

    setProfile({
      name: userData.name || 'Vendor',
      email: userData.email,
      businessName: userData.businessName || 'My Business',
      joinDate: userData.joinDate || new Date().toISOString(),
      totalCampaigns: userCampaigns.length,
      totalRaised: totalRaised,
      activeCampaigns: userCampaigns.filter(c => c.status === 'active').length
    });

    setTransactions(userTransactions);
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Transaction History Report', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Business: ${profile.businessName}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);
    
    // Table
    const tableData = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.investorName,
      t.campaignName,
      `₹${t.amount.toLocaleString()}`,
      t.status || 'Completed'
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Date', 'Investor', 'Campaign', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Raised: ₹${profile.totalRaised.toLocaleString()}`, 14, finalY);
    
    doc.save(`${profile.businessName}_Transactions.pdf`);
  };

  if (!profile) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{profile.businessName}</h1>
              <p className="text-gray-600 mt-2">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
              Vendor
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Raised</p>
                <p className="text-3xl font-bold text-green-600">₹{profile.totalRaised.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Campaigns</p>
                <p className="text-3xl font-bold text-blue-600">{profile.totalCampaigns}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold text-purple-600">{profile.activeCampaigns}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.investorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.campaignName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          {transaction.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
