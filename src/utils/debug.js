// Debug utilities for tracking task state issues
'use client';

import { auth } from '../config/firebase';

export const debugTaskState = {
  /**
   * Log current task state for debugging
   */
  logTaskState: (tasks, context = '') => {
    const user = auth?.currentUser;
    console.group(`🐛 Task State Debug ${context ? `- ${context}` : ''}`);
    console.log('👤 Current user:', {
      uid: user?.uid,
      email: user?.email,
      authenticated: !!user
    });
    console.log('📊 Total tasks:', tasks?.length || 0);
    console.log('📋 Task summary:', tasks?.map(t => ({
      id: t.id,
      title: t.title?.substring(0, 30) + (t.title?.length > 30 ? '...' : ''),
      completed: t.completed,
      assignedTo: t.assignedTo
    })) || []);
    console.groupEnd();
  },

  /**
   * Log task operation attempts
   */
  logTaskOperation: (operation, taskId, taskExists = null) => {
    console.group(`🔧 Task Operation: ${operation}`);
    console.log('🎯 Target task ID:', taskId);
    console.log('📍 Task exists locally:', taskExists);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();
  },

  /**
   * Validate task ID format
   */
  validateTaskId: (taskId) => {
    const isValid = typeof taskId === 'string' && taskId.length > 0;
    if (!isValid) {
      console.error('❌ Invalid task ID:', {
        taskId,
        type: typeof taskId,
        length: taskId?.length
      });
    }
    return isValid;
  },

  /**
   * Compare local and server task states
   */
  compareTaskStates: (localTask, serverTask) => {
    console.group('🔄 Task State Comparison');
    console.log('📍 Local task:', localTask);
    console.log('🌐 Server task:', serverTask);
    
    if (localTask && serverTask) {
      const differences = {};
      Object.keys(localTask).forEach(key => {
        if (localTask[key] !== serverTask[key]) {
          differences[key] = {
            local: localTask[key],
            server: serverTask[key]
          };
        }
      });
      console.log('🔍 Differences found:', differences);
    }
    console.groupEnd();
  },

  /**
   * Log API request/response for debugging
   */
  logApiCall: async (url, options, context = '') => {
    console.group(`🌐 API Call ${context ? `- ${context}` : ''}`);
    console.log('📡 URL:', url);
    console.log('⚙️ Options:', options);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      console.log('📊 Response:', {
        status: response.status,
        ok: response.ok,
        duration: `${duration}ms`
      });
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      console.groupEnd();
      
      // Return both response and data for further use
      return { response: { ...response, ok: response.ok, status: response.status }, data };
    } catch (error) {
      console.error('❌ API call failed:', error);
      console.groupEnd();
      throw error;
    }
  },

  /**
   * Create a task state snapshot for debugging
   */
  createSnapshot: (tasks, context = '') => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      context,
      user: {
        uid: auth?.currentUser?.uid,
        email: auth?.currentUser?.email
      },
      taskCount: tasks?.length || 0,
      tasks: tasks?.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        assignedTo: t.assignedTo,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      })) || []
    };
    
    console.log('📸 Task State Snapshot:', snapshot);
    return snapshot;
  }
};

// Enhanced error handler for task operations
export const handleTaskError = (error, operation, taskId = null) => {
  console.group(`❌ Task Error Handler - ${operation}`);
  console.error('🚨 Error occurred:', error);
  console.log('🎯 Operation:', operation);
  console.log('📋 Task ID:', taskId);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('👤 User:', {
    uid: auth?.currentUser?.uid,
    email: auth?.currentUser?.email
  });
  
  // Log error details
  if (error.message) console.log('💬 Message:', error.message);
  if (error.stack) console.log('📚 Stack:', error.stack);
  
  console.groupEnd();
  
  // Return a user-friendly error message
  const friendlyMessages = {
    'toggleTaskCompletion': 'Failed to update task completion status. Please try again.',
    'updateTask': 'Failed to update task. Please check your connection and try again.',
    'deleteTask': 'Failed to delete task. Please try again.',
    'addTask': 'Failed to create task. Please check your input and try again.',
    'loadTasks': 'Failed to load tasks. Please refresh the page.'
  };
  
  return friendlyMessages[operation] || 'An unexpected error occurred. Please try again.';
};
