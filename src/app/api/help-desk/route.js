import { createDocument } from '../../../utils/db';
import { collection, getDocs, orderBy, query, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

// Function to generate next ticket number
async function generateTicketNumber() {
  const counterRef = doc(db, 'counters', 'helpDeskTickets');
  
  try {
    const counterDoc = await getDoc(counterRef);
    let nextNumber = 1;
    
    if (counterDoc.exists()) {
      nextNumber = (counterDoc.data().count || 0) + 1;
      await updateDoc(counterRef, { count: nextNumber });
    } else {
      await setDoc(counterRef, { count: nextNumber });
    }
    
    // Format ticket number as HD-YYYY-NNNN (e.g., HD-2024-0001)
    const year = new Date().getFullYear();
    const paddedNumber = nextNumber.toString().padStart(4, '0');
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
    
    const docRef = await createDocument('helpDeskTickets', ticketId, newTicket);
    console.log('Ticket created successfully:', docRef.id);

    return new Response(JSON.stringify({ 
      message: 'Ticket created successfully',
      ticketId: docRef.id,
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
    const ticketsQuery = query(
      collection(db, 'helpDeskTickets'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(ticketsQuery);
    const tickets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(tickets), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching help desk tickets:', error);
    return new Response(JSON.stringify({ error: 'Error fetching tickets' }), { status: 500 });
  }
}
