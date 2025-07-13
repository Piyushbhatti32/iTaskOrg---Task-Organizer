'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Globe, MapPin, Calendar, Trophy, TrendingUp, Activity, Settings, Camera, Edit3, Save, X, Loader2 } from 'lucide-react';
import { useTasks, useProfile, useUpdateProfile } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileImage } from '../../hooks/useProfileImage';

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
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-4 border-white/20">
            {!avatarUrl ? (
              <div className="text-4xl font-bold text-white w-full h-full flex items-center justify-center">
                {profile.name?.charAt(0) || user?.displayName?.charAt(0) || 'A'}
              </div>
            ) : (
              <img
                src={avatarUrl}
                alt={profile.name || 'Profile'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="text-4xl font-bold text-white w-full h-full flex items-center justify-center">${profile.name?.charAt(0) || user?.displayName?.charAt(0) || 'A'}</div>`;
                }}
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
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    bio: profile.bio || '',
    timezone: profile.timezone || 'UTC'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onUpdate(formData);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Edit3 className="w-4 h-4 inline mr-1" />
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Activity Overview</h2>
        <TrendingUp className="w-6 h-6 text-green-500" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <div className="text-3xl font-bold text-blue-600 mb-1">{tasks.length}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <div className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-xl">
          <div className="text-3xl font-bold text-purple-600 mb-1">{completionRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-xl">
          <div className="text-3xl font-bold text-orange-600 mb-1">{stats.thisMonth}</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
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
  const recentTasks = tasks
    .filter(task => task.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
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
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      
      {recentTasks.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentTasks.map((task, index) => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">{getCategoryIcon(task.category)}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{task.title}</div>
                <div className="text-sm text-gray-500">
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
  const categories = tasks.reduce((acc, task) => {
    const category = task.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
  const total = Object.values(categories).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Categories</h2>
      
      <div className="space-y-4">
        {Object.entries(categories).map(([category, count], index) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={category} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-gray-600 capitalize">{category}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="w-12 text-sm text-gray-600">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main Enhanced Profile Page
export default function ProfilePage() {
  const tasks = useTasks();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const { user } = useAuth();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const handleProfileUpdate = (updates) => {
    updateProfile(updates);
  };

  const handleAvatarChange = () => {
    // In a real app, this would open a file picker
    console.log('Avatar change requested');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-gray-50 min-h-screen">
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
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Settings</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Debug Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {showDebugInfo && (
        <div className="mt-8 p-6 bg-gray-100 rounded-2xl">
          <h3 className="font-bold text-gray-900 mb-4">Debug Information</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-700">Auth User:</strong>
              {user ? (
                <pre className="text-xs mt-2 bg-white p-4 rounded-lg overflow-x-auto text-gray-900 border">
                  {JSON.stringify(user, null, 2)}
                </pre>
              ) : (
                <span className="text-red-600 ml-2">Not logged in</span>
              )}
            </div>
            <div>
              <strong className="text-gray-700">Profile Data:</strong>
              <pre className="text-xs mt-2 bg-white p-4 rounded-lg overflow-x-auto text-gray-900 border">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}