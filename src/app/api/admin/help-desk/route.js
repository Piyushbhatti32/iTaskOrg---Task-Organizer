import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

export async function GET() {
  console.log('🔍 Admin API called');
  
  try {
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
    
    // Return empty array instead of error object to prevent frontend issues
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
