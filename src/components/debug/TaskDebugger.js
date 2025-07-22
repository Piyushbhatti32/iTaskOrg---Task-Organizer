'use client';

import React, { useState, useEffect } from 'react';
import { useTasks, useStore } from '../../store';
import { debugTaskState } from '../../utils/debug';
import { syncUtilities, autoFixTaskSync } from '../../utils/sync';
import { auth } from '../../config/firebase';

/**
 * TaskDebugger Component - Only for development debugging
 * Shows current task state, user info, and provides debugging tools
 */
const TaskDebugger = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  // Ensure the debugger is never shown in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const tasks = useTasks();
  const [expanded, setExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        debugTaskState.logTaskState(tasks, 'Auto Refresh');
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, tasks]);

  if (!enabled) return null;

  const handleLogState = () => {
    debugTaskState.logTaskState(tasks, 'Manual Log');
  };

  const handleCreateSnapshot = () => {
    const snapshot = debugTaskState.createSnapshot(tasks, 'Manual Snapshot');
    // Store snapshot in sessionStorage for later analysis
    const snapshots = JSON.parse(sessionStorage.getItem('taskSnapshots') || '[]');
    snapshots.push(snapshot);
    sessionStorage.setItem('taskSnapshots', JSON.stringify(snapshots.slice(-10))); // Keep last 10
  };

  const handleClearSnapshots = () => {
    sessionStorage.removeItem('taskSnapshots');
    console.log('📸 Task snapshots cleared');
  };

  const handleValidateTaskIds = () => {
    tasks.forEach(task => {
      debugTaskState.validateTaskId(task.id);
    });
  };

  const handleTestApiConnection = async () => {
    if (!user) {
      console.error('❌ No authenticated user for API test');
      return;
    }

    try {
      console.group('🧪 API Connection Test');
      const response = await fetch(`/api/tasks?userId=${user.uid}`);
      const data = await response.json();
      
      console.log('✅ API Response:', {
        status: response.status,
        ok: response.ok,
        taskCount: data.tasks?.length || 0
      });
      
      debugTaskState.compareTaskStates(
        { taskCount: tasks.length, taskIds: tasks.map(t => t.id) },
        { taskCount: data.tasks?.length || 0, taskIds: data.tasks?.map(t => t.id) || [] }
      );
      console.groupEnd();
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
  };

  const handleSyncTasks = async () => {
    if (!user) {
      console.error('❌ No authenticated user for sync');
      return;
    }

    try {
      console.log('🔄 Starting task synchronization...');
      const result = await syncUtilities.syncTasksWithFirestore(tasks);
      
      if (result.success) {
        console.log('✅ Sync analysis completed:', result);
        
        if (result.tasksToRemoveFromLocal.length > 0) {
          console.warn(`⚠️  Found ${result.tasksToRemoveFromLocal.length} orphaned local tasks`);
        }
        
        if (result.tasksToAddToLocal.length > 0) {
          console.warn(`⚠️  Found ${result.tasksToAddToLocal.length} missing local tasks`);
        }
      } else {
        console.error('❌ Sync failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
    }
  };

  const handleAutoFixSync = async () => {
    if (!user) {
      console.error('❌ No authenticated user for auto-fix');
      return;
    }

    try {
      console.log('🔧 Starting auto-fix synchronization...');
      const result = await autoFixTaskSync(tasks);
      
      if (result.success) {
        console.log('✅ Auto-fix completed successfully:', result);
        
        // Update the store with synced tasks
        useStore.getState().loadAllUserData(user.uid);
        
        console.log('🔄 Local state refreshed from Firestore');
      } else {
        console.error('❌ Auto-fix failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Auto-fix error:', error);
    }
  };

  const handleForceSync = async () => {
    if (!user) {
      console.error('❌ No authenticated user for force sync');
      return;
    }

    try {
      console.log('⚡ Force syncing with Firestore...');
      const firestoreTasks = await syncUtilities.forceSync();
      
      // Update local state
      useStore.setState({ tasks: firestoreTasks });
      
      console.log('✅ Force sync completed. Local state updated with', firestoreTasks.length, 'tasks');
    } catch (error) {
      console.error('❌ Force sync failed:', error);
    }
  };

  const handleClearLocalStorage = () => {
    console.group('🧨 NUCLEAR: Clearing Local Storage');
    
    // Clear all localStorage
    localStorage.clear();
    console.log('✅ localStorage cleared');
    
    // Clear sessionStorage too
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
    
    // Reset Zustand store to initial state
    useStore.getState().reset();
    console.log('✅ Store reset to initial state');
    
    console.log('⚠️ Page reload required for full reset');
    console.groupEnd();
    
    // Ask user if they want to reload
    if (confirm('Local storage cleared! Reload page to complete reset?')) {
      window.location.reload();
    }
  };

  const handleClearTasksOnly = async () => {
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }

    console.group('🗑️ Clearing Local Tasks Only');
    
    try {
      // Clear tasks from store
      useStore.setState({ tasks: [] });
      console.log('✅ Local tasks cleared from store');
      
      // Force reload from Firestore
      await useStore.getState().loadAllUserData(user.uid);
      console.log('✅ Reloaded tasks from Firestore');
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error clearing tasks:', error);
      console.groupEnd();
    }
  };

  const handleResetAndSync = async () => {
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }

    console.group('🔄 NUCLEAR RESET AND SYNC');
    
    try {
      // Step 1: Clear local tasks
      console.log('Step 1: Clearing local tasks...');
      useStore.setState({ tasks: [] });
      
      // Step 2: Clear relevant localStorage keys
      console.log('Step 2: Clearing task-related storage...');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('task') || key.includes('itaskorg'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('✅ Removed keys:', keysToRemove);
      
      // Step 3: Force reload from Firestore
      console.log('Step 3: Reloading from Firestore...');
      await useStore.getState().loadAllUserData(user.uid);
      
      console.log('✅ Nuclear reset completed successfully!');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Nuclear reset failed:', error);
      console.groupEnd();
    }
  };

  const handleBulkDeleteTasks = async () => {
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }

    if (!confirm('⚠️ This will DELETE ALL TASKS from Firestore permanently! Are you sure?')) {
      return;
    }

    console.group('🗑️ BULK DELETE ALL TASKS');
    
    try {
      console.log('🗑️ Starting bulk delete...');
      
      const response = await fetch('/api/tasks/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          deleteAll: true
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Bulk delete successful:', result);
        console.log(`🗑️ Deleted ${result.deletedCount} tasks`);
        
        // Clear local state
        useStore.setState({ tasks: [] });
        
        console.log('✅ All tasks deleted from Firestore and local state cleared');
      } else {
        console.error('❌ Bulk delete failed:', result);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Bulk delete error:', error);
      console.groupEnd();
    }
  };

  const handleDeleteSpecificTask = async (taskId) => {
    if (!user || !taskId) {
      console.error('❌ Missing user or task ID');
      return;
    }

    console.group(`🗑️ DELETE SPECIFIC TASK: ${taskId}`);
    
    try {
      console.log('🗑️ Attempting to delete task...');
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Task deleted successfully:', result);
        
        // Remove from local state
        useStore.setState(state => ({
          tasks: state.tasks.filter(t => t.id !== taskId)
        }));
        
        console.log('✅ Task removed from local state');
      } else {
        console.error('❌ Task delete failed:', result);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Task delete error:', error);
      console.groupEnd();
    }
  };

  const styles = {
    debugger: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      backgroundColor: '#000',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '12px',
      border: '2px solid #0f0',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '300px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      paddingBottom: '10px',
      borderBottom: '1px solid #0f0'
    },
    button: {
      backgroundColor: '#333',
      color: '#0f0',
      border: '1px solid #0f0',
      padding: '4px 8px',
      margin: '2px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '10px'
    },
    info: {
      marginBottom: '8px'
    },
    taskList: {
      maxHeight: '200px',
      overflow: 'auto',
      backgroundColor: '#111',
      padding: '8px',
      borderRadius: '4px',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.debugger}>
      <div style={styles.header}>
        <strong>🐛 Task Debugger</strong>
        <button 
          style={styles.button} 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <>
          <div style={styles.info}>
            <strong>User:</strong> {user ? `${user.email} (${user.uid.slice(0, 8)}...)` : 'Not authenticated'}
          </div>
          
          <div style={styles.info}>
            <strong>Tasks:</strong> {tasks.length} total
          </div>
          
          <div style={styles.info}>
            <strong>Completed:</strong> {tasks.filter(t => t.completed).length}
          </div>
          
          <div style={styles.info}>
            <strong>Pending:</strong> {tasks.filter(t => !t.completed).length}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <button style={styles.button} onClick={handleLogState}>
              📝 Log State
            </button>
            <button style={styles.button} onClick={handleCreateSnapshot}>
              📸 Snapshot
            </button>
            <button style={styles.button} onClick={handleValidateTaskIds}>
              ✅ Validate IDs
            </button>
            <button style={styles.button} onClick={handleTestApiConnection}>
              🌐 Test API
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ margin: 0 }}
              />
              Auto-refresh logs (5s)
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <button style={styles.button} onClick={handleClearSnapshots}>
              🗑️ Clear Snapshots
            </button>
            <button style={styles.button} onClick={() => console.clear()}>
              🧹 Clear Console
            </button>
          </div>

          {/* Sync Tools */}
          <div style={{ marginBottom: '10px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', marginBottom: '5px', color: '#0f0' }}>
              <strong>🔄 SYNC TOOLS</strong>
            </div>
            <button style={styles.button} onClick={handleSyncTasks}>
              🔍 Analyze Sync
            </button>
            <button style={styles.button} onClick={handleAutoFixSync}>
              🔧 Auto Fix
            </button>
            <button style={styles.button} onClick={handleForceSync}>
              ⚡ Force Sync
            </button>
          </div>

          {/* Delete Options */}
          <div style={{ marginBottom: '10px', borderTop: '1px solid #ff0', paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', marginBottom: '5px', color: '#ff0' }}>
              <strong>🗑️ DELETE OPTIONS</strong>
            </div>
            <button 
              style={{...styles.button, color: '#ff0', borderColor: '#ff0'}} 
              onClick={handleBulkDeleteTasks}
            >
              💥 Delete ALL Tasks
            </button>
          </div>

          {/* Nuclear Options */}
          <div style={{ marginBottom: '10px', borderTop: '1px solid #f00', paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', marginBottom: '5px', color: '#f00' }}>
              <strong>🧨 NUCLEAR OPTIONS</strong>
            </div>
            <button 
              style={{...styles.button, color: '#f00', borderColor: '#f00'}} 
              onClick={handleClearTasksOnly}
            >
              🗑️ Clear Tasks
            </button>
            <button 
              style={{...styles.button, color: '#f00', borderColor: '#f00'}} 
              onClick={handleResetAndSync}
            >
              🔄 Nuclear Reset
            </button>
            <button 
              style={{...styles.button, color: '#f00', borderColor: '#f00'}} 
              onClick={handleClearLocalStorage}
            >
              🧨 Clear All Storage
            </button>
          </div>

          {tasks.length > 0 && (
            <div style={styles.taskList}>
              <strong>Task IDs:</strong>
              {tasks.slice(0, 10).map((task, index) => (
                <div key={task.id} style={{ 
                  fontSize: '10px', 
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {index + 1}. {task.id} - {task.title?.substring(0, 20)}...
                  </span>
                  <button
                    onClick={() => handleDeleteSpecificTask(task.id)}
                    style={{
                      ...styles.button,
                      color: '#ff0',
                      borderColor: '#ff0',
                      fontSize: '8px',
                      padding: '2px 4px',
                      margin: 0,
                      minWidth: 'auto'
                    }}
                    title={`Delete task: ${task.title}`}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {tasks.length > 10 && (
                <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                  ... and {tasks.length - 10} more (use bulk delete for all)
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskDebugger;
