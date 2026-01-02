import { adminDb } from '../../../../config/firebase-admin';
import { verifyAdminAccess, createUnauthorizedResponse } from '../../../../utils/adminAuth';

export async function GET(request) {
  console.log('🔍 Admin help desk API called');
  
  try {
    // Verify admin access
    const verification = await verifyAdminAccess(request);
    if (!verification.authorized) {
      const status = verification.error === 'Missing or invalid authorization header' || 
                     verification.error === 'Invalid or expired token' ? 401 : 403;
      return createUnauthorizedResponse(verification.error, status);
    }
    
    console.log('🔍 Admin access verified for:', verification.user.email);
    
    // Check if Admin SDK is initialized
    if (!adminDb) {
      console.error('❌ Firebase Admin SDK not initialized');
      return new Response(JSON.stringify({ error: 'Firebase Admin SDK not initialized' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Use Firebase Admin SDK to get all documents from the collection
    console.log('🔍 Getting collection reference with Admin SDK...');
    const collectionRef = adminDb.collection('helpDeskTickets');
    
    console.log('🔍 Fetching all documents...');
    const snapshot = await collectionRef.get();
    
    console.log('🔍 Processing documents, count:', snapshot.size);
    const tickets = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      tickets.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('🔍 Final result - tickets:', tickets.length);
    console.log('🔍 Sample ticket:', tickets[0]);
    
    // Always return an array, even if empty
    return new Response(JSON.stringify(tickets), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('❌ Admin API Error:', error);
    
    // Return proper error response for authentication/authorization failures
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return empty array for other errors to prevent frontend issues
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
