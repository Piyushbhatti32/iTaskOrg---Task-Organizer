import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useGroupChat(groupId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      if (!user || !groupId) return;

      // Get fresh ID token
      const token = await user.getIdToken();
      
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/groups/chat?token=${token}&groupId=${groupId}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'message':
              setMessages((prev) => [...prev, message]);
              break;
            case 'error':
              console.error('WebSocket error:', message.content);
              setError(message.content);
              break;
            case 'system':
              console.log('System message:', message.content);
              break;
            default:
              console.warn('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after delay
        if (!event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setError(error.message);
      setIsConnected(false);
    }
  }, [user, groupId]);

  // Connect on mount and reconnect on dependencies change
  useEffect(() => {
    connect();

    return () => {
      // Clean up on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Send message
  const sendMessage = useCallback((content, replyTo = null) => {
    if (!isConnected) {
      setError('Not connected');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        content,
        replyTo
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      return false;
    }
  }, [isConnected]);

  // Load previous messages
  const loadMessages = useCallback(async (limit = 50) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(error.message);
    }
  }, [user, groupId]);

  return {
    messages,
    isConnected,
    error,
    sendMessage,
    loadMessages
  };
} 