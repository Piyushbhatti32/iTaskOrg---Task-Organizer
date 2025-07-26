import { adminDb } from '../../../../../../config/firebase-admin';
import { verifyAdminAccess, createUnauthorizedResponse } from '../../../../../../utils/adminAuth';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req, { params }) {
  try {
    // Verify admin access
    const verification = await verifyAdminAccess(req);
    if (!verification.authorized) {
      const status = verification.error === 'Missing or invalid authorization header' || 
                     verification.error === 'Invalid or expired token' ? 401 : 403;
      return createUnauthorizedResponse(verification.error, status);
    }
    
    // Check if Admin SDK is initialized
    if (!adminDb) {
      console.error('❌ Firebase Admin SDK not initialized');
      return new Response(JSON.stringify({ error: 'Firebase Admin SDK not initialized' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { ticketId } = params;
    const { note, authorId, authorName, isInternal = true } = await req.json();
    
    const noteData = {
      note,
      authorId,
      authorName,
      isInternal,
      createdAt: new Date().toISOString()
    };

    const docRef = adminDb.collection('helpDeskTickets').doc(ticketId);
    
    // Check if ticket exists
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 });
    }

    // Add the note to the ticket
    await docRef.update({
      notes: FieldValue.arrayUnion(noteData),
      updatedAt: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      message: 'Note added successfully',
      noteData 
    }), {
      status: 201,
    });
  } catch (error) {
    console.error('Error adding note:', error);
    return new Response(JSON.stringify({ error: 'Error adding note' }), { status: 500 });
  }
}
