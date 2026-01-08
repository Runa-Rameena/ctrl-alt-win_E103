import { TrendingUp, Calendar, Target, Plus } from 'lucide-react'

export default function CampaignList({ campaigns, onSelectCampaign, onCreateNew, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading campaigns...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {onCreateNew ? 'My Campaigns' : 'Browse Campaigns'}
          </h1>
          <p className="text-gray-600">
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition"
          >
            <Plus size={20} />
            Create Campaign
          </button>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <TrendingUp className="mx-auto mb-4 text-gray-300" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {onCreateNew ? 'No campaigns yet' : 'No active campaigns'}
          </h2>
          <p className="text-gray-600 mb-6">
            {onCreateNew 
              ? 'Create your first campaign to start fundraising' 
              : 'Check back later for new opportunities'}
          </p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
            >
              Create Your First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => {
            const raised = Number(campaign.raised) || 0
            const goal = Number(campaign.goal) || 100000 // Default goal if not set
            const progress = Math.min((raised / goal) * 100, 100)
            
            // Calculate days left
            let daysLeft = 0
            if (campaign.deadline) {
              const deadline = new Date(campaign.deadline)
              const today = new Date()
              const diffTime = deadline - today
              daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
            }

            return (
              <div
                key={campaign.id}
                onClick={() => onSelectCampaign(campaign.id)}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                {/* Campaign Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.status === 'funded'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status === 'active' ? '🟢 Active' : campaign.status}
                    </span>
                    
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                      {campaign.category || 'General'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-purple-600">
                        ₹{raised.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        of ₹{goal.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{progress.toFixed(1)}% funded</span>
                      <span>{campaign.backers || 0} backers</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Calendar className="mx-auto mb-1 text-gray-600" size={16} />
                      <p className="text-xs text-gray-600">Days Left</p>
                      <p className="text-lg font-bold text-gray-800">
                        {campaign.deadline ? daysLeft : 'No deadline'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Target className="mx-auto mb-1 text-gray-600" size={16} />
                      <p className="text-xs text-gray-600">Goal</p>
                      <p className="text-lg font-bold text-gray-800">
                        ₹{(goal / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {campaign.vendorName?.charAt(0) || campaign.businessName?.charAt(0) || 'V'}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {campaign.vendorName || campaign.businessName || 'Vendor'}
                      </span>
                    </div>
                    
                    <button className="text-purple-600 font-semibold text-sm hover:text-purple-700">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
