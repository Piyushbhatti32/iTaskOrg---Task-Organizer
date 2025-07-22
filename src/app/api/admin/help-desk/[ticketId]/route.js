import { adminDb, adminAuth } from '../../../../../config/firebase-admin';

export async function GET(req, { params }) {
  try {
    // Verify authentication token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);
    
    // Check if Admin SDK is initialized
    if (!adminDb) {
      console.error('❌ Firebase Admin SDK not initialized');
      return new Response(JSON.stringify({ error: 'Firebase Admin SDK not initialized' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { ticketId } = resolvedParams;
    const docRef = adminDb.collection('helpDeskTickets').doc(ticketId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ id: docSnap.id, ...docSnap.data() }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return new Response(JSON.stringify({ error: 'Error fetching ticket' }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    // Verify authentication token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);
    
    // Check if Admin SDK is initialized
    if (!adminDb) {
      console.error('❌ Firebase Admin SDK not initialized');
      return new Response(JSON.stringify({ error: 'Firebase Admin SDK not initialized' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { ticketId } = resolvedParams;
    const updates = await req.json();
    
    // Add timestamp for updates
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const docRef = adminDb.collection('helpDeskTickets').doc(ticketId);
    await docRef.update(updateData);

    return new Response(JSON.stringify({ 
      message: 'Ticket updated successfully',
      ticketId 
    }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return new Response(JSON.stringify({ error: 'Error updating ticket' }), { status: 500 });
  }
}
