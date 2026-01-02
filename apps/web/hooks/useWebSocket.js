import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirebaseAuth } from "@/lib/firebase-client";

const auth = getFirebaseAuth();

export function useWebSocket(teamIds) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [teamPresence, setTeamPresence] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'auth_success':
        console.log('WebSocket authentication successful');
        break;
        
      case 'auth_error':
        console.error('WebSocket authentication failed:', data.message);
        setError('Authentication failed');
        break;

      case 'presence_update':
        setTeamPresence(prev => ({
          ...prev,
          [data.userId]: {
            status: data.status,
            timestamp: data.timestamp,
            teamId: data.teamId
          }
        }));
        break;

      case 'typing':
        const { userId, teamId, isTyping } = data;
        if (isTyping) {
          setTypingUsers(prev => ({
            ...prev,
            [teamId]: [...(prev[teamId] || []), userId]
          }));
          // Clear typing status after 3 seconds
          if (typingTimeoutRef.current[`${teamId}-${userId}`]) {
            clearTimeout(typingTimeoutRef.current[`${teamId}-${userId}`]);
          }
          typingTimeoutRef.current[`${teamId}-${userId}`] = setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [teamId]: (prev[teamId] || []).filter(id => id !== userId)
            }));
          }, 3000);
        } else {
          setTypingUsers(prev => ({
            ...prev,
            [teamId]: (prev[teamId] || []).filter(id => id !== userId)
          }));
        }
        break;

      case 'notification':
        // Handle real-time notifications
        console.log('Received notification:', data.notification);
        // This can be handled by components using this hook
        break;

      case 'heartbeat':
        // Respond to server heartbeat
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'heartbeat_response' }));
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
        break;
    }
  }, [socket]);

  // Connect to WebSocket
  useEffect(() => {
    if (!user || !teamIds.length) return;

    let ws = null;
    let authenticationTimeout = null;

    const connectWebSocket = async () => {
      try {
        // Copy ref values to avoid stale closure issues
        const currentTypingTimeouts = typingTimeoutRef.current;

        // Get Firebase ID token for authentication
        const token = await auth.currentUser.getIdToken();
        
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected, authenticating...');
          
          // Send authentication message
          ws.send(JSON.stringify({
            type: 'authenticate',
            token: token,
            teamIds: teamIds
          }));

          // Set timeout for authentication
          authenticationTimeout = setTimeout(() => {
            console.error('Authentication timeout');
            setError('Authentication timeout');
            ws.close();
          }, 10000); // 10 second timeout
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          setSocket(null);

          if (authenticationTimeout) {
            clearTimeout(authenticationTimeout);
          }

          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          // Only attempt to reconnect if not a deliberate close
          if (event.code !== 1000 && user) {
            console.log('Attempting to reconnect in 5 seconds...');
            reconnectTimeoutRef.current = setTimeout(() => {
              if (user) {
                connectWebSocket();
              }
            }, 5000);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Failed to connect to real-time service');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle authentication success
            if (data.type === 'auth_success') {
              if (authenticationTimeout) {
                clearTimeout(authenticationTimeout);
                authenticationTimeout = null;
              }
              setIsConnected(true);
              setError(null);
              console.log('WebSocket authenticated successfully');
            }
            
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        setSocket(ws);

        return () => {
          if (authenticationTimeout) {
            clearTimeout(authenticationTimeout);
          }
          if (ws) {
            ws.close(1000, 'Component unmounting');
          }
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          // Use the copied ref value to avoid stale closure issues
          Object.values(currentTypingTimeouts).forEach(timeout => {
            clearTimeout(timeout);
          });
        };
      } catch (error) {
        console.error('Error getting auth token:', error);
        setError('Authentication failed - unable to get token');
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (authenticationTimeout) {
        clearTimeout(authenticationTimeout);
      }
    };
  }, [user, teamIds, handleWebSocketMessage]);

  // Send message through WebSocket
  const sendMessage = useCallback((type, data) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected, cannot send message');
      setError('WebSocket is not connected');
      return false;
    }

    if (!isConnected) {
      console.warn('WebSocket is not authenticated, cannot send message');
      setError('WebSocket is not authenticated');
      return false;
    }

    try {
      socket.send(JSON.stringify({
        type,
        ...data
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      return false;
    }
  }, [socket, isConnected]);

  // Send chat message
  const sendChatMessage = useCallback((teamId, content) => {
    sendMessage('chat_message', { teamId, content });
  }, [sendMessage]);

  // Update typing status
  const updateTypingStatus = useCallback((teamId, isTyping) => {
    return sendMessage('typing', { teamId, isTyping });
  }, [sendMessage]);

  // Update presence status
  const updatePresenceStatus = useCallback((status) => {
    return sendMessage('presence_update', { status });
  }, [sendMessage]);

  return {
    isConnected,
    error,
    teamPresence,
    typingUsers,
    sendChatMessage,
    updateTypingStatus,
    updatePresenceStatus,
    sendMessage
  };
} 