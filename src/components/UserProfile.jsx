import { useAuth } from '../contexts/AuthContext'
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth'
import { ArrowLeft } from 'lucide-react'

export default function UserProfile({ onBack }) {
  const { currentUser, userProfile } = useAuth()

  async function handleLogout() {
    try {
      await signOut(auth)
      localStorage.removeItem('user')
      alert('✅ Logged out successfully!')
      window.location.reload() // Refresh to go to homepage
    } catch (error) {
      console.error('Logout error:', error)
      alert('❌ Error logging out. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {userProfile?.name || 'User'}
              </h1>
              <p className="text-gray-600 mt-1">{currentUser?.email}</p>
              <span className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${
                userProfile?.role === 'vendor' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-teal-100 text-teal-800'
              }`}>
                {userProfile?.role === 'vendor' ? 'Vendor' : 'Supporter'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition cursor-pointer shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-red-50 rounded-lg p-6 border border-red-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">❤️</span>
                <h3 className="font-semibold text-gray-700">Total Supported</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">₹0</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👥</span>
                <h3 className="font-semibold text-gray-700">Contributions</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account Details</h2>
            <div className="space-y-3 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="font-semibold text-gray-800">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Account Type:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {userProfile?.role || 'User'}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">User ID:</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {currentUser?.uid?.substring(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600 font-medium">Member Since:</span>
                <span className="font-semibold text-gray-800">
                  {userProfile?.joinDate 
                    ? new Date(userProfile.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Profile Tips</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Your profile information is stored securely</li>
              <li>• You can update your role by contacting support</li>
              <li>• Complete your profile to unlock all features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
