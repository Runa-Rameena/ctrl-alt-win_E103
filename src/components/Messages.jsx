import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase/config'
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from 'firebase/firestore'
import { MessageCircle, Send, User, TrendingUp, Sparkles, ArrowLeft, Inbox, Send as SendIcon } from 'lucide-react'

export default function Messages() {
  const { currentUser, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('directory')
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])

  const isVendor = userProfile?.role === 'vendor'
  const isInvestor = userProfile?.role === 'investor'

  useEffect(() => {
    loadUsers()
    loadConversations()
    if (isVendor) {
      generateRecommendations()
    }
  }, [userProfile])

  useEffect(() => {
    if (selectedUser) {
      loadMessages()
    }
  }, [selectedUser])

  async function loadUsers() {
    try {
      const usersRef = collection(db, 'users')
      const targetRole = isVendor ? 'investor' : 'vendor'
      const q = query(usersRef, where('role', '==', targetRole))
      const snapshot = await getDocs(q)
      
      const usersList = []
      snapshot.forEach(doc => {
        if (doc.id !== currentUser.uid) {
          usersList.push({ id: doc.id, ...doc.data() })
        }
      })
      
      setUsers(usersList)
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setLoading(false)
    }
  }

  async function loadConversations() {
    try {
      const messagesRef = collection(db, 'messages')
      const q1 = query(messagesRef, where('senderId', '==', currentUser.uid))
      const q2 = query(messagesRef, where('receiverId', '==', currentUser.uid))
      
      const [sent, received] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ])
      
      const conversationMap = new Map()
      
      sent.forEach(doc => {
        const data = doc.data()
        if (!conversationMap.has(data.receiverId)) {
          conversationMap.set(data.receiverId, {
            userId: data.receiverId,
            userName: data.receiverName,
            lastMessage: data.text,
            timestamp: data.timestamp,
            unread: 0
          })
        }
      })
      
      received.forEach(doc => {
        const data = doc.data()
        conversationMap.set(data.senderId, {
          userId: data.senderId,
          userName: data.senderName,
          lastMessage: data.text,
          timestamp: data.timestamp,
          unread: (conversationMap.get(data.senderId)?.unread || 0) + 1
        })
      })
      
      const convList = Array.from(conversationMap.values())
      convList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setConversations(convList)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  function loadMessages() {
    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = []
      snapshot.forEach(doc => {
        const data = doc.data()
        if (
          (data.senderId === currentUser.uid && data.receiverId === selectedUser.id) ||
          (data.senderId === selectedUser.id && data.receiverId === currentUser.uid)
        ) {
          msgs.push({ id: doc.id, ...data })
        }
      })
      setMessages(msgs)
    })
    
    return unsubscribe
  }

  async function generateRecommendations() {
    try {
      const investorsRef = collection(db, 'users')
      const q = query(investorsRef, where('role', '==', 'investor'))
      const snapshot = await getDocs(q)
      
      const investors = []
      snapshot.forEach(doc => {
        investors.push({ id: doc.id, ...doc.data() })
      })
      
      // AI-based recommendation logic
      const scored = investors.map(investor => {
        let score = 0
        
        // Match industry
        if (investor.industries?.some(ind => userProfile.industry?.includes(ind))) {
          score += 40
        }
        
        // Match investment range
        if (investor.investmentRange && userProfile.fundingNeeded) {
          const range = investor.investmentRange.split('-')
          const needed = parseInt(userProfile.fundingNeeded)
          const min = parseInt(range[0])
          const max = parseInt(range[1])
          if (needed >= min && needed <= max) {
            score += 30
          }
        }
        
        // Active investors get higher score
        if (investor.lastActive) {
          const daysSinceActive = (Date.now() - new Date(investor.lastActive)) / (1000 * 60 * 60 * 24)
          if (daysSinceActive < 7) score += 20
        }
        
        // Random factor for diversity
        score += Math.random() * 10
        
        return { ...investor, matchScore: Math.round(score) }
      })
      
      scored.sort((a, b) => b.matchScore - a.matchScore)
      setRecommendations(scored.slice(0, 5))
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
  }

  async function sendMessage() {
    if (!messageText.trim() || !selectedUser) return
    
    setSending(true)
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        senderName: userProfile?.name || 'User',
        receiverId: selectedUser.id,
        receiverName: selectedUser.name,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false
      })
      
      setMessageText('')
      await loadConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  function startChat(user) {
    setSelectedUser(user)
    setActiveTab('chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={40} className="text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Messages</h1>
          </div>
          <p className="text-gray-600">
            {isVendor ? 'Connect with investors for your business' : 'Discover promising ventures to invest in'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'directory'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            👥 {isVendor ? 'Find Investors' : 'Browse Vendors'}
          </button>
          
          {isVendor && (
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === 'recommendations'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={20} />
              AI Recommendations
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'inbox'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Inbox size={20} />
            Inbox ({conversations.length})
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SendIcon size={20} />
            Sent
          </button>
        </div>

        {/* Directory Tab */}
        {activeTab === 'directory' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isVendor ? 'Available Investors' : 'Active Vendors'}
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto mb-4 text-gray-300" size={64} />
                <p className="text-gray-600">No {isVendor ? 'investors' : 'vendors'} found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    {user.businessName && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Business:</strong> {user.businessName}
                      </p>
                    )}
                    
                    {user.industry && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Industry:</strong> {user.industry}
                      </p>
                    )}
                    
                    {user.investmentRange && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Investment Range:</strong> ₹{user.investmentRange}
                      </p>
                    )}
                    
                    <button
                      onClick={() => startChat(user)}
                      className="w-full mt-3 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Start Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Recommendations Tab */}
        {activeTab === 'recommendations' && isVendor && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-purple-600" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">AI-Powered Recommendations</h2>
                <p className="text-gray-600">Investors matched to your business profile</p>
              </div>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Generating recommendations...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((investor, index) => (
                  <div key={investor.id} className="bg-white rounded-lg p-6 border-2 border-purple-200 hover:shadow-xl transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                          {investor.name?.charAt(0) || 'I'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xl text-gray-800">{investor.name}</h3>
                            {index === 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                🏆 Top Match
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{investor.email}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{investor.matchScore}%</div>
                        <p className="text-xs text-gray-600">Match Score</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {investor.industries && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Industries:</p>
                          <p className="text-sm text-gray-600">{investor.industries.join(', ')}</p>
                        </div>
                      )}
                      
                      {investor.investmentRange && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Investment Range:</p>
                          <p className="text-sm text-gray-600">₹{investor.investmentRange}</p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => startChat(investor)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Connect with {investor.name?.split(' ')[0]}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Inbox</h2>
            
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="mx-auto mb-4 text-gray-300" size={64} />
                <p className="text-gray-600">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-2">Start chatting from the directory</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map(conv => (
                  <div
                    key={conv.userId}
                    onClick={() => {
                      const user = users.find(u => u.id === conv.userId)
                      if (user) startChat(user)
                    }}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                          {conv.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{conv.userName}</h3>
                          <p className="text-sm text-gray-600 truncate max-w-md">{conv.lastMessage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(conv.timestamp).toLocaleDateString()}
                        </p>
                        {conv.unread > 0 && (
                          <span className="inline-block px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold mt-1">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent Tab */}
        {activeTab === 'sent' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sent Messages</h2>
            
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <SendIcon className="mx-auto mb-4 text-gray-300" size={64} />
                <p className="text-gray-600">No sent messages</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map(conv => (
                  <div
                    key={conv.userId}
                    onClick={() => {
                      const user = users.find(u => u.id === conv.userId)
                      if (user) startChat(user)
                    }}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:bg-green-50 hover:border-green-300 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                        {conv.userName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800">{conv.userName}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(conv.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Interface */}
        {activeTab === 'chat' && selectedUser && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className="hover:bg-white/20 p-2 rounded-lg transition"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedUser.name}</h3>
                    <p className="text-sm opacity-90">{selectedUser.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto mb-4 text-gray-300" size={64} />
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          msg.senderId === currentUser.uid
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border-2 border-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === currentUser.uid ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t-2 border-gray-200 p-4 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !messageText.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={20} />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
