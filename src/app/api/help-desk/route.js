import { createDocument } from '../../../utils/db';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export async function POST(req) {
  try {
    const { title, description, userId, userEmail, userName, priority = 'medium', category = 'general' } = await req.json();
    const newTicket = {
      title,
      description,
      userId,
      userEmail,
      userName,
      priority,
      category,
      status: 'open',
      createdAt: new Date().toISOString(),
      notes: [],
      assignedTo: null
    };

    // Generate a unique ID for the ticket
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await createDocument('helpDeskTickets', ticketId, newTicket);

    return new Response(JSON.stringify({ 
      message: 'Ticket created successfully',
      ticketId 
    }), {
      status: 201,
    });
  } catch (error) {
    console.error('Error creating help desk ticket:', error);
    return new Response(JSON.stringify({ error: 'Error creating ticket' }), { status: 500 });
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
