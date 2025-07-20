import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../../../config/firebase';

export async function POST(req, { params }) {
  try {
    const { ticketId } = params;
    const { note, authorId, authorName, isInternal = true } = await req.json();
    
    const noteData = {
      note,
      authorId,
      authorName,
      isInternal,
      createdAt: new Date().toISOString()
    };

    const docRef = doc(db, 'helpDeskTickets', ticketId);
    
    // Check if ticket exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 });
    }

    // Add the note to the ticket
    await updateDoc(docRef, {
      notes: arrayUnion(noteData),
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
