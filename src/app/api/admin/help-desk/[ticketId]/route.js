import { adminDb, adminAuth } from '../../../../../config/firebase-admin';
import { sendTicketStatusUpdateToUser } from '../../../../../utils/emailService';

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
    
    // Get current ticket data before update to check for status changes
    const currentTicket = await docRef.get();
    const currentData = currentTicket.data();
    
    await docRef.update(updateData);
    
    // Send email notification if status changed or if it's a significant update
    if (currentData && (updates.status || updates.assignedTo)) {
      const updatedTicketData = {
        ticketNumber: currentData.ticketNumber,
        title: currentData.title,
        status: updates.status || currentData.status,
        assignedTo: updates.assignedTo || currentData.assignedTo,
        userName: currentData.userName
      };
      
      // Send notification to the user who created the ticket
      sendTicketStatusUpdateToUser(currentData.userEmail, updatedTicketData)
        .catch(error => {
          console.error('Failed to send ticket update email to user:', error);
          // Don't fail the update if email fails
        });
    }

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
