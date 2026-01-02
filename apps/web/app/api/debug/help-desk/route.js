import { collection, getDocs } from 'firebase/firestore';


export async function GET() {
  const { getFirestoreDb } = await import("@/lib/firebase-client");
  const db = getFirestoreDb();
  try {
    console.log('🔍 Debug API: Testing Firebase connection...');
    
    // Test basic connection
    if (!db) {
      return new Response(JSON.stringify({ 
        error: 'Firebase database not initialized',
        db: 'null'
      }), { status: 500 });
    }
    
    console.log('🔍 Firebase db object:', typeof db);
    
    // Try to get all documents without any queries
    console.log('🔍 Attempting to fetch all documents from helpDeskTickets...');
    const collectionRef = collection(db, 'helpDeskTickets');
    console.log('🔍 Collection reference created:', typeof collectionRef);
    
    const snapshot = await getDocs(collectionRef);
    console.log('🔍 Snapshot received, size:', snapshot.size);
    
    const tickets = [];
    snapshot.forEach((doc) => {
      console.log('🔍 Document ID:', doc.id);
      console.log('🔍 Document data:', doc.data());
      tickets.push({ id: doc.id, ...doc.data() });
    });
    
    const result = {
      success: true,
      connectionStatus: 'Connected',
      collectionExists: true,
      documentsFound: snapshot.size,
      tickets: tickets,
      firstTicket: tickets[0] || null
    };
    
    console.log('🔍 Returning result:', result);
    
    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (error) {
    console.error('❌ Debug API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Debug API failed',
      message: error.message,
      stack: error.stack
    }), { status: 500 });
  }
}
