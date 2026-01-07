import React, { useState } from 'react'
import { getRecommendations, generateSocialMediaPosts } from '../services/openai'
import { Loader, Zap, Clock, DollarSign, Sparkles, Copy } from 'lucide-react'

export default function AIAssistant() {
  const [step, setStep] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [posts, setPosts] = useState(null)
  const [showPosts, setShowPosts] = useState(false)

  const [formData, setFormData] = useState({
    budget: 5000,
    time: 3,
    businessType: '',
    products: '',
    customers: '',
    goal: '',
  })

  const questions = [
    {
      key: 'businessType',
      label: 'What type of business do you run?',
      type: 'select',
      options: ['Handmade crafts', 'Food/Bakery', 'Retail/Fashion', 'Services', 'Agriculture', 'Digital products', 'Other'],
    },
    {
      key: 'products',
      label: 'What do you sell/offer? (Be specific)',
      type: 'text',
      placeholder: 'e.g., Organic honey, Traditional sarees, Web design services',
    },
    {
      key: 'customers',
      label: 'How many active customers do you have currently?',
      type: 'select',
      options: ['Less than 10', '10-50', '50-200', '200-500', '500+'],
    },
    {
      key: 'goal',
      label: 'What is your main growth goal?',
      type: 'select',
      options: ['Increase visibility', 'More sales', 'Build community', 'Expand to new platforms', 'Launch new product'],
    },
  ]

  async function handleGetRecommendations() {
    if (!formData.businessType || !formData.products || !formData.goal) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const recs = await getRecommendations(formData)
      setRecommendations(recs)
      setStep(questions.length + 1)
    } catch (error) {
      alert('Error getting recommendations. Please check your API key and try again.')
      console.error(error)
    }
    setLoading(false)
  }

  async function handleGeneratePosts() {
    setLoading(true)
    try {
      const generatedPosts = await generateSocialMediaPosts(formData)
      setPosts(generatedPosts)
      setShowPosts(true)
    } catch (error) {
      alert('Error generating posts')
      console.error(error)
    }
    setLoading(false)
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  // Step 0: Budget and Time
  if (step === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Let's Understand Your Constraints
            </h2>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Monthly Marketing Budget: ₹{formData.budget.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>₹0</span>
                  <span>₹50,000</span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Available Time per Week: {formData.time} hours
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>1 hour</span>
                  <span>20 hours</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(0)}
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700"
            >
              Next: Tell Us About Your Business →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Questions
  if (step < questions.length) {
    const q = questions[step]
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${((step + 1) / (questions.length + 1)) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Question {step + 1} of {questions.length}
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">{q.label}</h2>

            {q.type === 'select' ? (
              <select
                value={formData[q.key]}
                onChange={(e) => setFormData({ ...formData, [q.key]: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 text-lg"
              >
                <option value="">-- Select --</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={q.placeholder}
                value={formData[q.key]}
                onChange={(e) => setFormData({ ...formData, [q.key]: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 text-lg"
              />
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (formData[q.key]) setStep(step + 1)
                  else alert('Please fill this field')
                }}
                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Review step
  if (step === questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Your Details</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left space-y-2">
              <p><strong>Business:</strong> {formData.businessType}</p>
              <p><strong>Products:</strong> {formData.products}</p>
              <p><strong>Customers:</strong> {formData.customers}</p>
              <p><strong>Budget:</strong> ₹{formData.budget.toLocaleString()}/month</p>
              <p><strong>Time:</strong> {formData.time} hours/week</p>
              <p><strong>Goal:</strong> {formData.goal}</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-6">
                <Loader className="animate-spin text-teal-600" size={32} />
                <p className="text-lg">AI is analyzing your constraints...</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  ← Edit
                </button>
                <button
                  onClick={handleGetRecommendations}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Get AI Recommendations
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show social media posts
  if (showPosts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            AI-Generated Social Media Posts
          </h2>
          <div className="space-y-4 mb-6">
            {posts?.map((post, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-lg mb-3 whitespace-pre-line">{post.post}</p>
                <p className="text-sm text-gray-600 mb-4">{post.hashtags}</p>
                <button
                  onClick={() => copyToClipboard(`${post.post}\n\n${post.hashtags}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copy Post
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowPosts(false)}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
          >
            ← Back to Recommendations
          </button>
        </div>
      </div>
    )
  }

  // Show recommendations
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Your AI-Powered Growth Plan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-blue-500" />
              Time Required
            </h3>
            <p className="text-2xl font-bold text-blue-600">
  {recommendations?.reduce((sum, r) => {
    const match = r.timeNeeded.match(/(\d+\.?\d*)\s*hours?/i)
    const time = match ? parseFloat(match[1]) : 0
    return sum + time
  }, 0).toFixed(1)} hours/week
</p>

          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-500" />
              Total Cost
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{recommendations?.reduce((sum, r) => {
                const cost = parseInt(r.cost.replace(/[^0-9]/g, '')) || 0
                return sum + cost
              }, 0).toLocaleString()}/month
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {recommendations?.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{rec.action}</h3>
                  <p className="text-sm text-gray-600">Using: <strong>{rec.tool}</strong></p>
                </div>
                <span className="text-2xl">{rec.automationLevel}</span>
              </div>

              <p className="text-gray-700 mb-4">{rec.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Time/Week</p>
                  <p className="font-semibold text-blue-600">{rec.timeNeeded}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Cost/Month</p>
                  <p className="font-semibold text-green-600">{rec.cost}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Impact</p>
                  <p className="font-semibold text-purple-600 text-xs">
                    {rec.whyItMatters.split(' ').slice(0, 3).join(' ')}...
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                <strong>Why:</strong> {rec.whyItMatters}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleGeneratePosts}
            disabled={loading}
            className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            {loading ? 'Generating...' : 'Generate Sample Social Media Posts'}
          </button>

          <button
            onClick={() => {
              setStep(-1)
              setRecommendations(null)
              setPosts(null)
            }}
            className="px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  )
}
