'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { isAdmin } from '../../../utils/roles';
import { useRouter } from 'next/navigation';
import { Send, Edit2, Trash2, Users, MessageSquare, Calendar, Plus } from 'lucide-react';
import FeatureAnnouncementPanel from '../../../../components/admin/FeatureAnnouncementPanel';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info', // info, warning, success, error
    targetUsers: 'all', // all, specific
    userIds: '',
    expiresAt: ''
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin(user)) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch('/api/admin/announcements', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements);
        } else {
          console.error('Failed to fetch announcements:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [user]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAnnouncement)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create announcement');
      }

      const data = await response.json();
      setAnnouncements(prev => [data.announcement, ...prev]);
      setNewAnnouncement({
        title: '',
        message: '',
        type: 'info',
        targetUsers: 'all',
        userIds: '',
        expiresAt: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create announcement:', error);
      alert(`Failed to create announcement: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async (announcementId) => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/announcements/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ announcementId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send announcement');
      }

      const result = await response.json();

      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === announcementId 
            ? { ...announcement, status: 'sent', sentCount: result.stats.successful }
            : announcement
        )
      );
      
      alert(`Announcement sent successfully to ${result.stats.successful} users`);
    } catch (error) {
      console.error('Failed to send announcement:', error);
      alert(`Failed to send announcement: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/announcements?id=${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete announcement');
      }

      setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert(`Failed to delete announcement: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-50',
      warning: isDark ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-50',
      success: isDark ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-50',
      error: isDark ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-50'
    };
    return colors[type] || colors.info;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-100',
      active: isDark ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-50',
      sent: isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-50'
    };
    return colors[status] || colors.draft;
  };

  if (!user || !isAdmin(user)) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            Access Denied
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              📢 Announcements Management
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create and manage system-wide announcements for users
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
            New Announcement
          </button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  Create New Announcement
                </h2>
              </div>
              
              <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message
                  </label>
                  <textarea
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Type
                    </label>
                    <select
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Target Users
                    </label>
                    <select
                      value={newAnnouncement.targetUsers}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, targetUsers: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="all">All Users</option>
                      <option value="specific">Specific Users</option>
                    </select>
                  </div>
                </div>

                {newAnnouncement.targetUsers === 'specific' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      User IDs (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newAnnouncement.userIds}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, userIds: e.target.value }))}
                      placeholder="user1@example.com, user2@example.com"
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create Announcement'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Feature Announcement Panel */}
        <div className="mb-8">
          <FeatureAnnouncementPanel />
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {announcements.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border`}>
              <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                No announcements yet
              </h3>
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} mb-4`}>
                Create your first announcement to notify users about important updates.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Create Announcement
              </button>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {announcement.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                          {announcement.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                          {announcement.status}
                        </span>
                      </div>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                        {announcement.message}
                      </p>
                      <div className={`flex items-center gap-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {announcement.targetUsers === 'all' ? 'All Users' : 'Specific Users'}
                        </div>
                        {announcement.sentCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Send className="w-4 h-4" />
                            Sent to {announcement.sentCount} users
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {announcement.status === 'draft' && (
                        <button
                          onClick={() => handleSendAnnouncement(announcement.id)}
                          disabled={loading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                            isDark
                              ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700'
                              : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          Send
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        disabled={loading}
                        className={`p-2 rounded-xl transition-colors ${
                          isDark
                            ? 'text-red-400 hover:bg-red-900/30 disabled:text-gray-600'
                            : 'text-red-600 hover:bg-red-50 disabled:text-gray-400'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
