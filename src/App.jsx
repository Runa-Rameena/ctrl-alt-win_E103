import { useState } from 'react'
import { Zap } from 'lucide-react'
import AIAssistant from './components/AIAssistant'
import CampaignList from './components/campaigns/CampaignList'
import CampaignDetail from './components/campaigns/CampaignDetail'
import CreateCampaign from './components/campaigns/CreateCampaign'
import './index.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)

  function handleSelectCampaign(id) {
    setSelectedCampaignId(id)
    setCurrentPage('campaign-detail')
  }

  function handleCreateSuccess(id) {
    setSelectedCampaignId(id)
    setCurrentPage('campaign-detail')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <Zap className="text-teal-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">AI Business Hub</h1>
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`font-semibold transition ${
                currentPage === 'home' ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('assistant')}
              className={`font-semibold transition ${
                currentPage === 'assistant' ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              AI Assistant
            </button>
            <button
              onClick={() => setCurrentPage('campaigns')}
              className={`font-semibold transition ${
                currentPage === 'campaigns' || currentPage === 'campaign-detail' || currentPage === 'create-campaign'
                  ? 'text-teal-600'
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Fundraising
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentPage === 'home' && (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Grow Your Business with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get personalized growth strategies and community support based on your real constraints
            </p>

            <div className="flex gap-4 justify-center mb-16">
              <button
                onClick={() => setCurrentPage('assistant')}
                className="px-8 py-4 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700"
              >
                🤖 Get AI Recommendations
              </button>
              <button
                onClick={() => setCurrentPage('campaigns')}
                className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700"
              >
                💰 Browse Campaigns
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-bold text-lg mb-2">Constraint-Aware AI</h3>
                <p className="text-gray-600">
                  Recommendations based on your actual budget and time
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-bold text-lg mb-2">Smart Automation</h3>
                <p className="text-gray-600">
                  Know what's automated, AI-assisted, or manual
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-4xl mb-4">💸</div>
                <h3 className="font-bold text-lg mb-2">Community Funding</h3>
                <p className="text-gray-600">
                  Get money, skills, and partnerships from supporters
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                <div>
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold text-teal-600">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Share Constraints</h4>
                  <p className="text-sm text-gray-600">
                    Tell us your budget, time, and goals
                  </p>
                </div>
                <div>
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold text-teal-600">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">AI Analyzes</h4>
                  <p className="text-sm text-gray-600">
                    Get personalized recommendations
                  </p>
                </div>
                <div>
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold text-teal-600">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Launch Campaign</h4>
                  <p className="text-sm text-gray-600">
                    Need more? Get community support
                  </p>
                </div>
                <div>
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold text-teal-600">
                    4
                  </div>
                  <h4 className="font-semibold mb-2">Start Growing</h4>
                  <p className="text-sm text-gray-600">
                    Execute with funding and skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'assistant' && <AIAssistant />}

      {currentPage === 'campaigns' && (
        <CampaignList
          onSelectCampaign={handleSelectCampaign}
          onCreateNew={() => setCurrentPage('create-campaign')}
        />
      )}

      {currentPage === 'campaign-detail' && (
        <CampaignDetail
          campaignId={selectedCampaignId}
          onBack={() => setCurrentPage('campaigns')}
        />
      )}

      {currentPage === 'create-campaign' && (
        <CreateCampaign
          onBack={() => setCurrentPage('campaigns')}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}
