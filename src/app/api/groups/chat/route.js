import { auth } from '@/config/firebase';
import { createMessage, getGroup, getTask } from '@/utils/db';
import { WebSocketServer } from 'ws';

// Store active connections
const connections = new Map();

// Initialize WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket connection
wss.on('connection', async (ws, req, userId, groupId) => {
  // Store connection info
  if (!connections.has(groupId)) {
    connections.set(groupId, new Map());
  }
  connections.get(groupId).set(userId, ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    content: 'Connected to chat'
  }));

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      // Validate message structure
      if (!message.content || typeof message.content !== 'string') {
        ws.send(JSON.stringify({
          type: 'error',
          content: 'Invalid message format'
        }));
        return;
      }

      // Create message in database
      const messageData = {
        content: message.content,
        createdBy: userId,
        groupId,
        type: 'text',
        replyTo: message.replyTo || null,
        mentions: []
      };

      // Parse @task mentions
      const taskMentions = message.content.match(/@task(\d+)/g);
      if (taskMentions) {
        const tasks = await Promise.all(
          taskMentions.map(async (mention) => {
            const taskId = mention.replace('@task', '');
            const task = await getTask(taskId);
            return task ? {
              id: taskId,
              title: task.title,
              status: task.status
            } : null;
          })
        );

        messageData.mentions = tasks.filter(Boolean);
      }

      const messageRef = await createMessage(messageData);

      // Broadcast to all connected clients in the group
      const groupConnections = connections.get(groupId);
      if (groupConnections) {
        const broadcastMessage = JSON.stringify({
          type: 'message',
          id: messageRef.id,
          ...messageData,
          timestamp: new Date().toISOString()
        });

        groupConnections.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastMessage);
          }
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        content: 'Failed to process message'
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    const groupConnections = connections.get(groupId);
    if (groupConnections) {
      groupConnections.delete(userId);
      if (groupConnections.size === 0) {
        connections.delete(groupId);
      }
    }
  });
});

/**
 * Upgrade HTTP connection to WebSocket
 */
export async function GET(request) {
  try {
    // Get auth token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const groupId = searchParams.get('groupId');

    if (!token || !groupId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify token and get user ID
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check group membership
    const group = await getGroup(groupId);
    if (!group || !group.members[userId]) {
      return new Response('Not a member of this group', { status: 403 });
    }

    // Upgrade connection to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(request);
    
    // Handle WebSocket connection
    wss.handleUpgrade(request, socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws, request, userId, groupId);
    });

    return response;
  } catch (error) {
    console.error('WebSocket connection error:', error);
    return new Response('Failed to establish WebSocket connection', { status: 500 });
  }
}

/**
 * Handle WebSocket cleanup on server shutdown
 */
process.on('SIGTERM', () => {
  wss.clients.forEach((client) => {
    client.close(1000, 'Server shutting down');
  });
  wss.close();
}); 