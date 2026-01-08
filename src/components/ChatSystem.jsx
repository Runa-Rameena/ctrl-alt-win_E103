 
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ChatSystem({ selectedInvestor, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { userProfile } = useAuth();
  const messagesEndRef = useRef(null);
  const chatId = `${userProfile?.email}_${selectedInvestor?.email}`.replace(/[.@]/g, '_');

  useEffect(() => {
    // Load messages from localStorage
    loadMessages();
    
    // Poll for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    const chatMessages = allChats[chatId] || [];
    setMessages(chatMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: userProfile?.email,
      senderName: userProfile?.name || 'User',
      receiverId: selectedInvestor?.email,
      receiverName: selectedInvestor?.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Save to localStorage
    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    if (!allChats[chatId]) {
      allChats[chatId] = [];
    }
    allChats[chatId].push(message);
    localStorage.setItem('chats', JSON.stringify(allChats));

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-4xl">{selectedInvestor?.photo || '👤'}</div>
            <div>
              <h3 className="font-bold text-lg">{selectedInvestor?.name}</h3>
              <p className="text-sm text-purple-100">{selectedInvestor?.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isMe = message.senderId === userProfile?.email;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          isMe
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {isMe ? 'You' : message.senderName}
                        </p>
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            isMe ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={20} />
              Send
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
