import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { TrendingUp, DollarSign, Users, LogOut, MessageCircle, Calendar, Plus } from 'lucide-react'
import CreateCampaign from './campaigns/CreateCampaign'
import CampaignList from './campaigns/CampaignList'
import CampaignDetail from './campaigns/CampaignDetail'
import Messages from './Messages'
import AIMarketingAssistant from './AIMarketingAssistant'

export default function VendorDashboard() {
  const { logout, userProfile, currentUser } = useAuth()
  const [activeView, setActiveView] = useState('home')
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalBackers: 0
  })

  useEffect(() => {
    loadCampaigns()
  }, [currentUser])

  async function loadCampaigns() {
    setLoading(true)
    try {
      const campaignsRef = collection(db, 'campaigns')
      const q = query(campaignsRef, where('vendorId', '==', currentUser.uid))
      const snapshot = await getDocs(q)
      
      const campaignsList = []
      let totalRaised = 0
      let totalBackers = 0
      let activeCampaigns = 0

      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() }
        campaignsList.push(data)
        totalRaised += Number(data.raised) || 0
        totalBackers += Number(data.backers) || 0
        if (data.status === 'active') activeCampaigns++
      })

      console.log('Loaded campaigns:', campaignsList.length)
      setCampaigns(campaignsList)
      setStats({
        totalCampaigns: campaignsList.length,
        activeCampaigns: activeCampaigns,
        totalRaised: totalRaised,
        totalBackers: totalBackers
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setLoading(false)
    }
  }

  function handleCreateCampaign() {
    setShowCreateCampaign(true)
    setActiveView('home')
  }

  function handleCampaignCreated() {
    setShowCreateCampaign(false)
    loadCampaigns()
  }

  function handleSelectCampaign(id) {
    setSelectedCampaignId(id)
    setActiveView('campaignDetail')
  }

  function handleBackFromCampaign() {
    setSelectedCampaignId(null)
    setActiveView('campaigns')
    loadCampaigns()
  }

  function handleLogout() {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen p-6 fixed">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-purple-600">AI Business Hub</h2>
            <p className="text-sm text-gray-600 mt-1">{userProfile?.name || 'Vendor'}</p>
            <p className="text-xs text-gray-500">{userProfile?.email}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => {
                setActiveView('home')
                setSelectedCampaignId(null)
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold w-full ${
                activeView === 'home' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'hover:bg-purple-50 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>

            <button
              onClick={() => {
                setActiveView('campaigns')
                setSelectedCampaignId(null)
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold w-full ${
                activeView === 'campaigns' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'hover:bg-purple-50 text-gray-700'
              }`}
            >
              <TrendingUp size={20} />
              My Campaigns
            </button>

            <button
              onClick={() => {
                setActiveView('messages')
                setSelectedCampaignId(null)
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold w-full ${
                activeView === 'messages' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'hover:bg-purple-50 text-gray-700'
              }`}
            >
              <MessageCircle size={20} />
              Messages
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-3 rounded-lg hover:bg-red-50 text-red-600 transition font-semibold w-full mt-8"
            >
              <LogOut size={20} />
              Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Home View */}
          {activeView === 'home' && (
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Welcome back, {userProfile?.name?.split(' ')[0] || 'Vendor'}! 👋
                </h1>
                <p className="text-gray-600">Manage your fundraising campaigns and connect with investors</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-purple-600" size={32} />
                    <span className="text-3xl font-bold text-purple-600">{stats.totalCampaigns}</span>
                  </div>
                  <p className="text-gray-600 font-semibold">Total Campaigns</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="text-green-600" size={32} />
                    <span className="text-3xl font-bold text-green-600">₹{stats.totalRaised}</span>
                  </div>
                  <p className="text-gray-600 font-semibold">Total Raised</p>
                  <p className="text-xs text-gray-500 mt-1">Across all campaigns</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="text-blue-600" size={32} />
                    <span className="text-3xl font-bold text-blue-600">{stats.totalBackers}</span>
                  </div>
                  <p className="text-gray-600 font-semibold">Total Backers</p>
                  <p className="text-xs text-gray-500 mt-1">Investors supporting you</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="text-orange-600" size={32} />
                    <span className="text-3xl font-bold text-orange-600">{stats.activeCampaigns}</span>
                  </div>
                  <p className="text-gray-600 font-semibold">Active Campaigns</p>
                  <p className="text-xs text-gray-500 mt-1">Currently running</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <button
                    onClick={handleCreateCampaign}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 hover:shadow-xl transition transform hover:scale-105"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <Plus size={24} />
                      </div>
                      <h3 className="font-bold text-lg">Create Campaign</h3>
                    </div>
                    <p className="text-sm text-purple-100">Start fundraising</p>
                  </button>

                  <button
                    onClick={() => setActiveView('campaigns')}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-6 hover:shadow-xl transition transform hover:scale-105"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <TrendingUp size={24} />
                      </div>
                      <h3 className="font-bold text-lg">View Campaigns</h3>
                    </div>
                    <p className="text-sm text-green-100">Manage your projects</p>
                  </button>

                  <button
                    onClick={() => setActiveView('messages')}
                    className="bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg p-6 hover:shadow-xl transition transform hover:scale-105"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <MessageCircle size={24} />
                      </div>
                      <h3 className="font-bold text-lg">Messages</h3>
                    </div>
                    <p className="text-sm text-pink-100">Connect with investors</p>
                  </button>

                  <button
                    onClick={() => setShowAIAssistant(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 hover:shadow-xl transition transform hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold animate-pulse">
                        NEW ✨
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg">AI Marketing</h3>
                    </div>
                    <p className="text-sm text-indigo-100">Get AI recommendations</p>
                  </button>
                </div>
              </div>

              {/* Recent Campaigns */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Recent Campaigns</h2>
                  <button
                    onClick={() => setActiveView('campaigns')}
                    className="text-purple-600 font-semibold hover:underline text-sm"
                  >
                    View All →
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading campaigns...</p>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No campaigns yet</h3>
                    <p className="text-gray-600 mb-6">Create your first campaign to start fundraising</p>
                    <button
                      onClick={handleCreateCampaign}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                    >
                      Create Campaign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.slice(0, 3).map(campaign => {
                      const raised = Number(campaign.raised) || 0
                      const goal = Number(campaign.goal) || 100000
                      const progress = Math.min((raised / goal) * 100, 100)

                      return (
                        <div
                          key={campaign.id}
                          onClick={() => handleSelectCampaign(campaign.id)}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-lg cursor-pointer transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800">{campaign.title}</h3>
                              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {campaign.status}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">of ₹{goal.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-purple-600">₹{raised.toLocaleString()}</span>
                              <span className="text-gray-600">{progress.toFixed(1)}% funded</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{campaign.backers || 0} backers</span>
                            <span className="text-purple-600 font-semibold">View Details →</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campaigns View */}
          {activeView === 'campaigns' && !selectedCampaignId && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Campaigns</h1>
                <button
                  onClick={handleCreateCampaign}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create New Campaign
                </button>
              </div>

              <CampaignList
                campaigns={campaigns}
                loading={loading}
                onSelectCampaign={handleSelectCampaign}
                isVendor={true}
              />
            </div>
          )}

          {/* Campaign Detail View */}
          {activeView === 'campaignDetail' && selectedCampaignId && (
            <CampaignDetail
              campaignId={selectedCampaignId}
              onBack={handleBackFromCampaign}
            />
          )}

          {/* Messages View */}
          {activeView === 'messages' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
              <Messages />
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <CreateCampaign
          onClose={() => setShowCreateCampaign(false)}
          onCampaignCreated={handleCampaignCreated}
        />
      )}

      {/* AI Marketing Assistant Modal */}
      {showAIAssistant && (
        <AIMarketingAssistant onClose={() => setShowAIAssistant(false)} />
      )}
    </div>
  )
}
