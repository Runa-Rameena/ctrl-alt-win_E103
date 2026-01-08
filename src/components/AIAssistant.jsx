import React, { useState } from 'react';
import { Sparkles, Send, Loader, TrendingUp, DollarSign, Clock, Zap, Copy } from 'lucide-react';
import PostScheduler from './PostScheduler';
import { getAIRecommendations, generateSocialMediaPosts } from '../services/gemini';

export default function AIAssistant() {
  const [formData, setFormData] = useState({
    businessType: '',
    currentRevenue: '',
    monthlyBudget: '',
    timeAvailable: '',
    goals: '',
    currentChallenges: ''
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [socialMediaPosts, setSocialMediaPosts] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.businessType || !formData.goals) {
      alert('Please fill in at least Business Type and Goals');
      return;
    }

    setLoading(true);
    
    try {
      const aiRecommendations = await getAIRecommendations(formData);
      setRecommendations(aiRecommendations);
      
      const posts = await generateSocialMediaPosts(formData, aiRecommendations);
      setSocialMediaPosts(posts);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Business Assistant</h1>
          </div>
          <p className="text-lg text-gray-600">
            Get personalized growth strategies based on your real constraints
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 mb-8">
          
          {/* Business Type */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Business Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              placeholder="e.g., Handmade jewelry, Food cart, Boutique"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Current Revenue */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Current Monthly Revenue
            </label>
            <input
              type="text"
              name="currentRevenue"
              value={formData.currentRevenue}
              onChange={handleChange}
              placeholder="e.g., ₹50,000 or Just starting"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Monthly Budget */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Monthly Marketing Budget
            </label>
            <input
              type="text"
              name="monthlyBudget"
              value={formData.monthlyBudget}
              onChange={handleChange}
              placeholder="e.g., ₹5,000 or ₹0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Time Available */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Time Available per Week
            </label>
            <input
              type="text"
              name="timeAvailable"
              value={formData.timeAvailable}
              onChange={handleChange}
              placeholder="e.g., 5 hours or 2 hours"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Goals */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Your Goals <span className="text-red-500">*</span>
            </label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="e.g., Increase sales by 50%, Reach 1000 Instagram followers, Launch online store"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              rows="3"
              required
            />
          </div>

          {/* Current Challenges */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Current Challenges
            </label>
            <textarea
              name="currentChallenges"
              value={formData.currentChallenges}
              onChange={handleChange}
              placeholder="e.g., No time for marketing, Don't know how to use social media, Limited budget"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              rows="3"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Getting AI Recommendations...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Get AI Recommendations
              </>
            )}
          </button>
        </form>

        {/* AI Recommendations */}
        {recommendations && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles className="text-purple-600" />
              Your Personalized Growth Strategies
            </h2>

            {/* Key Insight */}
            {recommendations.keyInsight && (
              <div className="bg-purple-100 border-l-4 border-purple-600 p-4 mb-6">
                <p className="text-purple-900 font-semibold">💡 Key Insight:</p>
                <p className="text-purple-800">{recommendations.keyInsight}</p>
              </div>
            )}

            {/* Strategies */}
            <div className="space-y-6">
              {recommendations.strategies?.map((strategy, index) => (
                <div key={index} className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {index + 1}. {strategy.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{strategy.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Cost</p>
                        <p className="text-sm font-semibold text-gray-800">{strategy.cost}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Time Required</p>
                        <p className="text-sm font-semibold text-gray-800">{strategy.timeRequired}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500">Automation</p>
                        <p className="text-sm font-semibold text-gray-800">{strategy.automationLevel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Action Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {strategy.steps?.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-gray-700 text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Posts */}
        {socialMediaPosts.length > 0 && (
  <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">
      📱 Social Media Content & Scheduling
    </h2>
    <PostScheduler posts={socialMediaPosts} />
  </div>
)}
        {/* Social Media Posts */}
        {socialMediaPosts.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📱 Social Media Content & Scheduling
            </h2>
            <PostScheduler posts={socialMediaPosts} />
          </div>
        )}

      </div>
    </div>
  );
}
