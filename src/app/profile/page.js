'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Globe, MapPin, Calendar, Trophy, TrendingUp, Activity, Settings, Camera, Edit3, Save, X, Loader2, RefreshCw, Database, Clock, AlertTriangle, CheckCircle, Trash2, Download } from 'lucide-react';
import { useTasks, useProfile, useUpdateProfile } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../utils/db';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfileImage } from '../../hooks/useProfileImage';
import Image from 'next/image';

// Add a utility function for consistent date formatting
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Use a fixed locale and format to ensure consistency
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

// Enhanced Profile Header with image upload
function ProfileHeader({ profile, onEdit }) {
  const { uploadImage, uploading, error: uploadError } = useProfileImage();
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadImage(file);
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  const avatarUrl = profile.avatar || '';

  return (
<div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 ${isDark ? 'text-gray-200' : 'text-white'} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-4 border-white/20">
            {!avatarUrl ? (
              <div className="text-4xl font-bold text-white w-full h-full flex items-center justify-center">
                {profile.name?.charAt(0) || user?.displayName?.charAt(0) || 'A'}
              </div>
            ) : (
                <Image
                  src={avatarUrl}
                  alt={profile.name || 'Profile'}
                  width={128}
                  height={128}
                  className="object-cover"
                  onLoadingComplete={(img) => {
                    img.style.display = 'block';
                  }}
                  unoptimized
                />
            )}
          </div>
          
          <button
            onClick={handleAvatarClick}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <button
              onClick={onEdit}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3 text-white/90">
            <Mail className="w-4 h-4" />
            <span>{profile.email}</span>
            {profile.emailVerified && (
              <span className="bg-green-500/20 text-white px-2 py-0.5 rounded-full text-xs">
                Verified
              </span>
            )}
          </div>
          
          <p className="text-white/80 mb-4 max-w-md">{profile.bio}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(profile.joinDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>{profile.streak || 0} day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{profile.level || 'New'} user</span>
            </div>
          </div>
        </div>
      </div>
      
      {uploadError && (
        <div className="mt-4 bg-red-500/20 text-white px-4 py-2 rounded-lg">
          Failed to upload image: {uploadError}
        </div>
      )}
    </div>
  );
}

// Enhanced Profile Form with Modal
function ProfileForm({ profile, onUpdate, isOpen, onClose }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    bio: profile.bio || '',
    timezone: profile.timezone || 'UTC'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when profile changes
  useEffect(() => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      bio: profile.bio || '',
      timezone: profile.timezone || 'UTC'
    });
  }, [profile]);

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Save to Firebase
      await updateUserProfile(user.uid, {
        name: formData.name,
        displayName: formData.name, // Also update displayName for consistency
        bio: formData.bio,
        timezone: formData.timezone
        // Note: we don't update email here as it requires special handling in Firebase Auth
      });
      
      // Update local store
      onUpdate(formData);
      
      console.log('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to save profile changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
<div className={`rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
<h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
<label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <User className="w-4 h-4 inline mr-1" />
                Name
              </label>
<input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400' : 'border-gray-200 text-gray-900 focus:border-blue-500'}`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                  isDark ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Edit3 className="w-4 h-4 inline mr-1" />
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                  isDark ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500'
                }`}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Globe className="w-4 h-4 inline mr-1" />
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                  isDark ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                }`}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 px-4 border-2 rounded-lg transition-colors ${
                  isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Activity Summary with Charts
function ActivitySummary({ tasks }) {
  const { isDark } = useTheme();
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const stats = tasks.reduce((acc, task) => {
    if (task.completed) acc.completed++;
    else acc.pending++;
    
    if (task.completedAt) {
      const completedDate = new Date(task.completedAt);
      if (completedDate.getMonth() === thisMonth && completedDate.getFullYear() === thisYear) {
        acc.thisMonth++;
      }
    }
    
    // Count by priority
    acc.priority[task.priority] = (acc.priority[task.priority] || 0) + 1;
    
    return acc;
  }, { completed: 0, pending: 0, thisMonth: 0, priority: {} });

  const completionRate = tasks.length ? Math.round((stats.completed / tasks.length) * 100) : 0;

  return (
    <div className={`rounded-2xl shadow-lg p-6 mb-8 ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>Activity Overview</h2>
        <TrendingUp className="w-6 h-6 text-green-500" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className={`text-center p-4 rounded-xl ${
          isDark ? 'bg-blue-900/30' : 'bg-blue-50'
        }`}>
          <div className="text-3xl font-bold text-blue-600 mb-1">{tasks.length}</div>
          <div className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>Total Tasks</div>
        </div>
        
        <div className={`text-center p-4 rounded-xl ${
          isDark ? 'bg-green-900/30' : 'bg-green-50'
        }`}>
          <div className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</div>
          <div className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>Completed</div>
        </div>
        
        <div className={`text-center p-4 rounded-xl ${
          isDark ? 'bg-purple-900/30' : 'bg-purple-50'
        }`}>
          <div className="text-3xl font-bold text-purple-600 mb-1">{completionRate}%</div>
          <div className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>Success Rate</div>
        </div>
        
        <div className={`text-center p-4 rounded-xl ${
          isDark ? 'bg-orange-900/30' : 'bg-orange-50'
        }`}>
          <div className="text-3xl font-bold text-orange-600 mb-1">{stats.thisMonth}</div>
          <div className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>This Month</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className={`flex justify-between text-sm mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <span>Progress</span>
          <span>{completionRate}%</span>
        </div>
        <div className={`w-full rounded-full h-3 ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Recent Activity
function RecentActivity({ tasks }) {
  const { isDark } = useTheme();
  const recentTasks = tasks
    .filter(task => task.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  const getPriorityColor = (priority) => {
    if (isDark) {
      switch (priority) {
        case 'high': return 'bg-red-900/50 text-red-300 border-red-700/50';
        case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
        default: return 'bg-green-900/50 text-green-300 border-green-700/50';
      }
    } else {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-green-100 text-green-800 border-green-200';
      }
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '🏠';
      case 'health': return '🏥';
      default: return '📝';
    }
  };

  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${
      isDark ? 'bg-gray-800/70 border-gray-700/50 hover:bg-gray-800/80' : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Activity</h2>
      
      {recentTasks.length === 0 ? (
        <div className="text-center py-12">
          <Activity className={`w-12 h-12 mx-auto mb-4 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>No recent activity</p>
          <p className={`text-sm ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>All your recent tasks and completions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentTasks.map((task, index) => (
            <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl transition-colors slide-up hover-lift stagger-${index + 1} ${
              isDark ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                  <span className="text-lg">{getCategoryIcon(task.category)}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}>{task.title}</div>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Completed {new Date(task.completedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Category Distribution Chart
function CategoryChart({ tasks }) {
  const { isDark } = useTheme();
  const categories = tasks.reduce((acc, task) => {
    const category = task.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
  const total = Object.values(categories).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`rounded-2xl shadow-lg p-6 mb-8 ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 ${
        isDark ? 'text-gray-100' : 'text-gray-900'
      }`}>Task Categories</h2>
      
      <div className="space-y-4">
        {Object.entries(categories).map(([category, count], index) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={category} className="flex items-center gap-4">
              <div className={`w-16 text-sm font-medium capitalize ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>{category}</div>
              <div className={`flex-1 rounded-full h-3 ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-3 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className={`w-12 text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Enhanced Debug Controls Component
function DebugControls({ tasks, profile, user, isDark }) {
  const [debugLogs, setDebugLogs] = useState([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  // Utility function to add debug logs
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [{ message, type, timestamp }, ...prev.slice(0, 9)]); // Keep last 10 logs
  };

  // Debug function to log current task state
  const logTaskState = () => {
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) < new Date();
      }).length,
      categories: [...new Set(tasks.map(t => t.category))].length
    };
    
    console.log('=== TASK STATE DEBUG ===');
    console.log('Task Statistics:', taskStats);
    console.log('Recent Tasks:', tasks.slice(0, 5));
    console.log('Task IDs:', tasks.map(t => t.id));
    
    addDebugLog(`Task state logged - ${taskStats.total} tasks, ${taskStats.completed} completed`, 'success');
  };

  // Debug function to simulate sync operation
  const performSyncTest = async () => {
    setIsRunningTest(true);
    addDebugLog('Starting sync test...', 'info');
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock sync operations
      const operations = [
        'Checking server connection',
        'Fetching remote changes',
        'Comparing local data',
        'Resolving conflicts',
        'Updating local store'
      ];
      
      for (let op of operations) {
        await new Promise(resolve => setTimeout(resolve, 300));
        addDebugLog(op, 'info');
      }
      
      setLastSyncTime(new Date());
      addDebugLog('Sync test completed successfully', 'success');
      
    } catch (error) {
      addDebugLog(`Sync test failed: ${error.message}`, 'error');
    } finally {
      setIsRunningTest(false);
    }
  };

  // Debug function to clear local caches
  const clearLocalCaches = () => {
    try {
      // Clear localStorage items (be careful not to clear auth tokens)
      const keysToRemove = [];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('cache') || key.includes('temp') || key.includes('debug'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Update cache stats
      setCacheStats({
        itemsCleared: keysToRemove.length,
        clearedAt: new Date(),
        remainingItems: localStorage.length
      });
      
      addDebugLog(`Cleared ${keysToRemove.length} cache items`, 'success');
      console.log('Cleared cache keys:', keysToRemove);
    } catch (error) {
      addDebugLog(`Cache clear failed: ${error.message}`, 'error');
    }
  };

  // Debug function to export debug data
  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      user: {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName
      },
      profile: profile,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        completed: t.completed,
        createdAt: t.createdAt,
        completedAt: t.completedAt
      })),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      performance: {
        memory: performance.memory ? {
          used: Math.round((performance.memory.usedJSHeapSize || 0) / 1024 / 1024),
          total: Math.round((performance.memory.totalJSHeapSize || 0) / 1024 / 1024),
          limit: Math.round((performance.memory.jsHeapSizeLimit || 0) / 1024 / 1024)
        } : null,
        timing: performance.timing ? {
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        } : null
      },
      localStorage: {
        items: localStorage.length,
        size: JSON.stringify(localStorage).length
      }
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addDebugLog('Debug data exported to file', 'success');
  };

  // Get log type styling
  const getLogTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'error':
        return isDark ? 'text-red-400' : 'text-red-600';
      case 'warning':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return isDark ? 'text-blue-400' : 'text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Debug Controls */}
      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={logTaskState}
          className={`flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Database className={`w-4 h-4 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <span className="text-sm">Log Task State</span>
        </button>

        <button 
          onClick={performSyncTest}
          disabled={isRunningTest}
          className={`flex items-center gap-3 p-3 text-left rounded-lg transition-colors disabled:opacity-50 ${
            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${
            isRunningTest ? 'animate-spin' : ''
          } ${
            isDark ? 'text-green-400' : 'text-green-600'
          }`} />
          <span className="text-sm">{isRunningTest ? 'Running Sync Test...' : 'Test Sync Process'}</span>
        </button>

        <button 
          onClick={clearLocalCaches}
          className={`flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Trash2 className={`w-4 h-4 ${
            isDark ? 'text-orange-400' : 'text-orange-600'
          }`} />
          <span className="text-sm">Clear Local Caches</span>
        </button>

        <button 
          onClick={exportDebugData}
          className={`flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Download className={`w-4 h-4 ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`} />
          <span className="text-sm">Export Debug Data</span>
        </button>
      </div>

      {/* Status Information */}
      {(lastSyncTime || cacheStats) && (
        <div className={`p-3 rounded-lg text-xs space-y-2 ${
          isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'
        }`}>
          {lastSyncTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Last sync test: {lastSyncTime.toLocaleTimeString()}</span>
            </div>
          )}
          {cacheStats && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              <span>Cache cleared: {cacheStats.itemsCleared} items at {cacheStats.clearedAt.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Debug Logs */}
      {debugLogs.length > 0 && (
        <div className={`p-3 rounded-lg ${
          isDark ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <div className={`text-xs font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>Debug Logs:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {debugLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {log.timestamp}
                </span>
                <span className={getLogTypeStyle(log.type)}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setDebugLogs([])}
            className={`mt-2 text-xs ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
            }`}
          >
            Clear logs
          </button>
        </div>
      )}
    </div>
  );
}

// Main Enhanced Profile Page
export default function ProfilePage() {
  const tasks = useTasks();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showDebugControls, setShowDebugControls] = useState(false);

  const handleProfileUpdate = (updates) => {
    if (user && user.uid) {
      updateProfile(updates);
    } else {
      console.error('User not authenticated');
    }
  };

  const handleAvatarChange = () => {
    // In a real app, this would open a file picker
    console.log('Avatar change requested');
  };

  return (
<div className={`max-w-4xl mx-auto py-8 px-4 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ProfileHeader 
        profile={profile} 
        onEdit={() => setIsEditModalOpen(true)}
      />

      <ProfileForm
        profile={profile}
        onUpdate={handleProfileUpdate}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ActivitySummary tasks={tasks} />
          <RecentActivity tasks={tasks} />
        </div>
        
        <div className="space-y-8">
          <CategoryChart tasks={tasks} />
          
          {/* Settings Card */}
          <div className={`rounded-2xl shadow-lg p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>Quick Settings</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className={`w-full flex items-center justify-between gap-3 p-3 text-left rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Debug Info</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  showDebugInfo ? 'bg-green-500' : (isDark ? 'bg-gray-600' : 'bg-gray-300')
                }`}></div>
              </button>
              
              <button 
                onClick={() => setShowDebugControls(!showDebugControls)}
                className={`w-full flex items-center justify-between gap-3 p-3 text-left rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className={`w-5 h-5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Debug Controls</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  showDebugControls ? 'bg-blue-500' : (isDark ? 'bg-gray-600' : 'bg-gray-300')
                }`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Controls Panel */}
      {showDebugControls && (
        <div className={`mt-8 p-6 rounded-2xl border ${
          isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className={`w-5 h-5 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`font-bold ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>Debug Controls</h3>
          </div>
          <DebugControls tasks={tasks} profile={profile} user={user} isDark={isDark} />
        </div>
      )}

      {/* Debug Info */}
      {showDebugInfo && (
        <div className={`mt-8 p-6 rounded-2xl ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <h3 className={`font-bold mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}>Debug Information</h3>
          <div className="space-y-4">
            <div>
              <strong className={`${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>Auth User:</strong>
              {user ? (
                <pre className={`text-xs mt-2 p-4 rounded-lg overflow-x-auto border ${
                  isDark ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                }`}>
                  {JSON.stringify(user, null, 2)}
                </pre>
              ) : (
                <span className="text-red-600 ml-2">Not logged in</span>
              )}
            </div>
            <div>
              <strong className={`${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>Profile Data:</strong>
              <pre className={`text-xs mt-2 p-4 rounded-lg overflow-x-auto border ${
                isDark ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-900 border-gray-300'
              }`}>
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}