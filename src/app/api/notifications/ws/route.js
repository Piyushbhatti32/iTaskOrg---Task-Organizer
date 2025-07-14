import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';

// Map to store WebSocket connections by user ID
const connections = new Map();

// Helper function to send notification to a specific user
function sendNotification(userId, notification) {
  const connection = connections.get(userId);
  if (connection) {
    connection.send(JSON.stringify(notification));
  }
}

// WebSocket connection handler
export function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('User ID is required', { status: 400 });
  }

  // Upgrade the HTTP connection to WebSocket
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 426 });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(request);

    // Store the connection
    connections.set(userId, socket);

    // Set up Firestore listener for user's notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('status', '==', 'unread'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = {
            id: change.doc.id,
            ...change.doc.data()
          };
          sendNotification(userId, notification);
        }
      });
    });

    // Handle WebSocket events
    socket.onopen = () => {
      console.log(`WebSocket connection opened for user ${userId}`);
    };

    socket.onclose = () => {
      console.log(`WebSocket connection closed for user ${userId}`);
      connections.delete(userId);
      unsubscribe();
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

// Helper function to broadcast notification to multiple users
export function broadcastNotification(userIds, notification) {
  userIds.forEach(userId => {
    sendNotification(userId, notification);
  });
} 