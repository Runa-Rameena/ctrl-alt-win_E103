import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { TrendingUp, DollarSign, Users, LogOut, MessageCircle, Home, Heart } from 'lucide-react'
import CampaignList from './campaigns/CampaignList'
import CampaignDetail from './campaigns/CampaignDetail'
import Messages from './Messages'

export default function InvestorDashboard() {
  const { logout, userProfile, currentUser } = useAuth()
  const [activeView, setActiveView] = useState('home')
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myDonations, setMyDonations] = useState([])
  const [stats, setStats] = useState({
    totalInvested: 0,
    campaignsSupported: 0,
    totalCampaigns: 0
  })

  useEffect(() => {
    loadCampaigns()
    loadMyDonations()
  }, [currentUser])

  async function loadCampaigns() {
    setLoading(true)
    try {
      const campaignsRef = collection(db, 'campaigns')
      const snapshot = await getDocs(campaignsRef)
      
      const campaignsList = []
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() }
        campaignsList.push(data)
      })

      console.log('Loaded campaigns:', campaignsList.length)
      setCampaigns(campaignsList)
      setStats(prev => ({ ...prev, totalCampaigns: campaignsList.length }))
      setLoading(false)
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setLoading(false)
    }
  }

  async function loadMyDonations() {
    try {
      const donationsRef = collection(db, 'donations')
      const q = query(
        donationsRef, 
        where('donorId', '==', currentUser.uid),
        where('status', '==', 'verified')
      )
      const snapshot = await getDocs(q)
      
      const donations = []
      let totalInvested = 0
      const uniqueCampaigns = new Set()

      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() }
        donations.push(data)
        totalInvested += data.amount || 0
        uniqueCampaigns.add(data.campaignId)
      })

      console.log('Loaded donations:', donations.length)
      setMyDonations(donations)
      setStats(prev => ({
        ...prev,
        totalInvested,
        campaignsSupported: uniqueCampaigns.size
      }))
    } catch (error) {
      console.error('Error loading donations:', error)
    }
  }

  function handleSelectCampaign(id) {
    setSelectedCampaignId(id)
    setActiveView('campaignDetail')
  }

  function handleBackFromCampaign() {
    setSelectedCampaignId(null)
    setActiveView('campaigns')
    loadCampaigns()
    loadMyDonations()
  }

  function handleLogout() {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen p-6 fixed">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-600">AI Business Hub</h2>
            <p className="text-sm text-gray-600 mt-1">{userProfile?.name || 'Investor'}</p>
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
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              <Home size={20} />
              Home
            </button>

            <button
              onClick={() => {
                setActiveView('campaigns')
                setSelectedCampaignId(null)
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold w-full ${
                activeView === 'campaigns' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              <TrendingUp size={20} />
              Browse Campaigns
            </button>

            <button
              onClick={() => {
                setActiveView('myInvestments')
                setSelectedCampaignId(null)
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold w-full ${
                activeView === 'myInvestments' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              <Heart size={20} />
              My Investments
            </button>

            <button
              onClick={() => {
                setActiveView('messages')
                setSelectedCampaignId(null)
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold w-full ${
                activeView === 'messages' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-blue-50 text-gray-700'
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
                  Welcome back, {userProfile?.name?.split(' ')[0] || 'Investor'}! 👋
                </h1>
                <p className="text-gray-600">Discover promising ventures and make impactful investments</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="text-green-600" size={32} />
                    <span className="text-3xl font-bold text-green-600">₹{stats.totalInvested.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600 font-semibold">Total Invested</p>
                  <p className="text-xs text-gray-500 mt-1">Across all campaigns</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="text-red-600" size={32} />
                    <span className="text-3xl font-bold text-red-600">{stats.campaignsSupported}</span>
                  </div>
                  <p className="text-gray-600 font-semibold">Campaigns Supported</p>
                  <p className="text-xs text-gray-500 mt-1">Active investments</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-blue-600" size={32} />
                    <span className="text-3xl font-bold text-blue-600">{stats.totalCampaigns}</span>
                  </div>
                  <p className="text-gray-600 font-semibold">Available Campaigns</p>
                  <p className="text-xs text-gray-500 mt-1">Investment opportunities</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveView('campaigns')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                  >
                    <TrendingUp size={24} />
                    <div className="text-left">
                      <p className="font-bold">Browse Campaigns</p>
                      <p className="text-sm opacity-90">Find opportunities</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView('myInvestments')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:shadow-lg transition"
                  >
                    <Heart size={24} />
                    <div className="text-left">
                      <p className="font-bold">My Investments</p>
                      <p className="text-sm opacity-90">Track your portfolio</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView('messages')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition"
                  >
                    <MessageCircle size={24} />
                    <div className="text-left">
                      <p className="font-bold">Messages</p>
                      <p className="text-sm opacity-90">Connect with vendors</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Featured Campaigns */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Featured Campaigns</h2>
                  <button
                    onClick={() => setActiveView('campaigns')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading campaigns...</p>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="mx-auto mb-4 text-gray-300" size={64} />
                    <p className="text-xl text-gray-600 font-semibold">No campaigns available</p>
                    <p className="text-gray-500 mt-2">Check back later for new opportunities</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.slice(0, 4).map(campaign => {
                      const raised = Number(campaign.raised) || 0
                      const goal = Number(campaign.goal) || 100000
                      const progress = Math.min((raised / goal) * 100, 100)
                      
                      return (
                        <div
                          key={campaign.id}
                          onClick={() => handleSelectCampaign(campaign.id)}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status === 'active' ? '🟢 Active' : campaign.status}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                              {campaign.category || 'General'}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{campaign.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-xs text-gray-600">Raised</p>
                              <p className="text-lg font-bold text-blue-600">
                                ₹{raised.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Goal</p>
                              <p className="text-lg font-bold text-gray-800">
                                ₹{goal.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">{progress.toFixed(1)}% funded</p>
                            <p className="text-xs text-gray-600">{campaign.backers || 0} backers</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Browse Campaigns View */}
          {activeView === 'campaigns' && !selectedCampaignId && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Campaigns</h1>
                <p className="text-gray-600">Discover and support innovative business ventures</p>
              </div>
              <CampaignList
                campaigns={campaigns}
                onSelectCampaign={handleSelectCampaign}
                loading={loading}
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

          {/* My Investments View */}
          {activeView === 'myInvestments' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Investments</h1>
                <p className="text-gray-600">Track your portfolio and donation history</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                {myDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="mx-auto mb-4 text-gray-300" size={64} />
                    <p className="text-xl text-gray-600 font-semibold">No investments yet</p>
                    <p className="text-gray-500 mt-2">Start supporting campaigns to see them here</p>
                    <button
                      onClick={() => setActiveView('campaigns')}
                      className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Browse Campaigns
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myDonations.map(donation => (
                      <div key={donation.id} className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-xl text-gray-800">{donation.campaignTitle}</h3>
                            <p className="text-sm text-gray-600">Vendor: {donation.vendorName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600">₹{donation.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{new Date(donation.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-blue-200">
                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Payment ID</p>
                            <p className="font-mono text-sm text-gray-800">{donation.paymentId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Status</p>
                            <span className="inline-block px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-bold">
                              ✅ Verified
                            </span>
                          </div>
                        </div>

                        {donation.autoVerified && (
                          <div className="pt-3 border-t border-blue-200">
                            <p className="text-xs text-gray-600">
                              🤖 Auto-verified on {new Date(donation.verifiedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages View */}
          {activeView === 'messages' && <Messages />}
        </div>
      </div>
    </div>
  )
}
