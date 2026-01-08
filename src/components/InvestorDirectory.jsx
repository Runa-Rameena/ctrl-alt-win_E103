 
import React, { useState } from 'react';
import { Users, MessageCircle, TrendingUp, MapPin, Filter, Search } from 'lucide-react';
import { mockInvestors } from '../data/mockInvestors';
import { useAuth } from '../contexts/AuthContext';

export default function InvestorDirectory({ onStartChat }) {
  const [investors, setInvestors] = useState(mockInvestors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('All');
  const { userProfile } = useAuth();

  const allInterests = ['All', ...new Set(mockInvestors.flatMap(inv => inv.interests))];

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInterest = selectedInterest === 'All' || investor.interests.includes(selectedInterest);
    return matchesSearch && matchesInterest;
  });

  const handleConnect = (investor) => {
    // Save connection request
    const connections = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
    const newRequest = {
      id: Date.now(),
      vendorId: userProfile?.email,
      vendorName: userProfile?.name,
      investorId: investor.email,
      investorName: investor.name,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    connections.push(newRequest);
    localStorage.setItem('connectionRequests', JSON.stringify(connections));
    alert(`Connection request sent to ${investor.name}!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            Investor Directory
          </h1>
          <p className="text-gray-600">Connect with investors who believe in your vision</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Interest Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={selectedInterest}
                onChange={(e) => setSelectedInterest(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {allInterests.map(interest => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{filteredInvestors.length}</p>
            <p className="text-gray-600">Active Investors</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              ₹{(mockInvestors.reduce((sum, inv) => sum + inv.totalInvested, 0) / 10000000).toFixed(1)}Cr
            </p>
            <p className="text-gray-600">Total Investment Pool</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {mockInvestors.reduce((sum, inv) => sum + inv.companiesSupported, 0)}
            </p>
            <p className="text-gray-600">Companies Funded</p>
          </div>
        </div>

        {/* Investor Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors.map(investor => (
            <div key={investor.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{investor.photo}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{investor.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin size={14} />
                    {investor.location}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    investor.availability === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {investor.availability}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 text-sm mb-4">{investor.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-500">Investment Range</p>
                  <p className="text-sm font-semibold text-gray-800">{investor.investmentRange}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Companies Backed</p>
                  <p className="text-sm font-semibold text-gray-800">{investor.companiesSupported}</p>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {investor.interests.slice(0, 3).map(interest => (
                    <span key={interest} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {interest}
                    </span>
                  ))}
                  {investor.interests.length > 3 && (
                    <span className="text-xs text-gray-500">+{investor.interests.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleConnect(investor)}
                  className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                >
                  Connect
                </button>
                <button
                  onClick={() => onStartChat(investor)}
                  className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold text-sm flex items-center justify-center gap-1"
                >
                  <MessageCircle size={16} />
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredInvestors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No investors found matching your criteria</p>
          </div>
        )}

      </div>
    </div>
  );
}
