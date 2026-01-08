import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Building2, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function InvestorProfile() {
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    const userInvestments = allTransactions.filter(t => t.investorEmail === userData.email);
    const totalInvested = userInvestments.reduce((sum, t) => sum + t.amount, 0);
    const uniqueVendors = new Set(userInvestments.map(t => t.vendorEmail)).size;

    setProfile({
      name: userData.name || 'Investor',
      email: userData.email,
      joinDate: userData.joinDate || new Date().toISOString(),
      totalInvested: totalInvested,
      totalInvestments: userInvestments.length,
      companiesSupported: uniqueVendors
    });

    setInvestments(userInvestments);
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Investment Portfolio Report', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Investor: ${profile.name}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);
    
    const tableData = investments.map(inv => [
      new Date(inv.date).toLocaleDateString(),
      inv.campaignName,
      inv.vendorName || 'Vendor',
      `₹${inv.amount.toLocaleString()}`,
      inv.status || 'Completed'
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Date', 'Campaign', 'Business', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Invested: ₹${profile.totalInvested.toLocaleString()}`, 14, finalY);
    
    doc.save(`${profile.name}_Investments.pdf`);
  };

  if (!profile) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
              <p className="text-gray-600 mt-2">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              Investor
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Invested</p>
                <p className="text-3xl font-bold text-blue-600">₹{profile.totalInvested.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Investments</p>
                <p className="text-3xl font-bold text-green-600">{profile.totalInvestments}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Companies Supported</p>
                <p className="text-3xl font-bold text-purple-600">{profile.companiesSupported}</p>
              </div>
              <Building2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Investment History</h2>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {investments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No investments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {investments.map((investment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(investment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {investment.campaignName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {investment.vendorName || 'Vendor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        ₹{investment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          {investment.status || 'Completed'}
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
