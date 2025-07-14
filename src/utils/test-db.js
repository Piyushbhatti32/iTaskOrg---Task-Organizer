import {
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getUserTasks,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeam,
  addTeamMember,
  removeTeamMember,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
  addGroupMember,
  removeGroupMember,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessage,
  markMessageAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotification,
  markNotificationAsRead,
  getUserNotifications
} from './db';

/**
 * Test task operations
 */
export const testTaskOperations = async (userId) => {
  try {
    console.log('🧪 Testing task operations...');
    
    // Step 1: Create task
    console.log('Step 1: Creating task...');
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      priority: 'medium',
      createdBy: userId,
      assignedTo: userId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };
    const taskRef = await createTask(taskData);
    console.log('✅ Task created successfully:', taskRef.id);
    
    // Step 2: Get task
    console.log('Step 2: Getting task...');
    const task = await getTask(taskRef.id);
    console.log('✅ Task retrieved successfully:', task);
    
    // Step 3: Update task
    console.log('Step 3: Updating task...');
    await updateTask(taskRef.id, {
      status: 'in_progress',
      description: 'Updated test task description'
    });
    console.log('✅ Task updated successfully');
    
    // Step 4: Get user tasks
    console.log('Step 4: Getting user tasks...');
    const userTasks = await getUserTasks(userId);
    console.log('✅ User tasks retrieved successfully:', userTasks.length, 'tasks');
    
    // Step 5: Delete task
    console.log('Step 5: Deleting task...');
    await deleteTask(taskRef.id);
    console.log('✅ Task deleted successfully');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Task operations test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test team operations
 */
export const testTeamOperations = async (userId) => {
  try {
    console.log('🧪 Testing team operations...');
    
    // Step 1: Create team
    console.log('Step 1: Creating team...');
    const teamData = {
      name: 'Test Team',
      description: 'This is a test team',
      createdBy: userId,
      members: {},
      settings: {
        isPrivate: false,
        allowMemberInvites: true
      }
    };
    const teamRef = await createTeam(teamData);
    console.log('✅ Team created successfully:', teamRef.id);
    
    // Step 2: Get team
    console.log('Step 2: Getting team...');
    const team = await getTeam(teamRef.id);
    console.log('✅ Team retrieved successfully:', team);
    
    // Step 3: Add team member
    console.log('Step 3: Adding team member...');
    await addTeamMember(teamRef.id, userId, 'leader');
    console.log('✅ Team member added successfully');
    
    // Step 4: Update team
    console.log('Step 4: Updating team...');
    await updateTeam(teamRef.id, {
      description: 'Updated test team description'
    });
    console.log('✅ Team updated successfully');
    
    // Step 5: Remove team member
    console.log('Step 5: Removing team member...');
    await removeTeamMember(teamRef.id, userId);
    console.log('✅ Team member removed successfully');
    
    // Step 6: Delete team
    console.log('Step 6: Deleting team...');
    await deleteTeam(teamRef.id);
    console.log('✅ Team deleted successfully');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Team operations test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test group operations
 */
export const testGroupOperations = async (userId) => {
  try {
    console.log('🧪 Testing group operations...');
    
    // Step 1: Create group
    console.log('Step 1: Creating group...');
    const groupData = {
      name: 'Test Group',
      description: 'This is a test group',
      createdBy: userId,
      members: {},
      settings: {
        isPrivate: false,
        allowMemberInvites: true
      }
    };
    const groupRef = await createGroup(groupData);
    console.log('✅ Group created successfully:', groupRef.id);
    
    // Step 2: Get group
    console.log('Step 2: Getting group...');
    const group = await getGroup(groupRef.id);
    console.log('✅ Group retrieved successfully:', group);
    
    // Step 3: Add group member
    console.log('Step 3: Adding group member...');
    await addGroupMember(groupRef.id, userId, 'admin');
    console.log('✅ Group member added successfully');
    
    // Step 4: Update group
    console.log('Step 4: Updating group...');
    await updateGroup(groupRef.id, {
      description: 'Updated test group description'
    });
    console.log('✅ Group updated successfully');
    
    // Step 5: Remove group member
    console.log('Step 5: Removing group member...');
    await removeGroupMember(groupRef.id, userId);
    console.log('✅ Group member removed successfully');
    
    // Step 6: Delete group
    console.log('Step 6: Deleting group...');
    await deleteGroup(groupRef.id);
    console.log('✅ Group deleted successfully');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Group operations test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test message operations
 */
export const testMessageOperations = async (userId) => {
  try {
    console.log('🧪 Testing message operations...');
    
    // Step 1: Create message
    console.log('Step 1: Creating message...');
    const messageData = {
      content: 'Test message',
      createdBy: userId,
      type: 'text'
    };
    const messageRef = await createMessage(messageData);
    console.log('✅ Message created successfully:', messageRef.id);
    
    // Step 2: Get message
    console.log('Step 2: Getting message...');
    const message = await getMessage(messageRef.id);
    console.log('✅ Message retrieved successfully:', message);
    
    // Step 3: Update message
    console.log('Step 3: Updating message...');
    await updateMessage(messageRef.id, {
      content: 'Updated test message'
    });
    console.log('✅ Message updated successfully');
    
    // Step 4: Mark message as read
    console.log('Step 4: Marking message as read...');
    await markMessageAsRead(messageRef.id, userId);
    console.log('✅ Message marked as read successfully');
    
    // Step 5: Delete message
    console.log('Step 5: Deleting message...');
    await deleteMessage(messageRef.id);
    console.log('✅ Message deleted successfully');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Message operations test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test notification operations
 */
export const testNotificationOperations = async (userId) => {
  try {
    console.log('🧪 Testing notification operations...');
    
    // Step 1: Create notification
    console.log('Step 1: Creating notification...');
    const notificationData = {
      userId,
      title: 'Test Notification',
      content: 'This is a test notification',
      type: 'system'
    };
    const notificationRef = await createNotification(notificationData);
    console.log('✅ Notification created successfully:', notificationRef.id);
    
    // Step 2: Get notification
    console.log('Step 2: Getting notification...');
    const notification = await getNotification(notificationRef.id);
    console.log('✅ Notification retrieved successfully:', notification);
    
    // Step 3: Get user notifications
    console.log('Step 3: Getting user notifications...');
    const notifications = await getUserNotifications(userId);
    console.log('✅ User notifications retrieved successfully:', notifications.length, 'notifications');
    
    // Step 4: Mark notification as read
    console.log('Step 4: Marking notification as read...');
    await markNotificationAsRead(notificationRef.id);
    console.log('✅ Notification marked as read successfully');
    
    // Step 5: Delete notification
    console.log('Step 5: Deleting notification...');
    await deleteNotification(notificationRef.id);
    console.log('✅ Notification deleted successfully');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Notification operations test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run all database tests
 */
export const runDatabaseTests = async (userId) => {
  console.log('🧪 Starting database tests...\n');
  
  // Test 1: Task Operations
  console.log('Test 1: Task Operations');
  const taskResult = await testTaskOperations(userId);
  console.log('Task operations result:', taskResult);
  console.log('\n---\n');
  
  // Test 2: Team Operations
  console.log('Test 2: Team Operations');
  const teamResult = await testTeamOperations(userId);
  console.log('Team operations result:', teamResult);
  console.log('\n---\n');
  
  // Test 3: Group Operations
  console.log('Test 3: Group Operations');
  const groupResult = await testGroupOperations(userId);
  console.log('Group operations result:', groupResult);
  console.log('\n---\n');
  
  // Test 4: Message Operations
  console.log('Test 4: Message Operations');
  const messageResult = await testMessageOperations(userId);
  console.log('Message operations result:', messageResult);
  console.log('\n---\n');
  
  // Test 5: Notification Operations
  console.log('Test 5: Notification Operations');
  const notificationResult = await testNotificationOperations(userId);
  console.log('Notification operations result:', notificationResult);
  
  console.log('\n🧪 Database tests completed');
}; 