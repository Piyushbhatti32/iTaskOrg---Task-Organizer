import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { adminAuth } from '../../../../config/firebase-admin';
import { NextRequest } from 'next/server';

export async function GET(request) {
  console.log('🔍 Admin API called');
  
  try {
    // Verify authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const adminEmails = [
      'itaskorg@gmail.com',
      'itaskorg+admin@gmail.com', 
      'itaskorg+support@gmail.com',
      'piyushbhatti32@gmail.com'
    ];
    if (!adminEmails.includes(decodedToken.email?.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('🔍 Admin access verified for:', decodedToken.email);
    
    // Simple approach: just get all documents from the collection
    console.log('🔍 Getting collection reference...');
    const collectionRef = collection(db, 'helpDeskTickets');
    
    console.log('🔍 Fetching all documents...');
    const snapshot = await getDocs(collectionRef);
    
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
