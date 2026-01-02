// Broadcast notification to specific users or teams
export function broadcastNotification(notification, targetUsers = null, targetTeams = null) {
  const message = {
    type: 'notification',
    notification,
    timestamp: new Date().toISOString()
  };
  
  clients.forEach((clientInfo, client) => {
    if (client.readyState === 1) { // WebSocket.OPEN = 1
      let shouldSend = false;
      
      if (targetUsers && targetUsers.includes(clientInfo.userId)) {
        shouldSend = true;
      } else if (targetTeams) {
        const hasCommonTeam = clientInfo.userTeams.some(team => targetTeams.includes(team));
        if (hasCommonTeam) {
          shouldSend = true;
        }
      } else if (!targetUsers && !targetTeams) {
        // Broadcast to all connected users
        shouldSend = true;
      }
      
      if (shouldSend) {
        client.send(JSON.stringify(message));
      }
    }
  });
}