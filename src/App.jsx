import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import VendorDashboard from './components/VendorDashboard'
import InvestorDashboard from './components/InvestorDashboard'
import AdminDashboard from './components/AdminDashboard'
import Messages from './components/Messages'

function AppContent() {
  const { currentUser, userProfile, logout } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (!currentUser) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Route based on user role
  if (userProfile.role === 'admin') {
    return <AdminDashboard onBack={logout} />
  }

  if (userProfile.role === 'vendor') {
    return <VendorDashboard />
  }

  if (userProfile.role === 'investor') {
    return <InvestorDashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid User Role</h2>
        <button
          onClick={logout}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
