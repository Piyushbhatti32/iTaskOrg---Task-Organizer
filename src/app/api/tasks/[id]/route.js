import { adminDb } from '../../../../config/firebase-admin';

// DELETE - Delete a task
export async function DELETE(request, { params }) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const { id: taskId } = params;

    if (!taskId) {
      return new Response(JSON.stringify({ 
        error: 'Task ID is required' 
      }), { status: 400 });
    }

    console.log('Deleting task:', taskId);

    // Delete task from Firestore using Admin SDK
    const taskRef = adminDb.collection('tasks').doc(taskId);
    
    // Check if task exists
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return new Response(JSON.stringify({ 
        error: 'Task not found' 
      }), { status: 404 });
    }

    // Delete the task
    await taskRef.delete();

    console.log('Task deleted successfully:', taskId);

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
