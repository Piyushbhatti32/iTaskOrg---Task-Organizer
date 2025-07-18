'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
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
      addTask: (taskData) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
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
          }
        ]
      })),

      updateTask: (updatedTask) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === updatedTask.id
            ? {
                ...task,
                ...updatedTask,
                schedule: {
                  ...task.schedule,
                  ...(updatedTask.schedule || {})
                }
              }
            : task
        )
      })),

      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId)
      })),

      toggleTaskCompletion: (taskId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null
          } : task
        )
      })),

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
      addTemplate: (templateData) => set((state) => ({
        templates: [
          ...state.templates,
          {
            id: uuidv4(),
            name: templateData.name,
            description: templateData.description || '',
            taskTitle: templateData.taskTitle,
            priority: templateData.priority || 'medium',
            createdAt: new Date().toISOString()
          }
        ]
      })),

      updateTemplate: (updatedTemplate) => set((state) => ({
        templates: state.templates.map((template) =>
          template.id === updatedTemplate.id ? { ...template, ...updatedTemplate } : template
        )
      })),

      deleteTemplate: (templateId) => set((state) => ({
        templates: state.templates.filter((template) => template.id !== templateId)
      })),

      // Settings actions
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // Profile actions
      updateProfile: (newProfile) => set((state) => ({
        profile: { ...state.profile, ...newProfile }
      })),

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