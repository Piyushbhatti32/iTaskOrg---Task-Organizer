import { adminDb } from '../../../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Function to generate next ticket number using Admin SDK
async function generateTicketNumber() {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  const counterRef = adminDb.collection('counters').doc('helpDeskTickets');
  
  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let nextNumber = 1;
      
      if (counterDoc.exists) {
        nextNumber = (counterDoc.data().count || 0) + 1;
      }
      
      transaction.set(counterRef, { count: nextNumber }, { merge: true });
      return nextNumber;
    });
    
    // Format ticket number as HD-YYYY-NNNN (e.g., HD-2024-0001)
    const year = new Date().getFullYear();
    const paddedNumber = result.toString().padStart(4, '0');
    return `HD-${year}-${paddedNumber}`;
  } catch (error) {
    console.error('Error generating ticket number:', error);
    // Fallback to timestamp-based number if counter fails
    const timestamp = Date.now();
    return `HD-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`;
  }
}

export async function POST(req) {
  try {
    const { title, description, userId, userEmail, userName, priority = 'medium', category = 'general' } = await req.json();
    
    // Validate required fields
    if (!title || !description || !userId || !userEmail) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: title, description, userId, or userEmail' 
      }), { status: 400 });
    }

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();
    console.log('Generated ticket number:', ticketNumber);

    const newTicket = {
      title: title.trim(),
      description: description.trim(),
      ticketNumber,
      userId,
      userEmail,
      userName: userName || userEmail,
      priority,
      category,
      status: 'open',
      notes: [],
      assignedTo: null
      // Note: createdAt and updatedAt will be set by createDocument function
    };

    // Generate a unique ID for the ticket
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Creating ticket with ID:', ticketId);
    
    // Create ticket using Admin SDK
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    
    const ticketRef = adminDb.collection('helpDeskTickets').doc(ticketId);
    await ticketRef.set({
      ...newTicket,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log('Ticket created successfully:', ticketId);

    return new Response(JSON.stringify({ 
      message: 'Ticket created successfully',
      ticketId: ticketId,
      ticketNumber,
      success: true
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating help desk ticket:', error);
    return new Response(JSON.stringify({ 
      error: 'Error creating ticket',
      details: error.message,
      success: false
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function GET() {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    
    const ticketsRef = adminDb.collection('helpDeskTickets');
    const snapshot = await ticketsRef.orderBy('createdAt', 'desc').get();
    const tickets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(tickets), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching help desk tickets:', error);
    return new Response(JSON.stringify({ error: 'Error fetching tickets' }), { status: 500 });
  }
}
