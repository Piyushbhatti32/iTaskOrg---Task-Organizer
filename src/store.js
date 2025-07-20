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

const initialState = {
  tasks: [],
  templates: [],
  groups: [],
  members: [],
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
const ensureValidState = (state) => ({
  ...initialState,
  ...state,
  tasks: Array.isArray(state?.tasks) ? state.tasks : [],
  templates: Array.isArray(state?.templates) ? state.templates : [],
  groups: Array.isArray(state?.groups) ? state.groups : [],
  members: Array.isArray(state?.members) ? state.members : [],
  settings: { ...initialState.settings, ...(state?.settings || {}) },
  profile: { ...initialState.profile, ...(state?.profile || {}) }
});

// Selectors - memoized to prevent infinite loops
const selectTasks = (state) => state.tasks;
const selectSettings = (state) => state.settings;
const selectProfile = (state) => state.profile;
const selectTemplates = (state) => state.templates;

// Create a stable selector for uncompleted tasks
const selectUncompletedTasks = (state) => {
  const tasks = state.tasks;
  // Use a stable reference if possible
  return tasks.filter(task => !task.completed);
};

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Task actions
      addTask: async (taskData) => {
        const newTask = {
          id: uuidv4(),
          title: taskData.title,
          description: taskData.description || '',
          dueDate: taskData.dueDate || null,
          priority: taskData.priority || 'medium',
          category: taskData.category || '',
          schedule: {
            time: taskData.schedule?.time || null,
            reminder: taskData.schedule?.reminder || false
          },
          assignedUsers: Array.isArray(taskData.assignedUsers) ? taskData.assignedUsers : [],
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          subtasks: [],
          completedPomodoros: 0
        };
        
        try {
          // Save to Firebase
          await createTask(newTask);
          // Update local state
          set((state) => ({
            tasks: [...state.tasks, newTask]
          }));
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
          // Update in Firebase - import function with alias to avoid collision
          const { updateTask: updateTaskInDB } = await import('./utils/db');
          await updateTaskInDB(updatedTask.id, updatedTask);
          
          // Update local state
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === updatedTask.id
                ? {
                    ...task,
                    ...updatedTask,
                    schedule: {
                      ...task.schedule,
                      ...(updatedTask.schedule || {})
                    },
                    updatedAt: new Date().toISOString()
                  }
                : task
            )
          }));
        } catch (error) {
          console.error('Error updating task:', error);
          throw error;
        }
      },

      deleteTask: async (taskId) => {
        try {
          // Delete from Firebase
          await deleteTask(taskId);
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
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const updatedTask = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : null
        };
        
        try {
          // Update in Firebase
          await updateTask(taskId, updatedTask);
          // Update local state
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId ? updatedTask : t
            )
          }));
        } catch (error) {
          console.error('Error toggling task completion:', error);
          throw error;
        }
      },

      addSubtask: (taskId, subtaskTitle) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: [
                  ...(task.subtasks || []),
                  {
                    id: uuidv4(),
                    title: subtaskTitle,
                    completed: false
                  }
                ]
              }
            : task
        )
      })),

      toggleSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((st) =>
                  st.id === subtaskId ? { ...st, completed: !st.completed } : st
                )
              }
            : task
        )
      })),

      deleteSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter((st) => st.id !== subtaskId)
              }
            : task
        )
      })),

      // Template actions
      addTemplate: async (userId, templateData) => {
        const newTemplate = {
          id: uuidv4(),
          name: templateData.name,
          description: templateData.description || '',
          taskTitle: templateData.taskTitle,
          priority: templateData.priority || 'medium',
          createdAt: new Date().toISOString()
        };
        
        try {
          // Save to Firestore
          await createTemplate(userId, newTemplate);
          // Update local state
          set((state) => ({
            templates: [...state.templates, newTemplate]
          }));
        } catch (error) {
          console.error('Error creating template:', error);
          throw error;
        }
      },

      updateTemplate: async (updatedTemplate) => {
        try {
          // Update in Firestore
          await updateTemplate(updatedTemplate.id, updatedTemplate);
          // Update local state
          set((state) => ({
            templates: state.templates.map((template) =>
              template.id === updatedTemplate.id ? { ...template, ...updatedTemplate } : template
            )
          }));
        } catch (error) {
          console.error('Error updating template:', error);
          throw error;
        }
      },

      deleteTemplate: async (templateId) => {
        try {
          // Delete from Firestore
          await deleteTemplate(templateId);
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
          // Update in Firestore
          await createOrUpdateUserSettings(userId, newSettings);
          // Update local state
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
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
          // Update in Firestore
          await createOrUpdateUserProfile(userId, newProfile);
          // Update local state
          set((state) => ({
            profile: { ...state.profile, ...newProfile }
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
            name: groupData.name,
            description: groupData.description || '',
            members: groupData.members || [],
            tasks: groupData.tasks || [],
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
            name: memberData.name,
            email: memberData.email,
            role: memberData.role || 'member',
            assignedTasks: [],
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
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === date.toDateString();
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
          .filter(task => new Date(task.completedAt) >= thirtyDaysAgo)
          .reduce((acc, task) => {
            const date = new Date(task.completedAt).toDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
      },

      // Load tasks from Firestore
      loadTasks: async (userId) => {
        try {
          const firestoreTasks = await getUserTasks(userId);
          set((state) => ({
            tasks: firestoreTasks
          }));
        } catch (error) {
          console.error('Error loading tasks:', error);
          throw error;
        }
      },

      // Load templates from Firestore
      loadTemplates: async (userId) => {
        try {
          const firestoreTemplates = await getUserTemplates(userId);
          set((state) => ({
            templates: firestoreTemplates
          }));
        } catch (error) {
          console.error('Error loading templates:', error);
          throw error;
        }
      },

      // Load settings from Firestore
      loadSettings: async (userId) => {
        try {
          const firestoreSettings = await getUserSettings(userId);
          if (firestoreSettings) {
            set((state) => ({
              settings: { ...state.settings, ...firestoreSettings }
            }));
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          throw error;
        }
      },

      // Load profile from Firestore
      loadProfile: async (userId) => {
        try {
          const firestoreProfile = await getUserProfile(userId);
          if (firestoreProfile) {
            set((state) => ({
              profile: { ...state.profile, ...firestoreProfile }
            }));
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          throw error;
        }
      },

      // Load all user data from Firestore
      loadAllUserData: async (userId) => {
        try {
          const [tasks, templates, settings, profile] = await Promise.all([
            getUserTasks(userId).catch(err => {
              console.error('Error loading tasks:', err);
              return [];
            }),
            getUserTemplates(userId).catch(err => {
              console.error('Error loading templates:', err);
              return [];
            }),
            getUserSettings(userId).catch(err => {
              console.error('Error loading settings:', err);
              return null;
            }),
            getUserProfile(userId).catch(err => {
              console.error('Error loading profile:', err);
              return null;
            })
          ]);

          set((state) => ({
            tasks,
            templates,
            settings: settings ? { ...state.settings, ...settings } : state.settings,
            profile: profile ? { ...state.profile, ...profile } : state.profile
          }));
        } catch (error) {
          console.error('Error loading user data:', error);
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
      onRehydrateStorage: () => (state) => {
        return ensureValidState(state);
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
const selectGroups = (state) => state.groups;
export const useGroups = () => useStore(selectGroups);
export const useAddGroup = () => useStore((state) => state.addGroup);
export const useUpdateGroup = () => useStore((state) => state.updateGroup);
export const useDeleteGroup = () => useStore((state) => state.deleteGroup);
export const useAddMemberToGroup = () => useStore((state) => state.addMemberToGroup);
export const useRemoveMember = () => useStore((state) => state.removeMember);
export const useAddTaskToGroup = () => useStore((state) => state.addTaskToGroup);
export const useRemoveTaskFromGroup = () => useStore((state) => state.removeTaskFromGroup);

// Member selectors and hooks
const selectMembers = (state) => state.members;
export const useMembers = () => useStore(selectMembers);
export const useAddMember = () => useStore((state) => state.addMember);
export const useUpdateMember = () => useStore((state) => state.updateMember);
export const useDeleteMember = () => useStore((state) => state.deleteMember);
export const useAssignTask = () => useStore((state) => state.assignTask);
export const useUnassignTask = () => useStore((state) => state.unassignTask);

// Calendar hooks
export const useTasksByDate = (date) => {
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