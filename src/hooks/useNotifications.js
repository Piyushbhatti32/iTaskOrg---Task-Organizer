import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  sendTaskAssignmentPushNotification,
  sendGroupInvitationPushNotification,
  sendTeamInvitationPushNotification,
  sendTaskCompletionPushNotification,
  isPushNotificationSupported
} from '@/utils/pushNotifications';

export function useNotifications(options = {}) {
  const { user } = useAuth();
  const { showAllNotifications = false } = options;
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial notifications and setup polling
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const token = await user.getIdToken();
        const statusParam = showAllNotifications ? '' : '&status=unread';
        const response = await fetch(`/api/notifications/ws?userId=${user.uid}${statusParam}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setIsConnected(true);
          setError(null);
        } else {
          // Handle different error status codes
          let errorMessage = 'Failed to fetch notifications';
          if (response.status === 500) {
            errorMessage = 'Server error - please try again later';
          } else if (response.status === 503) {
            errorMessage = 'Service temporarily unavailable - Firebase configuration issue';
          } else if (response.status === 401) {
            errorMessage = 'Authentication error - please sign in again';
          } else if (response.status === 403) {
            errorMessage = 'Access denied';
          }
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        
        // More specific error messages
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          setError('Network error - check your connection');
        } else {
          setError(error.message || 'Failed to load notifications');
        }
        setIsConnected(false);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [user, showAllNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'read' })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update notifications list based on view mode
      if (showAllNotifications) {
        // When showing all notifications, update the status instead of removing
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read' }
              : notification
          )
        );
      } else {
        // When showing only unread notifications, remove the notification
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  }, [user, showAllNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update notifications list based on view mode
      if (showAllNotifications) {
        // When showing all notifications, update all to read status
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, status: 'read' }))
        );
      } else {
        // When showing only unread notifications, clear the list
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  }, [user, showAllNotifications]);

  // Get notification count by type
  const getCountByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type).length;
  }, [notifications]);

  return {
    notifications,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    getCountByType
  };
} 