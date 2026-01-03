'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  createTask, 
  updateTask, 
  deleteTask, 
  getUserTasks,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getUserTemplates,
  createOrUpdateUserSettings,
  getUserSettings,
  updateUserSettings,
  createOrUpdateUserProfile,
  getUserProfile
} from './utils/db';
import { useMemo } from 'react';
import { getFirebaseAuth } from "./lib/firebase-client";

// TypeScript interfaces
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  subtasks?: Subtask[];
  completedPomodoros?: number;
  userId?: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  taskTitle: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  userId?: string;
}

interface Settings {
  theme: string;
  accentColor: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface Profile {
  name: string;
  email: string;
  bio?: string;
  timezone: string;
  avatar?: string;
  joinDate?: string;
  lastSignIn?: string;
  emailVerified: boolean;
  providerId: string;
  streak: number;
  level: string;
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    completionRate: number;
    weeklyProgress: number[];
    monthlyProgress: number[];
  };
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  tasks: string[];
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedTasks: string[];
  joinedAt: string;
}

interface Team {
  id: string;
  name?: string;
  description?: string;
  members?: string[];
  createdAt?: string;
  // Add more fields as needed
}

interface StoreState {
  tasks: Task[];
  templates: Template[];
  groups: Group[];
  members: Member[];
  teams: Team[];
  settings: Settings;
  profile: Profile;
}

