import React, { useState } from 'react'
import { createCampaign } from '../../services/api'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { improvePitch } from '../../services/openai'

export default function CreateCampaign({ onBack, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [improvingPitch, setImprovingPitch] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    pitch: '',
    targetAmount: '',
    supportTypes: ['funding'],
  })

  async function handleImprovePitch() {
    if (!formData.pitch) {
      alert('Please write your pitch first')
      return
    }

    setImprovingPitch(true)
    try {
      const improved = await improvePitch(formData.pitch)
      setFormData({ ...formData, pitch: improved })
      alert('Pitch improved! ✨')
    } catch (error) {
      console.error('Error improving pitch:', error)
      alert('Could not improve pitch, but your original looks great!')
    }
    setImprovingPitch(false)
  }

  function handleSupportTypeToggle(type) {
    if (formData.supportTypes.includes(type)) {
      setFormData({
        ...formData,
        supportTypes: formData.supportTypes.filter((t) => t !== type)
      })
    } else {
      setFormData({
        ...formData,
        supportTypes: [...formData.supportTypes, type]
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.businessName || !formData.category || !formData.pitch || !formData.targetAmount) {
      alert('Please fill all required fields')
      return
    }

    if (formData.supportTypes.length === 0) {
      alert('Please select at least one support type')
      return
    }

    setLoading(true)
    try {
      const campaignData = {
        ...formData,
        targetAmount: parseInt(formData.targetAmount),
      }

      const campaignId = await createCampaign(campaignData)
      alert('Campaign created successfully! 🎉')
      onSuccess(campaignId)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Error creating campaign. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-6 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Campaigns
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Launch Your Campaign
          </h1>
          <p className="text-gray-600 mb-8">
            Get support from the community to grow your business
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g., Meena's Handloom Sarees"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">-- Select Category --</option>
                <option value="Handmade crafts">Handmade crafts</option>
                <option value="Food/Bakery">Food/Bakery</option>
                <option value="Retail/Fashion">Retail/Fashion</option>
                <option value="Services">Services</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Digital products">Digital products</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Campaign Pitch *
                </label>
                <button
                  type="button"
                  onClick={handleImprovePitch}
                  disabled={improvingPitch}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 font-semibold"
                >
                  <Sparkles size={14} />
                  {improvingPitch ? 'Improving...' : 'AI Improve'}
                </button>
              </div>
              <textarea
                value={formData.pitch}
                onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                placeholder="Tell your story... Why do you need support? What will you achieve? How will it help your community?"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                rows="6"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Tip: Be authentic and specific about your goals
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Funding Target Amount (₹) *
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="50000"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                required
                min="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What support do you need? *
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300">
                  <input
                    type="checkbox"
                    checked={formData.supportTypes.includes('funding')}
                    onChange={() => handleSupportTypeToggle('funding')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">💰 Funding</p>
                    <p className="text-sm text-gray-600">
                      Financial support to purchase equipment, inventory, or expand operations
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300">
                  <input
                    type="checkbox"
                    checked={formData.supportTypes.includes('skills')}
                    onChange={() => handleSupportTypeToggle('skills')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">🎨 Skills & Expertise</p>
                    <p className="text-sm text-gray-600">
                      Get help from professionals (marketing, design, accounting, etc.)
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300">
                  <input
                    type="checkbox"
                    checked={formData.supportTypes.includes('collaboration')}
                    onChange={() => handleSupportTypeToggle('collaboration')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">🤝 Collaboration</p>
                    <p className="text-sm text-gray-600">
                      Partner with other businesses for distribution, joint ventures, etc.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Launch Campaign 🚀'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
