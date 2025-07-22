import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../config/firebase';

import { adminAuth } from '../../../../../config/firebase-admin';

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
    
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { ticketId } = resolvedParams;
    const docRef = doc(db, 'helpDeskTickets', ticketId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
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
    
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { ticketId } = resolvedParams;
    const updates = await req.json();
    
    // Add timestamp for updates
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, 'helpDeskTickets', ticketId);
    await updateDoc(docRef, updateData);

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
