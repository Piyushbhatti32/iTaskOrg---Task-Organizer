import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { getFirestoreDb } from "@/lib/firebase-client";
import { 
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot
} from 'firebase/firestore';

export function useTeamChat(teamId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const lastMessageRef = useRef(null);
  const messagesPerPage = 50;

  const {
    isConnected,
    error: wsError,
    typingUsers,
    sendChatMessage,
    updateTypingStatus
  } = useWebSocket([teamId]);

  // Load initial messages
  useEffect(() => {
    async function loadInitialMessages() {
      try {
        const db = getFirestoreDb();
        const chatRef = collection(db, 'teams', teamId, 'messages');
        const q = query(
          chatRef,
          orderBy('createdAt', 'desc'),
          limit(messagesPerPage)
        );

        const querySnapshot = await getDocs(q);
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setMessages(fetchedMessages.reverse());
        setHasMore(fetchedMessages.length === messagesPerPage);
        if (fetchedMessages.length > 0) {
          lastMessageRef.current = fetchedMessages[0];
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialMessages();
  }, [teamId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!teamId) return;

    try {
      const db = getFirestoreDb();
      const chatRef = collection(db, 'teams', teamId, 'messages');
      const q = query(
        chatRef,
        where('createdAt', '>', new Date()),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const message = {
              id: change.doc.id,
              ...change.doc.data()
            };
            setMessages(prev => [...prev, message]);
          }
        });
      }, (error) => {
        console.error('Error in messages subscription:', error);
        setError('Failed to subscribe to new messages');
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up messages subscription:', error);
      setError('Failed to set up messages subscription');
    }
  }, [teamId]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || !lastMessageRef.current) return;

    try {
      setIsLoading(true);
      const db = getFirestoreDb();
      const chatRef = collection(db, 'teams', teamId, 'messages');
      const q = query(
        chatRef,
        orderBy('createdAt', 'desc'),
        where('createdAt', '<', lastMessageRef.current.createdAt),
        limit(messagesPerPage)
      );

      const querySnapshot = await getDocs(q);
      const fetchedMessages = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      if (fetchedMessages.length > 0) {
        setMessages(prev => [...fetchedMessages.reverse(), ...prev]);
        lastMessageRef.current = fetchedMessages[0];
      }
      setHasMore(fetchedMessages.length === messagesPerPage);
    } catch (error) {
      console.error('Error loading more messages:', error);
      setError('Failed to load more messages');
    } finally {
      setIsLoading(false);
    }
  }, [teamId, hasMore]);

  // Send message with mention handling
  const sendMessage = useCallback((content) => {
    // Extract mentions from content
    const mentions = content.match(/@(\w+)/g) || [];
    const mentionUsernames = mentions.map(mention => mention.slice(1));

    sendChatMessage(teamId, content);
  }, [teamId, sendChatMessage]);

  // Handle typing status
  const handleTyping = useCallback((isTyping) => {
    updateTypingStatus(teamId, isTyping);
  }, [teamId, updateTypingStatus]);

  return {
    messages,
    isLoading,
    error: error || wsError,
    hasMore,
    isConnected,
    typingUsers: typingUsers[teamId] || [],
    sendMessage,
    handleTyping,
    loadMoreMessages
  };
} 