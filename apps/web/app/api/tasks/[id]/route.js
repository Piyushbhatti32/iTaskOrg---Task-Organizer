import { adminDb } from '../../../../config/firebase-admin';

// DELETE - Delete a task
export async function DELETE(request, { params }) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { id: taskId } = resolvedParams;

    console.log('🗑️ DELETE /api/tasks/[id] - Received request');
    console.log('📋 Task ID to delete:', taskId);

    if (!taskId) {
      console.error('❌ No task ID provided');
      return new Response(JSON.stringify({ 
        error: 'Task ID is required' 
      }), { status: 400 });
    }

    console.log('🔍 Searching for task in Firestore:', taskId);

    // Delete task from Firestore using Admin SDK
    const taskRef = adminDb.collection('tasks').doc(taskId);
    
    // Check if task exists
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      console.error('❌ Task not found in Firestore:', taskId);
      
      // Show available tasks for debugging
      const allTasksSnapshot = await adminDb.collection('tasks').limit(10).get();
      const existingTaskIds = allTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        assignedTo: doc.data().assignedTo
      }));
      
      console.log('📋 Available tasks in Firestore (first 10):', existingTaskIds);
      
      return new Response(JSON.stringify({ 
        error: 'Task not found',
        requestedTaskId: taskId,
        availableTasks: existingTaskIds
      }), { status: 404 });
    }

    console.log('✅ Task found in Firestore, proceeding with deletion');
    console.log('📄 Task data:', {
      id: taskDoc.id,
      title: taskDoc.data().title,
      assignedTo: taskDoc.data().assignedTo
    });

    // Delete the task
    await taskRef.delete();

    console.log('✅ Task deleted successfully from Firestore:', taskId);

    return new Response(JSON.stringify({
      message: 'Task deleted successfully',
      taskId,
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return new Response(JSON.stringify({ 
      error: 'Error deleting task',
      details: error.message,
      success: false
    }), { status: 500 });
  }
}
