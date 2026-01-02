import { WebSocketServer } from 'ws';
import { adminDb } from '../../../config/firebase-admin';
import { verifyAuthToken } from '../../../lib/auth';
import { broadcastNotification } from '@/utils/websocket';

let wss = null;
const clients = new Map(); // Store client connections with user info

function initWebSocketServer() {
  if (wss) return wss;
  
  wss = new WebSocketServer({ 
    port: 0, // Let the system assign a port
    perMessageDeflate: false 
  });

  wss.on('connection', async (ws, request) => {
    console.log('New WebSocket connection established');
    
    let userId = null;
    let userTeams = [];

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'auth':
            // Authenticate user
            try {
              const decodedToken = await verifyAuthToken(data.token);
              userId = decodedToken.uid;
              
              // Get user teams from database
              const userDoc = await adminDb.collection('users').doc(userId).get();
              if (userDoc.exists) {
                userTeams = userDoc.data().teams || [];
              }
              
              // Store client info
              clients.set(ws, { userId, userTeams, lastSeen: new Date() });
              
              // Update presence status
              await updateUserPresence(userId, userTeams, 'online');
              
              // Send authentication success
              ws.send(JSON.stringify({
                type: 'auth_success',
                userId,
                timestamp: new Date().toISOString()
              }));
              
              // Send initial presence data
              const teamPresence = await getTeamPresence(userTeams);
              ws.send(JSON.stringify({
                type: 'presence_update',
                presence: teamPresence,
                timestamp: new Date().toISOString()
              }));
              
            } catch (error) {
              console.error('Authentication failed:', error);
              ws.send(JSON.stringify({
                type: 'auth_error',
                message: 'Authentication failed',
                timestamp: new Date().toISOString()
              }));
            }
            break;
            
          case 'ping':
            // Keep connection alive and update presence
            if (userId) {
              await updateUserPresence(userId, userTeams, 'online');
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }));
            }
            break;
            
          case 'presence_update':
            // Update user presence status
            if (userId && data.status) {
              await updateUserPresence(userId, userTeams, data.status);
              
              // Broadcast presence update to team members
              broadcastToTeams(userTeams, {
                type: 'presence_change',
                userId,
                status: data.status,
                timestamp: new Date().toISOString()
              }, ws);
            }
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
          timestamp: new Date().toISOString()
        }));
      }
    });

    ws.on('close', async () => {
      console.log('WebSocket connection closed');
      if (userId) {
        // Update presence to offline
        await updateUserPresence(userId, userTeams, 'offline');
        
        // Broadcast offline status to team members
        broadcastToTeams(userTeams, {
          type: 'presence_change',
          userId,
          status: 'offline',
          timestamp: new Date().toISOString()
        });
      }
      
      // Remove client from active connections
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  return wss;
}

async function updateUserPresence(userId, teams, status) {
  try {
    const presenceData = {
      userId,
      teams,
      status,
      lastSeen: new Date()
    };
    
    await adminDb.collection('presence').doc(userId).set(presenceData, { merge: true });
  } catch (error) {
    console.error('Error updating presence:', error);
  }
}

async function getTeamPresence(teamIds) {
  try {
    const teamPresence = {};
    
    for (const teamId of teamIds) {
      const presenceQuery = adminDb.collection('presence')
        .where('teams', 'array-contains', teamId);
      
      const presenceSnapshot = await presenceQuery.get();
      
      presenceSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!teamPresence[teamId]) {
          teamPresence[teamId] = {};
        }
        teamPresence[teamId][doc.id] = data;
      });
    }
    
    return teamPresence;
  } catch (error) {
    console.error('Error fetching team presence:', error);
    return {};
  }
}

function broadcastToTeams(teamIds, message, excludeClient = null) {
  clients.forEach((clientInfo, client) => {
    if (client !== excludeClient && client.readyState === 1) { // WebSocket.OPEN = 1
      // Check if client is in any of the target teams
      const hasCommonTeam = clientInfo.userTeams.some(team => teamIds.includes(team));
      if (hasCommonTeam) {
        client.send(JSON.stringify(message));
      }
    }
  });
}

// HTTP GET handler for WebSocket upgrade
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const upgrade = request.headers.get('upgrade');
  
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }
  
  // Initialize WebSocket server if not already done
  const server = initWebSocketServer();
  
  return new Response('WebSocket server running', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

// Fallback for non-WebSocket requests
export async function POST(request) {
  return new Response('This endpoint only supports WebSocket connections', { 
    status: 400,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