interface StoreActions {
  // Task actions
  addTask: (taskData: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (updatedTask: Task) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  addSubtask: (taskId: string, subtaskTitle: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Template actions
  addTemplate: (userId: string, templateData: Omit<Template, 'id' | 'createdAt' | 'userId'>) => Promise<Template>;
  updateTemplate: (updatedTemplate: Template) => Promise<Template>;
  deleteTemplate: (templateId: string) => Promise<void>;

  // Settings actions
  updateSettings: (userId: string, newSettings: Partial<Settings>) => Promise<void>;

  // Profile actions
  updateProfile: (newProfile: Partial<Profile>) => void;
  updateProfileAsync: (userId: string, newProfile: Partial<Profile>) => Promise<void>;

  // Group actions
  addGroup: (groupData: Omit<Group, 'id' | 'createdAt'>) => void;
  updateGroup: (updatedGroup: Group) => void;
  deleteGroup: (groupId: string) => void;
  addMemberToGroup: (groupId: string, memberId: string) => void;
  removeMember: (groupId: string, memberId: string) => void;
  addTaskToGroup: (groupId: string, taskId: string) => void;
  removeTaskFromGroup: (groupId: string, taskId: string) => void;

  // Member actions
  addMember: (memberData: Omit<Member, 'id' | 'joinedAt'>) => void;
  updateMember: (updatedMember: Member) => void;
  deleteMember: (memberId: string) => void;
  assignTask: (memberId: string, taskId: string) => void;
  unassignTask: (memberId: string, taskId: string) => void;

  // Calendar actions
  getTasksByDate: (date: Date) => Task[];

  // Focus/Pomodoro actions
  updateFocusSettings: (settings: Partial<Pick<Settings, 'focusDuration' | 'shortBreakDuration' | 'longBreakDuration' | 'sessionsBeforeLongBreak'>>) => void;
  updateTaskPomodoros: (taskId: string, count: number) => void;

  // Stats actions
  getTaskStats: () => { total: number; completed: number; pending: number; completionRate: number };
  getProductivityTrends: () => Record<string, number>;

  // Load actions
  loadTasks: (userId: string) => Promise<void>;
  loadTemplates: (userId: string) => Promise<void>;
  loadSettings: (userId: string) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  loadAllUserData: (userId: string) => Promise<void>;

  // Team actions
  loadTeams: () => Promise<Team[]>;
  addTeam: (teamData: Team) => void;
  updateTeam: (updatedTeam: Team) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;

  // Reset action
  reset: () => void;
}

type Store = StoreState & StoreActions;

const auth = getFirebaseAuth();

const initialState: StoreState = {
  tasks: [],
  templates: [],
  groups: [],
  members: [],
  teams: [],
  settings: {
    theme: 'system',
    accentColor: 'blue',
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  },
  profile: {
    name: '',
    email: '',
    bio: '',
    timezone: 'UTC',
    avatar: '',
    joinDate: '',
    lastSignIn: '',
    emailVerified: false,
    providerId: 'email',
    streak: 0,
    level: 'New',
    stats: {
      tasksCompleted: 0,
      totalTasks: 0,
      completionRate: 0,
      weeklyProgress: [],
      monthlyProgress: []
    }
  }
};

// Ensure state has valid arrays and objects
const ensureValidState = (state: any): StoreState => ({
  ...initialState,
  ...state,
  tasks: Array.isArray(state?.tasks) ? state.tasks : [],
  templates: Array.isArray(state?.templates) ? state.templates : [],
  groups: Array.isArray(state?.groups) ? state.groups : [],
  members: Array.isArray(state?.members) ? state.members : [],
  teams: Array.isArray(state?.teams) ? state.teams : [],
  settings: { ...initialState.settings, ...(state?.settings || {}) },
  profile: { ...initialState.profile, ...(state?.profile || {}) }
});

// Selectors - memoized to prevent infinite loops
const selectTasks = (state: Store) => state.tasks;
const selectSettings = (state: Store) => state.settings;
const selectProfile = (state: Store) => state.profile;
const selectTemplates = (state: Store) => state.templates;

// Create a stable selector for uncompleted tasks
const selectUncompletedTasks = (state: Store) => {
  const tasks = state.tasks;
  // Use a stable reference if possible
  return tasks.filter(task => !task.completed);
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Task actions
      addTask: async (taskData) => {
        // Wait for auth state to be ready
        await new Promise<void>((resolve) => {
          if (auth.currentUser) {
            resolve();
          } else {
            const unsubscribe = auth.onAuthStateChanged((user) => {
              if (user) {
                unsubscribe();
                resolve();
              }
            });
            // Timeout after 5 seconds
            setTimeout(() => {
              unsubscribe();
              resolve();
            }, 5000);
          }
        });
        
        const user = auth.currentUser;
        if (!user) {
          console.error('Authentication state:', {
            currentUser: auth.currentUser,
            authReady: !!auth.currentUser
          });
          throw new Error('User must be authenticated to create tasks');
        }
        
        console.log('Creating task for user:', user.email);
        
        try {
          // Use API route with Admin SDK
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...taskData,
              userId: user.uid
            })
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to create task');
          }
          
          console.log('Task created successfully via API:', result.data.id);
          
          // Update local state with the created task
          set((state) => ({
            tasks: [...state.tasks, result.data]
          }));
          
          return result.data;
        } catch (error) {
          console.error('Error creating task:', error);
          throw error;
        }
      },

      updateTask: async (updatedTask) => {
        if (!updatedTask?.id) {
          throw new Error('Task ID is required for updates');
        }
        
        try {
          // Use API route with Admin SDK
          const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to update task');
          }
          
          console.log('Task updated successfully via API:', result.data.id);
          
          // Update local state with the updated task
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === updatedTask.id ? result.data : task
            )
          }));
          
          return result.data;
        } catch (error) {
          console.error('Error updating task:', error);
          throw error;
        }
      },

      deleteTask: async (taskId) => {
        try {
          // Use API route with Admin SDK
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to delete task');
          }
          
          console.log('Task deleted successfully via API:', taskId);
          
          // Update local state
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId)
          }));
        } catch (error) {
          console.error('Error deleting task:', error);
          throw error;
        }
      },

      toggleTaskCompletion: async (taskId) => {
        console.log('🔄 toggleTaskCompletion called with taskId:', taskId);
        
        const state = get();
        console.log('📊 Current state tasks count:', state.tasks.length);
        console.log('📋 Available task IDs:', state.tasks.map(t => ({ id: t.id, title: t.title })));
        
        let task = state.tasks.find(t => t.id === taskId);
        
        if (!task) {
          console.error('❌ Task not found in local state!');
          console.error('🔍 Searched for taskId:', taskId);
          console.error('📝 Available tasks:', state.tasks.map(t => ({
            id: t.id,
            title: t.title,
            completed: t.completed
          })));
          
          // Try to reload tasks and find the task
          console.log('🔄 Attempting to reload tasks...');
          const user = auth?.currentUser;
          if (user) {
            try {
              await get().loadAllUserData(user.uid);
              const refreshedState = get();
              task = refreshedState.tasks.find(t => t.id === taskId);
              
              if (!task) {
                console.warn('⚠️ Task still not found after refresh. This task may have been deleted or is orphaned.');
                console.log('🧺 SUGGESTION: Use the TaskDebugger Nuclear Reset to clear orphaned tasks');
                
                // Instead of throwing an error, just return silently
                // This prevents the UI from breaking
                return;
              }
              
              console.log('✅ Task found after refresh:', task.title);
            } catch (refreshError) {
              console.error('❌ Failed to refresh tasks:', refreshError);
              console.log('🧺 SUGGESTION: Use TaskDebugger to manually sync your tasks');
              return; // Return instead of throwing to prevent UI breakage
            }
          } else {
            console.error('❌ No authenticated user found');
            return; // Return instead of throwing
          }
        }
        
        console.log('✅ Task found:', { id: task.id, title: task.title, completed: task.completed });
        
        const updatedTask: Task = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined
        };
        
        console.log('📝 Updated task data:', {
          id: updatedTask.id,
          title: updatedTask.title,
          completed: updatedTask.completed,
          completedAt: updatedTask.completedAt
        });
        
        try {
          console.log('📡 Sending PUT request to /api/tasks...');
          
          // Use API route with Admin SDK
          const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
          });
          
          console.log('📡 API Response status:', response.status);
          
          const result = await response.json();
          console.log('📡 API Response data:', result);
          
          if (!response.ok) {
            console.error('❌ API Error:', result);
            console.error('⚠️ This task probably doesn\'t exist in Firestore. Use TaskDebugger to sync.');
            // Don't throw error - just return silently to prevent UI crashes
            return;
          }
          
          console.log('✅ Task completion toggled successfully via API:', taskId);
          
          // Update local state with the updated task
          set((state) => {
            const newTasks = state.tasks.map((t) =>
              t.id === taskId ? result.data : t
            );
            console.log('📊 Updated local state with', newTasks.length, 'tasks');
            return { tasks: newTasks };
          });
        } catch (error) {
          console.error('❌ Error toggling task completion:', error);
          console.error('🔍 Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            taskId,
            taskExists: !!task
          });
          throw error;
        }
      },

      addSubtask: async (taskId, subtaskTitle) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const updatedTask: Task = {
          ...task,
          subtasks: [
            ...(task.subtasks || []),
            {
              id: uuidv4(),
              title: subtaskTitle,
              completed: false
            }
          ]
        };
        
        try {
          // Use API route with Admin SDK
          const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to add subtask');
          }
          
          console.log('Subtask added successfully via API:', taskId);
          
          // Update local state with the updated task
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId ? result.data : t
            )
          }));
        } catch (error) {
          console.error('Error adding subtask:', error);
          throw error;
        }
      },

      toggleSubtask: async (taskId, subtaskId) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const updatedTask: Task = {
          ...task,
          subtasks: task.subtasks!.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
        
        try {
          // Use API route with Admin SDK
          const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to toggle subtask');
          }
          
          console.log('Subtask toggled successfully via API:', taskId);
          
          // Update local state with the updated task
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId ? result.data : t
            )
          }));
        } catch (error) {
          console.error('Error toggling subtask:', error);
          throw error;
        }
      },

      deleteSubtask: async (taskId, subtaskId) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const updatedTask: Task = {
          ...task,
          subtasks: task.subtasks!.filter((st) => st.id !== subtaskId)
        };
        
        try {
          // Use API route with Admin SDK
          const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to delete subtask');
          }
          
          console.log('Subtask deleted successfully via API:', taskId);
          
          // Update local state with the updated task
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId ? result.data : t
            )
          }));
        } catch (error) {
          console.error('Error deleting subtask:', error);
          throw error;
        }
      },

      // Template actions
      addTemplate: async (userId, templateData) => {
        const newTemplate: Template = {
          id: uuidv4(),
          name: templateData.name,
          description: templateData.description || '',
          taskTitle: templateData.taskTitle,
          priority: templateData.priority || 'medium',
          createdAt: new Date().toISOString(),
          userId
        };
        
        try {
          // Use API route with Admin SDK
          const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...newTemplate,
              userId: userId
            })
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to create template');
          }
          
          console.log('Template created successfully via API:', result.template.id);
          
          // Update local state
          set((state) => ({
            templates: [...state.templates, result.template]
          }));
          
          return result.template;
        } catch (error) {
          console.error('Error creating template:', error);
          throw error;
        }
      },

      updateTemplate: async (updatedTemplate) => {
        try {
          // Use API route with Admin SDK
          const response = await fetch('/api/templates', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTemplate)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to update template');
          }
          
          console.log('Template updated successfully via API:', result.template.id);
          
          // Update local state
          set((state) => ({
            templates: state.templates.map((template) =>
              template.id === updatedTemplate.id ? result.template : template
            )
          }));
          
          return result.template;
        } catch (error) {
          console.error('Error updating template:', error);
          throw error;
        }
      },

      deleteTemplate: async (templateId) => {
        try {
          // Use API route with Admin SDK
          const response = await fetch(`/api/templates/${templateId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to delete template');
          }
          
          console.log('Template deleted successfully via API:', templateId);
          
          // Update local state
          set((state) => ({
            templates: state.templates.filter((template) => template.id !== templateId)
          }));
        } catch (error) {
          console.error('Error deleting template:', error);
          throw error;
        }
      },

      // Settings actions
      updateSettings: async (userId, newSettings) => {
        try {
          // Use API route with Admin SDK - pass userId as query parameter
          const response = await fetch(`/api/settings?userId=${encodeURIComponent(userId)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newSettings)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to update settings');
          }
          
          console.log('Settings updated successfully via API');
          
          // Update local state
          set((state) => ({
            settings: { ...state.settings, ...result.settings }
          }));
        } catch (error) {
          console.error('Error updating settings:', error);
          throw error;
        }
      },

      // Profile actions - separate sync and async operations
      updateProfile: (newProfile) => {
        // Sync operation for immediate UI updates
        set((state) => ({
          profile: { ...state.profile, ...newProfile }
        }));
      },

      updateProfileAsync: async (userId, newProfile) => {
        try {
          // Use API route with Admin SDK - pass userId as query parameter
          const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProfile)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to update profile');
          }
          
          console.log('Profile updated successfully via API');
          
          // Update local state
          set((state) => ({
            profile: { ...state.profile, ...result.profile }
          }));
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      },

      // Group actions
      addGroup: (groupData) => set((state) => ({
        groups: [
          ...state.groups,
          {
            id: uuidv4(),
            description: groupData.description || '',
            createdAt: new Date().toISOString(),
            ...groupData
          }
        ]
      })),

      updateGroup: (updatedGroup) => set((state) => ({
        groups: state.groups.map((group) =>
          group.id === updatedGroup.id ? { ...group, ...updatedGroup } : group
        )
      })),

      deleteGroup: (groupId) => set((state) => ({
        groups: state.groups.filter((group) => group.id !== groupId)
      })),

      addMemberToGroup: (groupId, memberId) => set((state) => ({
        groups: state.groups.map((group) =>
          group.id === groupId && !group.members.includes(memberId)
            ? { ...group, members: [...group.members, memberId] }
            : group
        )
      })),

      removeMember: (groupId, memberId) => set((state) => ({
        groups: state.groups.map((group) =>
          group.id === groupId
            ? { ...group, members: group.members.filter((id) => id !== memberId) }
            : group
        )
      })),

      addTaskToGroup: (groupId, taskId) => set((state) => ({
        groups: state.groups.map((group) =>
          group.id === groupId && !group.tasks.includes(taskId)
            ? { ...group, tasks: [...group.tasks, taskId] }
            : group
        )
      })),

      removeTaskFromGroup: (groupId, taskId) => set((state) => ({
        groups: state.groups.map((group) =>
          group.id === groupId
            ? { ...group, tasks: group.tasks.filter((id) => id !== taskId) }
            : group
        )
      })),

      // Member actions
      addMember: (memberData) => set((state) => ({
        members: [
          ...state.members,
          {
            id: uuidv4(),
            joinedAt: new Date().toISOString(),
            ...memberData
          }
        ]
      })),

      updateMember: (updatedMember) => set((state) => ({
        members: state.members.map((member) =>
          member.id === updatedMember.id ? { ...member, ...updatedMember } : member
        )
      })),

      deleteMember: (memberId) => set((state) => ({
        members: state.members.filter((member) => member.id !== memberId)
      })),

      assignTask: (memberId, taskId) => set((state) => ({
        members: state.members.map((member) =>
          member.id === memberId && !member.assignedTasks.includes(taskId)
            ? { ...member, assignedTasks: [...member.assignedTasks, taskId] }
            : member
        )
      })),

      unassignTask: (memberId, taskId) => set((state) => ({
        members: state.members.map((member) =>
          member.id === memberId
            ? { ...member, assignedTasks: member.assignedTasks.filter((id) => id !== taskId) }
            : member
        )
      })),

      // Calendar actions
      getTasksByDate: (date) => {
        const state = get();
        return state.tasks.filter(task => {
          if (!task.dueDate) return false;
          try {
            const taskDate = new Date(task.dueDate);
            if (isNaN(taskDate.getTime())) return false;
            return taskDate.toDateString() === date.toDateString();
          } catch (error) {
            console.warn('Invalid date in task:', task.id, task.dueDate);
            return false;
          }
        });
      },

      // Focus/Pomodoro actions
      updateFocusSettings: (settings) => set((state) => ({
        settings: {
          ...state.settings,
          focusDuration: settings.focusDuration || state.settings.focusDuration,
          shortBreakDuration: settings.shortBreakDuration || state.settings.shortBreakDuration,
          longBreakDuration: settings.longBreakDuration || state.settings.longBreakDuration,
          sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak || state.settings.sessionsBeforeLongBreak
        }
      })),

      updateTaskPomodoros: (taskId, count) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, completedPomodoros: (task.completedPomodoros || 0) + count }
            : task
        )
      })),

      // Stats actions
      getTaskStats: () => {
        const state = get();
        const total = state.tasks.length;
        const completed = state.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          total,
          completed,
          pending,
          completionRate
        };
      },

      getProductivityTrends: () => {
        const state = get();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        return state.tasks
          .filter(task => {
            if (!task.completedAt) return false;
            try {
              const completedDate = new Date(task.completedAt);
              if (isNaN(completedDate.getTime())) return false;
              return completedDate >= thirtyDaysAgo;
            } catch (error) {
              console.warn('Invalid completedAt date in task:', task.id, task.completedAt);
              return false;
            }
          })
          .reduce((acc, task) => {
            try {
              const date = new Date(task.completedAt!).toDateString();
              acc[date] = (acc[date] || 0) + 1;
              return acc;
            } catch (error) {
              console.warn('Error processing date for task:', task.id, task.completedAt);
              return acc;
            }
          }, {} as Record<string, number>);
      },

      // Load tasks from API route (Admin SDK)
      loadTasks: async (userId) => {
        try {
          const response = await fetch(`/api/tasks?userId=${userId}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to load tasks');
          }
          
          console.log('Tasks loaded successfully via API:', result.tasks?.length || 0);
          
          set((state) => ({
            tasks: result.tasks || []
          }));
        } catch (error) {
          console.error('Error loading tasks:', error);
          throw error;
        }
      },

      // Load templates from API route (Admin SDK)
      loadTemplates: async (userId) => {
        try {
          const response = await fetch(`/api/templates?userId=${userId}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to load templates');
          }
          
          console.log('Templates loaded successfully via API:', result.templates?.length || 0);
          
          set((state) => ({
            templates: result.templates || []
          }));
        } catch (error) {
          console.error('Error loading templates:', error);
          // Don't throw error for templates, just set empty array
          set((state) => ({
            templates: []
          }));
        }
      },

      // Load settings from API route (Admin SDK)
      loadSettings: async (userId) => {
        try {
          const response = await fetch(`/api/settings?userId=${userId}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to load settings');
          }
          
          console.log('Settings loaded successfully via API');
          
          if (result.settings) {
            set((state) => ({
              settings: { ...state.settings, ...result.settings }
            }));
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          // Don't throw error for settings, keep defaults
        }
      },

      // Load profile from API route (Admin SDK)
      loadProfile: async (userId) => {
        try {
          const response = await fetch(`/api/profile?userId=${userId}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to load profile');
          }
          
          console.log('Profile loaded successfully via API');
          
          if (result.profile) {
            set((state) => ({
              profile: { ...state.profile, ...result.profile }
            }));
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // Don't throw error for profile, keep defaults
        }
      },

      // Load all user data from API routes (Admin SDK)
      loadAllUserData: async (userId) => {
        try {
          const [tasksResponse, templatesResponse, settingsResponse, profileResponse] = await Promise.all([
            fetch(`/api/tasks?userId=${userId}`).catch(err => {
              console.error('Error fetching tasks:', err);
              return { ok: false, json: () => Promise.resolve({ tasks: [] }) };
            }),
            fetch(`/api/templates?userId=${userId}`).catch(err => {
              console.error('Error fetching templates:', err);
              return { ok: false, json: () => Promise.resolve({ templates: [] }) };
            }),
            fetch(`/api/settings?userId=${userId}`).catch(err => {
              console.error('Error fetching settings:', err);
              return { ok: false, json: () => Promise.resolve({ settings: null }) };
            }),
            fetch(`/api/profile?userId=${userId}`).catch(err => {
              console.error('Error fetching profile:', err);
              return { ok: false, json: () => Promise.resolve({ profile: null }) };
            })
          ]);

          const [tasksData, templatesData, settingsData, profileData] = await Promise.all([
            tasksResponse.json(),
            templatesResponse.json(),
            settingsResponse.json(),
            profileResponse.json()
          ]);

          console.log('All user data loaded via API routes');

          set((state) => ({
            tasks: tasksData.tasks || [],
            templates: templatesData.templates || [],
            settings: settingsData.settings ? { ...state.settings, ...settingsData.settings } : state.settings,
            profile: profileData.profile ? { ...state.profile, ...profileData.profile } : state.profile
          }));
        } catch (error) {
          console.error('Error loading user data:', error);
          throw error;
        }
      },

      // Team actions
      loadTeams: async () => {
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error('User must be authenticated to load teams');
          }
          
          const token = await user.getIdToken();
          const response = await fetch('/api/teams', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to load teams');
          }
          
          console.log('Teams loaded successfully via API:', result.teams?.length || 0);
          
          set((state) => ({
            teams: result.teams || []
          }));
          
          return result.teams || [];
        } catch (error) {
          console.error('Error loading teams:', error);
          throw error;
        }
      },

      addTeam: (teamData) => set((state) => ({
        teams: [...state.teams, teamData]
      })),

      updateTeam: async (updatedTeam) => {
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error('User must be authenticated to update team');
          }
          
          const token = await user.getIdToken();
          const response = await fetch('/api/teams', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedTeam)
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to update team');
          }
          
          console.log('Team updated successfully via API:', result.id);
          
          // Update local state
          set((state) => ({
            teams: state.teams.map((team) =>
              team.id === updatedTeam.id ? { ...team, ...result } : team
            )
          }));
          
          return result;
        } catch (error) {
          console.error('Error updating team:', error);
          throw error;
        }
      },

      deleteTeam: async (teamId) => {
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error('User must be authenticated to delete team');
          }
          
          const token = await user.getIdToken();
          const response = await fetch(`/api/teams?id=${teamId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to delete team');
          }
          
          console.log('Team deleted successfully via API:', teamId);
          
          // Update local state
          set((state) => ({
            teams: state.teams.filter((team) => team.id !== teamId)
          }));
        } catch (error) {
          console.error('Error deleting team:', error);
          throw error;
        }
      },

      // Reset action
      reset: () => set(initialState)
    }),
    {
      name: 'itaskorg-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Only persist settings, profile, templates - NOT tasks
      partialize: (state) => ({
        settings: state.settings,
        profile: state.profile,
        templates: state.templates,
        groups: state.groups,
        members: state.members,
        teams: state.teams,
        // Explicitly exclude tasks from persistence
        // tasks: [] // Never persist tasks
      }),
      onRehydrateStorage: () => (state) => {
        const validState = ensureValidState(state);
        // Always start with empty tasks array - force load from Firestore
        return {
          ...validState,
          tasks: []
        };
      }
    }
  )
);

// Custom hooks for accessing store state
export const useUncompletedTasks = () => {
  const tasks = useStore((state) => state.tasks);
  return useMemo(() => tasks.filter(task => !task.completed), [tasks]);
};

export const useSettings = () => useStore(selectSettings);
export const useProfile = () => useStore(selectProfile);

// Action hooks - individual hooks to prevent object recreation
export const useUpdateSettings = () => useStore((state) => state.updateSettings);
export const useUpdateProfile = () => useStore((state) => state.updateProfile);

// Individual task action hooks - prevents infinite loops
export const useAddTask = () => useStore((state) => state.addTask);
export const useUpdateTask = () => useStore((state) => state.updateTask);
export const useDeleteTask = () => useStore((state) => state.deleteTask);
export const useToggleTaskCompletion = () => useStore((state) => state.toggleTaskCompletion);
export const useAddSubtask = () => useStore((state) => state.addSubtask);
export const useToggleSubtask = () => useStore((state) => state.toggleSubtask);
export const useDeleteSubtask = () => useStore((state) => state.deleteSubtask);

// Template hooks
export const useTemplates = () => useStore(selectTemplates);
export const useAddTemplate = () => useStore((state) => state.addTemplate);
export const useUpdateTemplate = () => useStore((state) => state.updateTemplate);
export const useDeleteTemplate = () => useStore((state) => state.deleteTemplate);

// Group selectors and hooks
const selectGroups = (state: Store) => state.groups;
export const useGroups = () => useStore(selectGroups);
export const useAddGroup = () => useStore((state) => state.addGroup);
export const useUpdateGroup = () => useStore((state) => state.updateGroup);
export const useDeleteGroup = () => useStore((state) => state.deleteGroup);
export const useAddMemberToGroup = () => useStore((state) => state.addMemberToGroup);
export const useRemoveMember = () => useStore((state) => state.removeMember);
export const useAddTaskToGroup = () => useStore((state) => state.addTaskToGroup);
export const useRemoveTaskFromGroup = () => useStore((state) => state.removeTaskFromGroup);

// Member selectors and hooks
const selectMembers = (state: Store) => state.members;
export const useMembers = () => useStore(selectMembers);
export const useAddMember = () => useStore((state) => state.addMember);
export const useUpdateMember = () => useStore((state) => state.updateMember);
export const useDeleteMember = () => useStore((state) => state.deleteMember);
export const useAssignTask = () => useStore((state) => state.assignTask);
export const useUnassignTask = () => useStore((state) => state.unassignTask);

// Calendar hooks
export const useTasksByDate = (date: Date) => {
  const getTasksByDate = useStore((state) => state.getTasksByDate);
  return useMemo(() => getTasksByDate(date), [getTasksByDate, date]);
};

// Focus/Pomodoro hooks
export const useFocusSettings = () => {
  const settings = useStore((state) => state.settings);
  return useMemo(() => ({
    focusDuration: settings.focusDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak
  }), [settings]);
};

export const useUpdateFocusSettings = () => useStore((state) => state.updateFocusSettings);
export const useUpdateTaskPomodoros = () => useStore((state) => state.updateTaskPomodoros);

// Completed tasks hooks
export const useCompletedTasks = () => {
  const tasks = useStore((state) => state.tasks);
  return useMemo(() => tasks.filter(task => task.completed), [tasks]);
};

// Stats hooks
export const useTaskStats = () => {
  const getTaskStats = useStore((state) => state.getTaskStats);
  return useMemo(() => getTaskStats(), [getTaskStats]);
};

export const useProductivityTrends = () => {
  const getProductivityTrends = useStore((state) => state.getProductivityTrends);
  return useMemo(() => getProductivityTrends(), [getProductivityTrends]);
};

// Hook to get tasks safely
export const useTasks = () => {
  const tasks = useStore((state) => state.tasks);
  return useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);
};

// Hook to load tasks from Firestore
export const useLoadTasks = () => useStore((state) => state.loadTasks);

// Hooks to load all data from Firestore
export const useLoadTemplates = () => useStore((state) => state.loadTemplates);
export const useLoadSettings = () => useStore((state) => state.loadSettings);
export const useLoadProfile = () => useStore((state) => state.loadProfile);
export const useLoadAllUserData = () => useStore((state) => state.loadAllUserData);

// Alternative: If you still want a single hook that returns all actions, use useMemo
export const useTaskActions = () => {
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);
  const addSubtask = useStore((state) => state.addSubtask);
  const toggleSubtask = useStore((state) => state.toggleSubtask);
  const deleteSubtask = useStore((state) => state.deleteSubtask);

  return useMemo(() => ({
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addSubtask,
    toggleSubtask,
    deleteSubtask
  }), [addTask, updateTask, deleteTask, toggleTaskCompletion, addSubtask, toggleSubtask, deleteSubtask]);
};

// Team selectors and hooks
const selectTeams = (state: Store) => state.teams;
export const useTeams = () => useStore(selectTeams);
export const useLoadTeams = () => useStore((state) => state.loadTeams);
export const useAddTeam = () => useStore((state) => state.addTeam);
export const useUpdateTeam = () => useStore((state) => state.updateTeam);
export const useDeleteTeam = () => useStore((state) => state.deleteTeam);
