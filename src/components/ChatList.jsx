 
import React, { useState, useEffect } from 'react';
import { MessageCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ChatList({ onSelectChat }) {
  const [conversations, setConversations] = useState([]);
  const { userProfile } = useAuth();

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = () => {
    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    const userEmail = userProfile?.email;
    
    const chatList = Object.keys(allChats).map(chatId => {
      const messages = allChats[chatId];
      if (messages.length === 0) return null;
      
      const lastMessage = messages[messages.length - 1];
      const isUserInvolved = chatId.includes(userEmail?.replace(/[.@]/g, '_'));
      
      if (!isUserInvolved) return null;
      
      const otherPersonEmail = lastMessage.senderId === userEmail 
        ? lastMessage.receiverId 
        : lastMessage.senderId;
      const otherPersonName = lastMessage.senderId === userEmail 
        ? lastMessage.receiverName 
        : lastMessage.senderName;
      
      const unreadCount = messages.filter(m => 
        m.receiverId === userEmail && !m.read
      ).length;
      
      return {
        chatId,
        otherPersonEmail,
        otherPersonName,
        lastMessage: lastMessage.content,
        lastMessageTime: lastMessage.timestamp,
        unreadCount
      };
    }).filter(Boolean);
    
    chatList.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
    
    setConversations(chatList);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <MessageCircle className="w-10 h-10 text-purple-600" />
            Messages
          </h1>
          <p className="text-gray-600">Your conversations with investors</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start chatting with investors from the directory
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map(conv => (
                <div
                  key={conv.chatId}
                  onClick={() => onSelectChat({ 
                    email: conv.otherPersonEmail, 
                    name: conv.otherPersonName 
                  })}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="text-purple-600" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {conv.otherPersonName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
