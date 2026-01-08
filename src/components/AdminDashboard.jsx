import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase/config'
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { Users, TrendingUp, DollarSign, Settings, LogOut, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react'
import AdminSettings from './AdminSettings'

export default function AdminDashboard() {
  const { logout, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalInvestors: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDonations: 0,
    totalAmount: 0
  })

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    try {
      await Promise.all([
        loadUsers(),
        loadCampaigns(),
        loadDonations()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      
      const usersList = []
      let vendorCount = 0
      let investorCount = 0

      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() }
        usersList.push(data)
        if (data.role === 'vendor') vendorCount++
        if (data.role === 'investor') investorCount++
      })

      setUsers(usersList)
      setStats(prev => ({
        ...prev,
        totalUsers: usersList.length,
        totalVendors: vendorCount,
        totalInvestors: investorCount
      }))
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  async function loadCampaigns() {
    try {
      const campaignsRef = collection(db, 'campaigns')
      const snapshot = await getDocs(campaignsRef)
      
      const campaignsList = []
      let activeCount = 0

      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() }
        campaignsList.push(data)
        if (data.status === 'active') activeCount++
      })

      setCampaigns(campaignsList)
      setStats(prev => ({
        ...prev,
        totalCampaigns: campaignsList.length,
        activeCampaigns: activeCount
      }))
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  async function loadDonations() {
    try {
      const donationsRef = collection(db, 'donations')
      const snapshot = await getDocs(donationsRef)
      
      const donationsList = []
      let totalAmount = 0

      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() }
        donationsList.push(data)
        if (data.status === 'verified') {
          totalAmount += data.amount || 0
        }
      })

      setDonations(donationsList)
      setStats(prev => ({
        ...prev,
        totalDonations: donationsList.length,
        totalAmount: totalAmount
      }))
    } catch (error) {
      console.error('Error loading donations:', error)
    }
  }

  async function handleDeleteUser(userId, userName) {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      return
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      alert('✅ User deleted successfully')
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('❌ Failed to delete user')
    }
  }

  async function handleDeleteCampaign(campaignId, campaignTitle) {
    if (!window.confirm(`Are you sure you want to delete campaign: ${campaignTitle}?`)) {
      return
    }

    try {
      await deleteDoc(doc(db, 'campaigns', campaignId))
      alert('✅ Campaign deleted successfully')
      loadCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('❌ Failed to delete campaign')
    }
  }

  async function handleUpdateCampaignStatus(campaignId, newStatus) {
    try {
      await updateDoc(doc(db, 'campaigns', campaignId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      alert(`✅ Campaign status updated to: ${newStatus}`)
      loadCampaigns()
    } catch (error) {
      console.error('Error updating campaign:', error)
      alert('❌ Failed to update campaign status')
    }
  }

  function handleLogout() {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-600" size={32} />
              <span className="text-3xl font-bold text-blue-600">{stats.totalUsers}</span>
            </div>
            <p className="text-gray-600 font-semibold">Total Users</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalVendors} Vendors, {stats.totalInvestors} Investors
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-600" size={32} />
              <span className="text-3xl font-bold text-purple-600">{stats.totalCampaigns}</span>
            </div>
            <p className="text-gray-600 font-semibold">Total Campaigns</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeCampaigns} Active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-600" size={32} />
              <span className="text-3xl font-bold text-green-600">₹{(stats.totalAmount / 1000).toFixed(0)}K</span>
            </div>
            <p className="text-gray-600 font-semibold">Total Donations</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalDonations} Transactions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-orange-600" size={32} />
              <span className="text-3xl font-bold text-orange-600">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric' })}
              </span>
            </div>
            <p className="text-gray-600 font-semibold">Today</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            👥 Users ({stats.totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'campaigns'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📈 Campaigns ({stats.totalCampaigns})
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'donations'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💰 Donations ({stats.totalDonations})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Platform Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Recent Users</h3>
                  <div className="space-y-2">
                    {users.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          user.role === 'vendor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Campaigns */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Recent Campaigns</h3>
                  <div className="space-y-2">
                    {campaigns.slice(0, 5).map(campaign => (
                      <div key={campaign.id} className="p-2 bg-gray-50 rounded">
                        <p className="font-semibold text-sm">{campaign.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-600">₹{(campaign.raised || 0).toLocaleString()} / ₹{(campaign.goal || 0).toLocaleString()}</p>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.role === 'vendor' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'investor' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Campaign Management</h2>
              <div className="space-y-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{campaign.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Goal</p>
                        <p className="font-bold text-gray-800">₹{(campaign.goal || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Raised</p>
                        <p className="font-bold text-green-600">₹{(campaign.raised || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Backers</p>
                        <p className="font-bold text-blue-600">{campaign.backers || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="font-bold text-purple-600">{campaign.category}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {campaign.status === 'active' && (
                        <button
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                        >
                          Mark Complete
                        </button>
                      )}
                      {campaign.status !== 'active' && (
                        <button
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                          className="px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id, campaign.title)}
                        className="px-4 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Donation Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Donor</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Payment ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donations.map(donation => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {donation.campaignTitle || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{donation.donorName}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">
                          ₹{(donation.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                          {donation.paymentId}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            donation.status === 'verified' ? 'bg-green-100 text-green-800' :
                            donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(donation.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AdminSettings />
          )}
        </div>
      </div>
    </div>
  )
}
