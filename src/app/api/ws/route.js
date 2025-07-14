import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// Store active connections
const connections = new Map();
// Store user presence
const presence = new Map();
// Store team chat subscriptions
const teamChatSubscriptions = new Map();

// Helper function to broadcast to team members
function broadcastToTeam(teamId, message, excludeUserId = null) {
  connections.forEach((socket, userId) => {
    if (userId !== excludeUserId && presence.get(userId)?.teams?.includes(teamId)) {
      socket.send(JSON.stringify(message));
    }
  });
}

// Helper function to handle user presence
async function handlePresence(userId, teamIds, isOnline) {
  try {
    const presenceData = {
      userId,
      teams: teamIds,
      status: isOnline ? 'online' : 'offline',
      lastSeen: serverTimestamp()
    };

    // Update presence in Firestore
    const presenceRef = doc(db, 'presence', userId);
    await setDoc(presenceRef, presenceData, { merge: true });

    // Update local presence map
    presence.set(userId, {
      ...presenceData,
      lastSeen: new Date()
    });

    // Broadcast presence update to team members
    teamIds.forEach(teamId => {
      broadcastToTeam(teamId, {
        type: 'presence',
        userId,
        status: isOnline ? 'online' : 'offline',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Error updating presence:', error);
  }
}

// Helper function to subscribe to team chat
function subscribeToTeamChat(teamId, userId) {
  const chatRef = collection(db, 'teams', teamId, 'messages');
  const q = query(chatRef, where('createdAt', '>', new Date()));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = {
          id: change.doc.id,
          ...change.doc.data()
        };

        // Broadcast message to all team members
        broadcastToTeam(teamId, {
          type: 'chat_message',
          teamId,
          message
        });

        // Handle mentions
        const mentions = message.content.match(/@(\w+)/g);
        if (mentions) {
          mentions.forEach(async (mention) => {
            const username = mention.slice(1);
            // Get user by username and send notification
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const mentionedUser = userSnapshot.docs[0];
              const notificationRef = doc(collection(db, 'notifications'));
              await setDoc(notificationRef, {
                userId: mentionedUser.id,
                type: 'mention',
                teamId,
                messageId: message.id,
                from: message.userId,
                content: message.content,
                status: 'unread',
                createdAt: serverTimestamp()
              });
            }
          });
        }
      }
    });
  });

  // Store subscription for cleanup
  const existingSubscriptions = teamChatSubscriptions.get(teamId) || new Map();
  existingSubscriptions.set(userId, unsubscribe);
  teamChatSubscriptions.set(teamId, existingSubscriptions);
}

// WebSocket connection handler
export function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const teamIds = searchParams.get('teamIds')?.split(',') || [];

  if (!userId || teamIds.length === 0) {
    return new Response('User ID and team IDs are required', { status: 400 });
  }

  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 426 });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(request);

    // Store the connection
    connections.set(userId, socket);

    // Set up socket event handlers
    socket.onopen = async () => {
      console.log(`WebSocket connection opened for user ${userId}`);
      
      // Update user presence
      await handlePresence(userId, teamIds, true);

      // Subscribe to team chats
      teamIds.forEach(teamId => {
        subscribeToTeamChat(teamId, userId);
      });
    };

    socket.onclose = async () => {
      console.log(`WebSocket connection closed for user ${userId}`);
      
      // Update user presence
      await handlePresence(userId, teamIds, false);

      // Clean up subscriptions
      teamIds.forEach(teamId => {
        const teamSubscriptions = teamChatSubscriptions.get(teamId);
        if (teamSubscriptions) {
          const unsubscribe = teamSubscriptions.get(userId);
          if (unsubscribe) {
            unsubscribe();
            teamSubscriptions.delete(userId);
          }
          if (teamSubscriptions.size === 0) {
            teamChatSubscriptions.delete(teamId);
          }
        }
      });

      // Remove connection
      connections.delete(userId);
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, teamId } = data;

        switch (type) {
          case 'chat_message':
            // Store message in Firestore
            const messageRef = doc(collection(db, 'teams', teamId, 'messages'));
            await setDoc(messageRef, {
              content: data.content,
              userId,
              createdAt: serverTimestamp()
            });
            break;

          case 'typing':
            // Broadcast typing status
            broadcastToTeam(teamId, {
              type: 'typing',
              userId,
              teamId,
              isTyping: data.isTyping
            }, userId);
            break;

          default:
            console.warn(`Unknown message type: ${type}`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    };

    return response;
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    return new Response('Failed to set up WebSocket connection', { status: 500 });
  }
} 