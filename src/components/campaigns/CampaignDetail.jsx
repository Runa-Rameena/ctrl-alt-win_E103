import React, { useState, useEffect } from 'react'
import { getCampaignById, addContribution } from '../../services/api'
import { ArrowLeft, Heart, Briefcase, Handshake, TrendingUp } from 'lucide-react'

export default function CampaignDetail({ campaignId, onBack }) {
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSupport, setShowSupport] = useState(false)
  const [supportType, setSupportType] = useState('funding')
  const [supportData, setSupportData] = useState({
    amount: '',
    name: '',
    message: '',
    skillOffered: '',
  })

  useEffect(() => {
    loadCampaign()
  }, [campaignId])

  async function loadCampaign() {
    try {
      const data = await getCampaignById(campaignId)
      setCampaign(data)
    } catch (error) {
      console.error('Error loading campaign:', error)
      alert('Campaign not found')
      onBack()
    }
    setLoading(false)
  }

  async function handleSupport() {
    if (!supportData.name) {
      alert('Please enter your name')
      return
    }

    if (supportType === 'funding' && (!supportData.amount || supportData.amount <= 0)) {
      alert('Please enter a valid amount')
      return
    }

    if (supportType === 'skills' && !supportData.skillOffered) {
      alert('Please describe the skill you can offer')
      return
    }

    try {
      const contribution = {
        type: supportType,
        name: supportData.name,
        message: supportData.message,
      }

      if (supportType === 'funding') {
        contribution.amount = parseInt(supportData.amount)
      } else if (supportType === 'skills') {
        contribution.skillOffered = supportData.skillOffered
      }

      await addContribution(campaignId, contribution)
      
      alert('Thank you for your support! 🎉')
      setShowSupport(false)
      setSupportData({ amount: '', name: '', message: '', skillOffered: '' })
      loadCampaign() // Reload to show updated stats
    } catch (error) {
      console.error('Error adding support:', error)
      alert('Error submitting support. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!campaign) return null

  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100).toFixed(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-6 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Campaigns
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {campaign.businessName}
              </h1>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">
                  {campaign.category}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {campaign.pitch}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Target Amount</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{campaign.targetAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Raised So Far</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{campaign.raisedAmount?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Supporters</p>
              <p className="text-2xl font-bold text-blue-600">
                {campaign.supportersCount || 0}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Progress</span>
              <span className="text-purple-600 font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {!showSupport ? (
            <button
              onClick={() => setShowSupport(true)}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Heart size={24} />
              Support This Business
            </button>
          ) : (
            <div className="border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Choose Support Type</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setSupportType('funding')}
                  className={`p-4 rounded-lg border-2 transition ${
                    supportType === 'funding'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="font-semibold text-sm">Funding</p>
                </button>
                <button
                  onClick={() => setSupportType('skills')}
                  className={`p-4 rounded-lg border-2 transition ${
                    supportType === 'skills'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Briefcase className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="font-semibold text-sm">Skills</p>
                </button>
                <button
                  onClick={() => setSupportType('collaboration')}
                  className={`p-4 rounded-lg border-2 transition ${
                    supportType === 'collaboration'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Handshake className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="font-semibold text-sm">Collaborate</p>
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={supportData.name}
                  onChange={(e) => setSupportData({ ...supportData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />

                {supportType === 'funding' && (
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={supportData.amount}
                    onChange={(e) => setSupportData({ ...supportData, amount: e.target.value })}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                )}

                {supportType === 'skills' && (
                  <textarea
                    placeholder="What skill can you offer? (e.g., Marketing, Design, Accounting)"
                    value={supportData.skillOffered}
                    onChange={(e) => setSupportData({ ...supportData, skillOffered: e.target.value })}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    rows="3"
                  />
                )}

                <textarea
                  placeholder="Message (optional)"
                  value={supportData.message}
                  onChange={(e) => setSupportData({ ...supportData, message: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  rows="2"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSupport(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSupport}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                  >
                    Submit Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
