import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
      case 'presence':
        setTeamPresence(prev => ({
          ...prev,
          [data.userId]: {
            status: data.status,
            timestamp: data.timestamp
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

      default:
        // Handle other message types in the component using this hook
        break;
    }
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    if (!user || !teamIds.length) return;

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws?userId=${user.uid}&teamIds=${teamIds.join(',')}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);

      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (user) {
          console.log('Attempting to reconnect...');
          setSocket(null);
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to real-time service');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setSocket(ws);

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [user, teamIds, handleWebSocketMessage]);

  // Send message through WebSocket
  const sendMessage = useCallback((type, data) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected');
      return;
    }

    try {
      socket.send(JSON.stringify({
        type,
        ...data
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  }, [socket]);

  // Send chat message
  const sendChatMessage = useCallback((teamId, content) => {
    sendMessage('chat_message', { teamId, content });
  }, [sendMessage]);

  // Update typing status
  const updateTypingStatus = useCallback((teamId, isTyping) => {
    sendMessage('typing', { teamId, isTyping });
  }, [sendMessage]);

  return {
    isConnected,
    error,
    teamPresence,
    typingUsers,
    sendChatMessage,
    updateTypingStatus
  };
} 