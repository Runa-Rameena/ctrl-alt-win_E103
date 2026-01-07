import React, { useState, useEffect } from 'react'
import { getCampaigns } from '../../services/api'
import { TrendingUp, Users, Target, ArrowRight } from 'lucide-react'

export default function CampaignList({ onSelectCampaign, onCreateNew }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadCampaigns()
  }, [filter])

  async function loadCampaigns() {
    setLoading(true)
    try {
      const data = await getCampaigns(filter === 'all' ? null : filter)
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
    setLoading(false)
  }

  function calculateProgress(raised, target) {
    return Math.min((raised / target) * 100, 100).toFixed(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Support Growing Businesses
          </h1>
          <p className="text-gray-600 mb-6">
            Help small businesses achieve their growth goals through funding, skills, or collaboration
          </p>
          
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 mb-6"
          >
            + Launch Your Campaign
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {['all', 'Food/Bakery', 'Handmade crafts', 'Retail/Fashion', 'Agriculture', 'Services'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                filter === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No campaigns yet in this category</p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Be the first to launch a campaign!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => onSelectCampaign(campaign.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {campaign.businessName}
                    </h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                      {campaign.category}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {campaign.pitch}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-700">
                        ₹{campaign.raisedAmount?.toLocaleString() || 0}
                      </span>
                      <span className="text-gray-500">
                        of ₹{campaign.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${calculateProgress(campaign.raisedAmount || 0, campaign.targetAmount)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users size={16} />
                        <span>{campaign.supportersCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Target size={16} />
                        <span>{calculateProgress(campaign.raisedAmount || 0, campaign.targetAmount)}%</span>
                      </div>
                    </div>
                    <ArrowRight className="text-purple-600" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
