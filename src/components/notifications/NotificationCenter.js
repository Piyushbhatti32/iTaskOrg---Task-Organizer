import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Check, CheckSquare, Users, UserPlus, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/contexts/ThemeContext';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'task':
      return CheckSquare;
    case 'team':
      return Users;
    case 'group':
      return UserPlus;
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

export default function NotificationCenter({ position = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, isConnected, error } = useNotifications();
  const { isDark } = useTheme();
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, placement: 'right' });
  
  // Calculate dropdown position based on button position
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 320; // 80rem = 320px
    const dropdownHeight = 384; // max-h-96 = 384px
    const padding = 16; // Some padding from viewport edges

    let left = buttonRect.left;
    let top = buttonRect.bottom + 8; // 8px gap
    let placement = 'right';

    // Check if dropdown would overflow right edge
    if (left + dropdownWidth > window.innerWidth - padding) {
      left = buttonRect.right - dropdownWidth;
      placement = 'left';
    }

    // Check if dropdown would overflow left edge
    if (left < padding) {
      left = padding;
    }

    // Check if dropdown would overflow bottom edge
    if (top + dropdownHeight > window.innerHeight - padding) {
      top = buttonRect.top - dropdownHeight - 8; // Position above button
    }

    // Ensure dropdown doesn't go above viewport
    if (top < padding) {
      top = padding;
    }

    setDropdownPosition({ top, left, placement });
  };

  // Update position when opening dropdown
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
      
      // Recalculate on window resize
      const handleResize = () => calculateDropdownPosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Don't render if there's a critical error
  if (error && error.includes('Failed to load notifications')) {
    return (
      <button
        className="relative p-2 text-gray-400 dark:text-gray-600 cursor-not-allowed rounded-lg"
        disabled
        title="Notifications unavailable"
      >
        <Bell className="w-5 h-5" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
      </button>
    );
  }

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    
    // Handle notification link navigation
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
      >
        <Bell className="w-5 h-5" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </button>

      {/* Portal-rendered dropdown */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl shadow-xl z-[9999] max-h-96 overflow-hidden transition-all duration-200"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            borderWidth: '1px',
            boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header */}
          <div 
            className="p-4 border-b"
            style={{
              backgroundColor: isDark ? '#1f2937' : '#f9fafb',
              borderBottomColor: isDark ? '#374151' : '#e5e7eb',
              borderBottomWidth: '1px'
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                    ({unreadCount} new)
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Notifications List */}
          <div 
            className="max-h-80 overflow-y-auto"
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff'
            }}
          >
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 ${
                        notification.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {notification.title}
                            </h4>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {notification.message || notification.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.senderName && notification.senderName !== 'System' && (
                                <span>from {notification.senderName} • </span>
                              )}
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            
                            {notification.status === 'unread' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div 
              className="p-3 border-t"
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                borderTopColor: isDark ? '#374151' : '#e5e7eb',
                borderTopWidth: '1px'
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
