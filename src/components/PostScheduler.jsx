import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Trash2, Check } from 'lucide-react';

export default function PostScheduler({ posts }) {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    // Load scheduled posts from localStorage
    const saved = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
    setScheduledPosts(saved);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationEnabled(permission === 'granted');
      });
    } else {
      setNotificationEnabled(Notification.permission === 'granted');
    }

    // Check for due notifications every minute
    const interval = setInterval(checkScheduledPosts, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkScheduledPosts = () => {
    const now = new Date();
    const saved = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
    
    saved.forEach(post => {
      const postTime = new Date(post.scheduledTime);
      const timeDiff = postTime - now;
      
      // Notify 5 minutes before
      if (timeDiff > 0 && timeDiff < 300000 && !post.notified) {
        if (notificationEnabled) {
          new Notification('Social Media Post Reminder', {
            body: `Your scheduled post is due in 5 minutes: "${post.content.substring(0, 50)}..."`,
            icon: '/favicon.ico'
          });
        }
        post.notified = true;
      }
    });
    
    localStorage.setItem('scheduledPosts', JSON.stringify(saved));
    setScheduledPosts(saved);
  };

  const handleSchedule = () => {
    if (!selectedPost || !scheduleDate || !scheduleTime) {
      alert('Please select a post, date, and time');
      return;
    }

    const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`);
    
    if (scheduledTime <= new Date()) {
      alert('Please select a future date and time');
      return;
    }

    const newScheduledPost = {
      id: Date.now(),
      content: selectedPost.post,
      hashtags: selectedPost.hashtags,
      scheduledTime: scheduledTime.toISOString(),
      notified: false,
      completed: false
    };

    const updated = [...scheduledPosts, newScheduledPost];
    setScheduledPosts(updated);
    localStorage.setItem('scheduledPosts', JSON.stringify(updated));

    alert('Post scheduled successfully!');
    setSelectedPost(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  const deleteScheduledPost = (id) => {
    const updated = scheduledPosts.filter(p => p.id !== id);
    setScheduledPosts(updated);
    localStorage.setItem('scheduledPosts', JSON.stringify(updated));
  };

  const markAsCompleted = (id) => {
    const updated = scheduledPosts.map(p => 
      p.id === id ? { ...p, completed: true } : p
    );
    setScheduledPosts(updated);
    localStorage.setItem('scheduledPosts', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      
      {/* Notification Status */}
      <div className={`p-4 rounded-lg ${notificationEnabled ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'} border-2`}>
        <div className="flex items-center gap-2">
          <Bell className={notificationEnabled ? 'text-green-600' : 'text-yellow-600'} />
          <p className={notificationEnabled ? 'text-green-800' : 'text-yellow-800'}>
            {notificationEnabled 
              ? '✅ Notifications enabled - You\'ll get reminders!' 
              : '⚠️ Enable notifications to get reminders'}
          </p>
        </div>
      </div>

      {/* Schedule New Post */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="text-purple-600" />
          Schedule a Post
        </h3>

        {/* Select Post */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Select Post</label>
          <select
            value={selectedPost ? posts.indexOf(selectedPost) : ''}
            onChange={(e) => setSelectedPost(posts[e.target.value])}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          >
            <option value="">Choose a post...</option>
            {posts.map((post, index) => (
              <option key={index} value={index}>
                {post.post.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Time</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Preview */}
        {selectedPost && (
          <div className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-300">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <p className="text-gray-800 mb-2">{selectedPost.post}</p>
            <p className="text-purple-600 text-sm">{selectedPost.hashtags}</p>
          </div>
        )}

        <button
          onClick={handleSchedule}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Schedule Post
        </button>
      </div>

      {/* Scheduled Posts List */}
      {scheduledPosts.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" />
            Scheduled Posts ({scheduledPosts.length})
          </h3>

          <div className="space-y-3">
            {scheduledPosts
              .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
              .map(post => {
                const postTime = new Date(post.scheduledTime);
                const isPast = postTime < new Date();
                
                return (
                  <div
                    key={post.id}
                    className={`p-4 rounded-lg border-2 ${
                      post.completed 
                        ? 'bg-green-50 border-green-300' 
                        : isPast 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-blue-50 border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          📅 {postTime.toLocaleDateString()} at {postTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-gray-700 text-sm mb-1">{post.content}</p>
                        <p className="text-purple-600 text-xs">{post.hashtags}</p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {!post.completed && (
                          <button
                            onClick={() => markAsCompleted(post.id)}
                            className="text-green-600 hover:text-green-800 p-2"
                            title="Mark as completed"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteScheduledPost(post.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {post.completed && (
                      <span className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                        ✅ Posted
                      </span>
                    )}
                    {isPast && !post.completed && (
                      <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded">
                        ⚠️ Overdue
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {scheduledPosts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No scheduled posts yet. Schedule your first post above!</p>
        </div>
      )}

    </div>
  );
}
