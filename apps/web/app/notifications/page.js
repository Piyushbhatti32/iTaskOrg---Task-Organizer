'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bell, Check, CheckCircle, Trash2, Filter, Search, X, Clock, MessageSquare, Users, Settings, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'task':
      return CheckCircle;
    case 'team':
      return Users;
    case 'group':
      return MessageSquare;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'task':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'team':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'group':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'system':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { notifications, markAsRead, markAllAsRead, isConnected, error } = useNotifications({ showAllNotifications: true });
  
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Type filter
      if (filterType !== 'all' && notification.type !== filterType) {
        return false;
      }
      
      // Status filter
      if (filterStatus !== 'all' && notification.status !== filterStatus) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const content = notification.content || notification.message || '';
        return (
          notification.title.toLowerCase().includes(searchLower) ||
          content.toLowerCase().includes(searchLower) ||
          (notification.senderName && notification.senderName.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [notifications, filterType, filterStatus, searchTerm]);

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = async () => {
    // Implementation for bulk delete if needed
    console.log('Bulk delete:', selectedNotifications);
    setSelectedNotifications(new Set());
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }
    
    // Handle notification link navigation
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const hasSelected = selectedNotifications.size > 0;

  return (
    <div className={`min-h-screen p-4 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Bell className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Notifications
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {isConnected ? 'Real-time notifications active' : 'Connection lost - notifications may be delayed'}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50'
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="all">All Types</option>
                    <option value="task">Tasks</option>
                    <option value="team">Teams</option>
                    <option value="group">Groups</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {hasSelected && (
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedNotifications.size} notification(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkMarkAsRead}
                    className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg ${
                      isDark
                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Mark Read
                  </button>
                  <button
                    onClick={() => setSelectedNotifications(new Set())}
                    className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg ${
                      isDark
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className={`rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                  ? 'No matching notifications'
                  : 'No notifications yet'
                }
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : "You'll receive notifications here for tasks, teams, and system updates"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Select All Header */}
              <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select all ({filteredNotifications.length})
                  </span>
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  const isSelected = selectedNotifications.has(notification.id);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors duration-200 ${
                        notification.status === 'unread' 
                          ? isDark ? 'bg-blue-950/20' : 'bg-blue-50/50'
                          : ''
                      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                        />

                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                              {notification.title}
                            </h4>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3 line-clamp-2`}>
                            {notification.content || notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {notification.senderName && notification.senderName !== 'System' && (
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  from {notification.senderName}
                                </span>
                              )}
                              <Clock className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            
                            {notification.status === 'unread' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                                  isDark
                                    ? 'text-blue-400 hover:bg-blue-900/30'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
