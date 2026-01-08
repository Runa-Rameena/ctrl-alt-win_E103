import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase/config'
import { collection, addDoc } from 'firebase/firestore'
import { X, Upload, Sparkles } from 'lucide-react'

export default function CreateCampaign({ onClose, onCampaignCreated }) {
  const { currentUser, userProfile } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    category: '',
    duration: '',
    image: '',
    rewards: []
  })
  const [creating, setCreating] = useState(false)
  const [currentReward, setCurrentReward] = useState({ title: '', amount: '', description: '' })

  const categories = [
    'Technology',
    'Food & Beverage',
    'Fashion',
    'Health & Wellness',
    'Education',
    'Arts & Crafts',
    'Social Impact',
    'Real Estate',
    'Manufacturing',
    'Services',
    'Other'
  ]

  function handleChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function handleAddReward() {
    if (currentReward.title && currentReward.amount && currentReward.description) {
      setFormData(prev => ({
        ...prev,
        rewards: [...prev.rewards, { ...currentReward, id: Date.now() }]
      }))
      setCurrentReward({ title: '', amount: '', description: '' })
    }
  }

  function handleRemoveReward(id) {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== id)
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.goal || !formData.category || !formData.duration) {
      alert('❌ Please fill in all required fields')
      return
    }

    setCreating(true)
    
    try {
      const campaignData = {
        title: formData.title,
        description: formData.description,
        goal: Number(formData.goal),
        raised: 0,
        backers: 0,
        category: formData.category,
        duration: formData.duration,
        image: formData.image || 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Campaign+Image',
        rewards: formData.rewards,
        vendorId: currentUser.uid,
        vendorName: userProfile?.name || 'Unknown',
        vendorEmail: userProfile?.email || currentUser.email,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'campaigns'), campaignData)
      
      alert('✅ Campaign created successfully!')
      onCampaignCreated()
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('❌ Failed to create campaign. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={32} />
              <div>
                <h2 className="text-2xl font-bold">Create New Campaign</h2>
                <p className="text-sm text-purple-100">Launch your fundraising campaign</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:text-purple-600 rounded-full p-2 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Campaign Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Eco-Friendly Product Launch"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Campaign Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your campaign, what makes it unique, and how the funds will be used..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} characters (Minimum 100 recommended)
            </p>
          </div>

          {/* Goal and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Funding Goal */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Funding Goal (₹) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="e.g., 100000"
                min="1000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum ₹1,000</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Campaign Duration <span className="text-red-600">*</span>
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              required
            >
              <option value="">Select duration</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="120">120 Days</option>
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Campaign Image URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              />
              <button
                type="button"
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
              >
                <Upload size={20} />
                Upload
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use default image. Recommended size: 800x400px
            </p>
            {formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Invalid+Image+URL'
                  }}
                />
              </div>
            )}
          </div>

          {/* Rewards Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rewards (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Offer rewards to encourage backers at different funding levels
            </p>

            {/* Add Reward Form */}
            <div className="bg-purple-50 rounded-lg p-4 space-y-3 mb-4">
              <input
                type="text"
                value={currentReward.title}
                onChange={(e) => setCurrentReward(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Reward Title (e.g., Early Bird Special)"
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
              />
              <input
                type="number"
                value={currentReward.amount}
                onChange={(e) => setCurrentReward(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Minimum Amount (₹)"
                min="100"
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
              />
              <textarea
                value={currentReward.description}
                onChange={(e) => setCurrentReward(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Reward Description"
                rows={2}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleAddReward}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                + Add Reward
              </button>
            </div>

            {/* Rewards List */}
            {formData.rewards.length > 0 && (
              <div className="space-y-3">
                {formData.rewards.map(reward => (
                  <div key={reward.id} className="bg-white border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{reward.title}</h4>
                        <p className="text-sm font-semibold text-purple-600 mt-1">₹{reward.amount}+</p>
                        <p className="text-sm text-gray-600 mt-2">{reward.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReward(reward.id)}
                        className="text-red-600 hover:bg-red-50 rounded-full p-2 transition ml-2"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating Campaign...' : '🚀 Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
