import React, { useState } from 'react';
import { Bell, Send, CheckCircle, XCircle, Edit3, Save, X } from 'lucide-react';

const FeatureAnnouncementPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '🔔 New Notification Center Feature',
    message: 'We\'ve added a new notification center to help you stay updated with important information and system updates. Click here to explore this new feature!',
    description: 'Announce the new real-time notification system to all users. This will send a notification about the NotificationCenter feature with its capabilities.',
    featureName: 'NotificationCenter Feature',
    link: '/notifications'
  });

  const announceNotificationCenter = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      // Create custom announcement with current edit data
      const customAnnouncement = {
        title: editData.title,
        message: editData.message,
        link: editData.link,
        featureName: editData.featureName
      };

      const response = await fetch('/api/announce/custom-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customAnnouncement)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({
          type: 'success',
          message: result.message,
          details: result.details
        });
      } else {
        // Fallback to original API if custom one doesn't exist
        const fallbackResponse = await fetch('/api/announce/notification-center', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const fallbackResult = await fallbackResponse.json();
        
        if (fallbackResponse.ok && fallbackResult.success) {
          setStatus({
            type: 'success',
            message: fallbackResult.message,
            details: fallbackResult.details
          });
        } else {
          setStatus({
            type: 'error',
            message: result.message || fallbackResult.message || 'Failed to send announcement'
          });
        }
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error sending announcement: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setStatus(null); // Clear any previous status
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    setStatus({
      type: 'success',
      message: 'Announcement content updated successfully!'
    });
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditData({
      title: '🔔 New Notification Center Feature',
      message: 'We\'ve added a new notification center to help you stay updated with important information and system updates. Click here to explore this new feature!',
      description: 'Announce the new real-time notification system to all users. This will send a notification about the NotificationCenter feature with its capabilities.',
      featureName: 'NotificationCenter Feature',
      link: '/notifications'
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Feature Announcements
      </h2>

      <div className="space-y-4">
        {/* NotificationCenter Announcement */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editData.featureName}
              </h3>
            </div>
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Feature Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Feature Name
                </label>
                <input
                  type="text"
                  value={editData.featureName}
                  onChange={(e) => handleInputChange('featureName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Feature name..."
                />
              </div>

              {/* Notification Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Notification title..."
                />
              </div>

              {/* Notification Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notification Message
                </label>
                <textarea
                  value={editData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Notification message..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Internal description for admin panel..."
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={editData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="/notifications"
                />
              </div>

              {/* Edit Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {editData.description}
              </p>
              
              {/* Preview of notification content */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notification Preview:</h4>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{editData.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{editData.message}</p>
                  {editData.link && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">Link: {editData.link}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={announceNotificationCenter}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Sending...' : 'Send Announcement'}
              </button>
            </div>
          )}
        </div>

        {/* Status Message */}
        {status && (
          <div className={`p-4 rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {status.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  status.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {status.message}
                </p>
                {status.details && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Users notified: {status.details.usersNotified}</p>
                    <p>• Feature: {status.details.featureTitle}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Feature announcements will be sent to all active users in the system. 
            Each user will receive a notification in their NotificationCenter with details about the new feature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureAnnouncementPanel;
