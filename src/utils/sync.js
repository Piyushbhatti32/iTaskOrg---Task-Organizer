'use client';

import { auth } from '../config/firebase';

/**
 * Sync utilities to resolve state mismatches between local and Firestore
 */
export const syncUtilities = {
  /**
   * Compare local tasks with Firestore and resolve differences
   */
  async syncTasksWithFirestore(localTasks = []) {
    const user = auth?.currentUser;
    if (!user) {
      console.error('❌ No authenticated user for sync');
      return { success: false, error: 'No authenticated user' };
    }

    try {
      console.group('🔄 Starting Task Sync');
      console.log('📍 Local tasks count:', localTasks.length);
      
      // Fetch current tasks from Firestore
      const response = await fetch(`/api/tasks?userId=${user.uid}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tasks from server');
      }

      const firestoreTasks = result.tasks || [];
      console.log('🌐 Firestore tasks count:', firestoreTasks.length);

      // Find mismatches
      const localOnlyTasks = localTasks.filter(localTask => 
        !firestoreTasks.some(firestoreTask => firestoreTask.id === localTask.id)
      );
      
      const firestoreOnlyTasks = firestoreTasks.filter(firestoreTask => 
        !localTasks.some(localTask => localTask.id === firestoreTask.id)
      );

      console.log('📊 Sync Analysis:', {
        localOnlyCount: localOnlyTasks.length,
        firestoreOnlyCount: firestoreOnlyTasks.length,
        localOnlyTasks: localOnlyTasks.map(t => ({ id: t.id, title: t.title })),
        firestoreOnlyTasks: firestoreOnlyTasks.map(t => ({ id: t.id, title: t.title }))
      });

      const syncActions = {
        tasksToRemoveFromLocal: localOnlyTasks,
        tasksToAddToLocal: firestoreOnlyTasks,
        syncedTasks: firestoreTasks
      };

      console.groupEnd();
      return { success: true, ...syncActions };
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      console.groupEnd();
      return { success: false, error: error.message };
    }
  },

  /**
   * Force sync local state to match Firestore exactly
   */
  async forceSync() {
    const user = auth?.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      console.log('🔄 Force syncing with Firestore...');
      
      const response = await fetch(`/api/tasks?userId=${user.uid}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tasks');
      }

      console.log('✅ Force sync completed. Firestore has', result.tasks?.length || 0, 'tasks');
      return result.tasks || [];
      
    } catch (error) {
      console.error('❌ Force sync failed:', error);
      throw error;
    }
  },

  /**
   * Clean up orphaned local tasks (tasks that don't exist in Firestore)
   */
  async cleanupOrphanedTasks(localTasks = []) {
    const syncResult = await this.syncTasksWithFirestore(localTasks);
    
    if (!syncResult.success) {
      return syncResult;
    }

    const orphanedTasks = syncResult.tasksToRemoveFromLocal;
    
    if (orphanedTasks.length > 0) {
      console.log('🧹 Found', orphanedTasks.length, 'orphaned tasks to clean up');
      return {
        success: true,
        orphanedTasks,
        cleanTasks: syncResult.syncedTasks,
        message: `Cleaned up ${orphanedTasks.length} orphaned tasks`
      };
    }

    return {
      success: true,
      orphanedTasks: [],
      cleanTasks: syncResult.syncedTasks,
      message: 'No orphaned tasks found'
    };
  },

  /**
   * Attempt to recover missing tasks by recreating them in Firestore
   */
  async recoverMissingTasks(localTasks = []) {
    const user = auth?.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const syncResult = await this.syncTasksWithFirestore(localTasks);
    
    if (!syncResult.success) {
      return syncResult;
    }

    const missingTasks = syncResult.tasksToRemoveFromLocal;
    const recoveredTasks = [];
    const failedTasks = [];

    console.group('🔧 Attempting to recover missing tasks');
    
    for (const task of missingTasks) {
      try {
        console.log(`🔄 Recovering task: ${task.title} (${task.id})`);
        
        // Create task in Firestore with the same ID
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...task,
            userId: user.uid,
            // Remove client-side only fields
            id: undefined // Let server generate new ID
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log(`✅ Recovered: ${task.title}`);
          recoveredTasks.push(result.task);
        } else {
          console.error(`❌ Failed to recover: ${task.title}`, result.error);
          failedTasks.push({ task, error: result.error });
        }
        
      } catch (error) {
        console.error(`❌ Error recovering: ${task.title}`, error);
        failedTasks.push({ task, error: error.message });
      }
    }

    console.groupEnd();

    return {
      success: true,
      recoveredCount: recoveredTasks.length,
      failedCount: failedTasks.length,
      recoveredTasks,
      failedTasks,
      message: `Recovered ${recoveredTasks.length}/${missingTasks.length} tasks`
    };
  }
};

/**
 * Auto-fix function that tries to resolve common sync issues
 */
export const autoFixTaskSync = async (localTasks = []) => {
  console.group('🔧 Auto-fixing task synchronization');
  
  try {
    // Step 1: Analyze the sync state
    const syncResult = await syncUtilities.syncTasksWithFirestore(localTasks);
    
    if (!syncResult.success) {
      console.groupEnd();
      return { success: false, error: syncResult.error };
    }

    // Step 2: If there are local-only tasks, try to recover them
    let recoveryResult = null;
    if (syncResult.tasksToRemoveFromLocal.length > 0) {
      console.log('🔄 Found tasks that exist locally but not in Firestore. Attempting recovery...');
      recoveryResult = await syncUtilities.recoverMissingTasks(localTasks);
    }

    // Step 3: Return the synchronized state
    const finalTasks = await syncUtilities.forceSync();
    
    console.log('✅ Auto-fix completed successfully');
    console.groupEnd();

    return {
      success: true,
      syncedTasks: finalTasks,
      recoveryResult,
      message: 'Task synchronization completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
    console.groupEnd();
    return { success: false, error: error.message };
  }
};
