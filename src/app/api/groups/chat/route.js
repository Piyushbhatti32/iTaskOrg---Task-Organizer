// Group chat API route - simplified version without WebSocket
// For production, consider implementing with Socket.IO or similar

// Mock messages store (in production, use a real database)
const messageStore = new Map();

// POST: Send a message to a group
export async function POST(request) {
  try {
    const { groupId, content, userId } = await request.json();
    
    if (!groupId || !content || !userId) {
      return new Response('Missing required fields', { status: 400 });
    }

    const message = {
      id: Date.now().toString(),
      content,
      userId,
      groupId,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // Store message (in production, save to database)
    if (!messageStore.has(groupId)) {
      messageStore.set(groupId, []);
    }
    messageStore.get(groupId).push(message);

    return Response.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return new Response('Failed to send message', { status: 500 });
  }
}

// GET: Fetch messages for a group
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    
    if (!groupId) {
      return new Response('Missing groupId', { status: 400 });
    }

    const messages = messageStore.get(groupId) || [];
    
    return Response.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new Response('Failed to fetch messages', { status: 500 });
  }
}
