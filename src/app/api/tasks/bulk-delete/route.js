import { adminDb } from '../../../../config/firebase-admin';

// POST - Bulk delete tasks (for cleanup purposes)
export async function POST(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const { userId, taskIds, deleteAll } = await request.json();

    console.log('🗑️ BULK DELETE - Received request');
    console.log('👤 User ID:', userId);
    console.log('📋 Task IDs:', taskIds);
    console.log('💥 Delete All:', deleteAll);

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), { status: 400 });
    }

    let tasksToDelete = [];

    if (deleteAll) {
      // Delete all tasks for the user
      console.log('🔍 Finding all tasks for user...');
      const allTasksSnapshot = await adminDb.collection('tasks')
        .where('assignedTo', '==', userId)
        .get();
      
      tasksToDelete = allTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      }));
      
      console.log(`📊 Found ${tasksToDelete.length} tasks to delete`);
    } else if (taskIds && Array.isArray(taskIds)) {
      // Delete specific tasks
      for (const taskId of taskIds) {
        const taskDoc = await adminDb.collection('tasks').doc(taskId).get();
        if (taskDoc.exists && taskDoc.data().assignedTo === userId) {
          tasksToDelete.push({
            id: taskId,
            title: taskDoc.data().title
          });
        }
      }
    } else {
      return new Response(JSON.stringify({ 
        error: 'Either taskIds array or deleteAll=true is required' 
      }), { status: 400 });
    }

    if (tasksToDelete.length === 0) {
      console.log('ℹ️ No tasks found to delete');
      return new Response(JSON.stringify({
        message: 'No tasks found to delete',
        deletedCount: 0,
        success: true
      }), { status: 200 });
    }

    console.log('🗑️ Starting bulk deletion...');
    
    // Use batch for efficient deletion
    const batch = adminDb.batch();
    
    tasksToDelete.forEach(task => {
      const taskRef = adminDb.collection('tasks').doc(task.id);
      batch.delete(taskRef);
      console.log(`➕ Added to batch: ${task.title} (${task.id})`);
    });

    // Execute batch deletion
    await batch.commit();
    
    console.log(`✅ Successfully deleted ${tasksToDelete.length} tasks`);

    return new Response(JSON.stringify({
      message: `Successfully deleted ${tasksToDelete.length} tasks`,
      deletedCount: tasksToDelete.length,
      deletedTasks: tasksToDelete,
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    return new Response(JSON.stringify({ 
      error: 'Error during bulk delete',
      details: error.message,
      success: false
    }), { status: 500 });
  }
}
