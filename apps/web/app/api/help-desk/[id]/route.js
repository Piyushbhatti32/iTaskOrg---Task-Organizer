import { adminDb } from '../../../../config/firebase-admin';
import { updateDocument, deleteDocument } from '../../../../utils/db';
import { sendTicketStatusUpdateToUser } from '../../../../utils/emailService';

export async function GET(req, { params }) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Use Firebase Admin SDK for consistency
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    
    const docRef = adminDb.collection('helpDeskTickets').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 });
    }

    const ticketData = { id: docSnap.id, ...docSnap.data() };
    
    return new Response(JSON.stringify(ticketData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return new Response(JSON.stringify({ error: 'Error fetching ticket' }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const updates = await req.json();

    // Use Firebase Admin SDK for consistency
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    
    const docRef = adminDb.collection('helpDeskTickets').doc(id);
    
    // Get current ticket data before update to check for changes
    const currentTicket = await docRef.get();
    if (!currentTicket.exists) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 });
    }
    
    const currentData = currentTicket.data();
    
    // Validate and sanitize updates
    const allowedFields = ['title', 'description', 'priority', 'category', 'status'];
    const sanitizedUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined && value !== null) {
        if (typeof value === 'string') {
          sanitizedUpdates[key] = value.trim();
        } else {
          sanitizedUpdates[key] = value;
        }
      }
    }
    
    // Add timestamp for updates
    sanitizedUpdates.updatedAt = new Date().toISOString();
    
    await docRef.update(sanitizedUpdates);
    
    // Send email notification if status changed
    if (sanitizedUpdates.status && sanitizedUpdates.status !== currentData.status) {
      const updatedTicketData = {
        ticketNumber: currentData.ticketNumber,
        title: currentData.title,
        status: sanitizedUpdates.status,
        assignedTo: currentData.assignedTo,
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
      ticketId: id,
      updatedFields: Object.keys(sanitizedUpdates)
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return new Response(JSON.stringify({ 
      error: 'Error updating ticket',
      details: error.message 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Use Firebase Admin SDK for consistency
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    
    const docRef = adminDb.collection('helpDeskTickets').doc(id);
    await docRef.delete();

    return new Response(JSON.stringify({ message: 'Ticket deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return new Response(JSON.stringify({ error: 'Error deleting ticket' }), { status: 500 });
  }
}
