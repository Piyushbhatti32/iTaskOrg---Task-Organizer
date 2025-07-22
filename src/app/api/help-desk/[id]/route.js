import { adminDb } from '../../../../config/firebase-admin';
import { updateDocument, deleteDocument } from '../../../../utils/db';

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
    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ message: 'Ticket updated successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return new Response(JSON.stringify({ error: 'Error updating ticket' }), { status: 500 });
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
