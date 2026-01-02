// Firestore data models and relationships for iTaskOrg

/**
 * User Model
 * Collection: 'users'
 * This extends the Firebase Auth user with additional profile data
 */
const userModel = {
  id: 'string', // Firebase Auth UID
  email: 'string',
  displayName: 'string',
  photoURL: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  settings: {
    theme: 'string',
    notifications: 'boolean',
    emailPreferences: {
      taskReminders: 'boolean',
      teamUpdates: 'boolean',
      dailyDigest: 'boolean'
    }
  },
  teams: ['teamId'], // References to teams
  groups: ['groupId'] // References to groups
};

/**
 * Task Model
 * Collection: 'tasks'
 */
const taskModel = {
  id: 'string', // Auto-generated
  title: 'string',
  description: 'string',
  status: 'string', // ['pending', 'in_progress', 'completed', 'archived']
  priority: 'string', // ['low', 'medium', 'high']
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  dueDate: 'timestamp',
  createdBy: 'userId', // Reference to user
  assignedTo: 'userId', // Reference to user
  teamId: 'string?', // Optional reference to team
  groupId: 'string?', // Optional reference to group
  parentTaskId: 'string?', // Optional reference to parent task (for subtasks)
  subtasks: ['taskId'], // References to subtasks
  tags: ['string'],
  attachments: [{
    url: 'string',
    name: 'string',
    type: 'string',
    uploadedAt: 'timestamp'
  }],
  comments: [{
    id: 'string',
    content: 'string',
    createdBy: 'userId',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  }]
};

/**
 * Team Model
 * Collection: 'teams'
 */
const teamModel = {
  id: 'string', // Auto-generated
  name: 'string',
  description: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  createdBy: 'userId', // Reference to user
  avatar: 'string', // URL to team avatar
  members: [{
    userId: 'string',
    role: 'string', // ['leader', 'member']
    joinedAt: 'timestamp'
  }],
  settings: {
    isPrivate: 'boolean',
    allowMemberInvites: 'boolean'
  }
};

/**
 * Group Model
 * Collection: 'groups'
 */
const groupModel = {
  id: 'string', // Auto-generated
  name: 'string',
  description: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  createdBy: 'userId', // Reference to user
  teamId: 'string?', // Optional reference to team
  members: [{
    userId: 'string',
    role: 'string', // ['admin', 'member']
    joinedAt: 'timestamp'
  }],
  settings: {
    isPrivate: 'boolean',
    allowMemberInvites: 'boolean'
  }
};

/**
 * Message Model
 * Collection: 'messages'
 */
const messageModel = {
  id: 'string', // Auto-generated
  content: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  createdBy: 'userId', // Reference to user
  teamId: 'string?', // Optional reference to team
  groupId: 'string?', // Optional reference to group
  type: 'string', // ['text', 'file', 'system']
  attachments: [{
    url: 'string',
    name: 'string',
    type: 'string'
  }],
  readBy: [{
    userId: 'string',
    readAt: 'timestamp'
  }]
};

/**
 * Notification Model
 * Collection: 'notifications'
 */
const notificationModel = {
  id: 'string', // Auto-generated
  userId: 'string', // Reference to user
  title: 'string',
  content: 'string',
  type: 'string', // ['task', 'team', 'group', 'system']
  status: 'string', // ['unread', 'read']
  createdAt: 'timestamp',
  data: {
    // Dynamic data based on notification type
    taskId: 'string?',
    teamId: 'string?',
    groupId: 'string?',
    messageId: 'string?'
  },
  link: 'string?' // Optional link to redirect when clicked
};

/**
 * Help Desk Ticket Model
 * Collection: 'helpDeskTickets'
 */
const helpDeskTicketModel = {
  id: 'string', // Auto-generated
  title: 'string',
  description: 'string',
  category: 'string', // ['general', 'bug', 'feature', 'account', 'performance', 'security']
  priority: 'string', // ['low', 'medium', 'high', 'urgent']
  status: 'string', // ['open', 'in-progress', 'resolved', 'closed']
  userId: 'string', // Reference to user who created the ticket
  userEmail: 'string',
  userName: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  resolvedAt: 'timestamp?', // Optional timestamp when ticket was resolved
  closedAt: 'timestamp?', // Optional timestamp when ticket was closed
  assignedTo: 'string?', // Optional reference to admin/support user
  responses: [{
    id: 'string',
    content: 'string',
    createdBy: 'userId', // Reference to user (could be customer or support)
    createdAt: 'timestamp',
    isStaffResponse: 'boolean' // true if response is from support staff
  }],
  attachments: [{
    url: 'string',
    name: 'string',
    type: 'string',
    uploadedAt: 'timestamp'
  }],
  tags: ['string'], // Optional tags for categorization
  resolution: 'string?' // Optional resolution details
};

export {
  userModel,
  taskModel,
  teamModel,
  groupModel,
  messageModel,
  notificationModel,
  helpDeskTicketModel
};
