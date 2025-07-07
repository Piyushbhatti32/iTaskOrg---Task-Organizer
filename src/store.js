'use client';


import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

const initialState = {
  tasks: [],
  templates: [],
  groups: [],
  members: [], // Add members array
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
    timezone: 'UTC'
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


// Standard Zustand store hook (no custom wrapper)
export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Tasks actions
      addTask: (task) => set((state) => ({
        ...state,
        tasks: [...(Array.isArray(state.tasks) ? state.tasks : []), 
          { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateTask: (updatedTask) => set((state) => ({
        ...state,
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).map(task =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      })),
      deleteTask: (taskId) => set((state) => ({
        ...state,
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).filter(task => task.id !== taskId)
      })),
      toggleTaskCompletion: (taskId) => set((state) => ({
        ...state,
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).map(task =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null
              }
            : task
        )
      })),

      // Templates actions
      addTemplate: (template) => set((state) => ({
        ...state,
        templates: [...(Array.isArray(state.templates) ? state.templates : []), 
          { ...template, id: crypto.randomUUID() }]
      })),
      updateTemplate: (updatedTemplate) => set((state) => ({
        ...state,
        templates: (Array.isArray(state.templates) ? state.templates : []).map(template =>
          template.id === updatedTemplate.id ? { ...template, ...updatedTemplate } : template
        )
      })),
      deleteTemplate: (templateId) => set((state) => ({
        ...state,
        templates: (Array.isArray(state.templates) ? state.templates : []).filter(template => template.id !== templateId)
      })),

      // Groups actions
      addGroup: (group) => set((state) => ({
        ...state,
        groups: [...(Array.isArray(state.groups) ? state.groups : []), 
          { ...group, id: crypto.randomUUID() }]
      })),
      updateGroup: (updatedGroup) => set((state) => ({
        ...state,
        groups: (Array.isArray(state.groups) ? state.groups : []).map(group =>
          group.id === updatedGroup.id ? { ...group, ...updatedGroup } : group
        )
      })),
      deleteGroup: (groupId) => set((state) => ({
        ...state,
        groups: (Array.isArray(state.groups) ? state.groups : []).filter(group => group.id !== groupId)
      })),

      // Members actions
      addMember: (member) => set((state) => ({
        ...state,
        members: [...(Array.isArray(state.members) ? state.members : []),
          { ...member, id: crypto.randomUUID() }]
      })),
      updateMember: (updatedMember) => set((state) => ({
        ...state,
        members: (Array.isArray(state.members) ? state.members : []).map(member =>
          member.id === updatedMember.id ? { ...member, ...updatedMember } : member
        )
      })),
      deleteMember: (memberId) => set((state) => ({
        ...state,
        members: (Array.isArray(state.members) ? state.members : []).filter(member => member.id !== memberId)
      })),
      unassignTask: (taskId) => set((state) => ({
        ...state,
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).map(task =>
          task.id === taskId ? { ...task, assignedTo: null } : task
        )
      })),
      removeTaskFromGroup: (taskId) => set((state) => ({
        ...state,
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).map(task =>
          task.id === taskId ? { ...task, groupId: null } : task
        )
      })),

      // Settings actions
      updateSettings: (newSettings) => set((state) => ({
        ...state,
        settings: { ...state.settings, ...newSettings }
      })),

      // Profile actions
      updateProfile: (newProfile) => set((state) => ({
        ...state,
        profile: { ...state.profile, ...newProfile }
      })),

      // Reset action
      reset: () => set(initialState)
    }),
    {
      name: 'itaskorg-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        // Ensure valid state after rehydration
        return ensureValidState(state);
      }
    }
  )
);

// Selector functions with type checking


// Selectors that return stable references to avoid infinite loops
export const useTasks = () => useStore((state) => Array.isArray(state?.tasks) ? state.tasks : []);
export const useUncompletedTasks = () => {
  const tasks = useTasks();
  return tasks.filter(t => !t.completed);
};
export const useCompletedTasks = () => {
  const tasks = useTasks();
  return tasks.filter(t => t.completed);
};


// Individual action hooks for SSR safety
export const useAddTask = () => useStore((state) => state.addTask);
export const useUpdateTask = () => useStore((state) => state.updateTask);
export const useDeleteTask = () => useStore((state) => state.deleteTask);
export const useToggleTaskCompletion = () => useStore((state) => state.toggleTaskCompletion);

export const useTemplates = () => useStore((state) => Array.isArray(state?.templates) ? state.templates : []);

export const useAddTemplate = () => useStore((state) => state.addTemplate);
export const useUpdateTemplate = () => useStore((state) => state.updateTemplate);
export const useDeleteTemplate = () => useStore((state) => state.deleteTemplate);

export const useGroups = () => useStore((state) => Array.isArray(state?.groups) ? state.groups : []);

export const useAddGroup = () => useStore((state) => state.addGroup);
export const useUpdateGroup = () => useStore((state) => state.updateGroup);
export const useDeleteGroup = () => useStore((state) => state.deleteGroup);

// Member actions
export const useMembers = () => useStore((state) => Array.isArray(state?.members) ? state.members : []);
export const useAddMember = () => useStore((state) => state.addMember);
export const useUpdateMember = () => useStore((state) => state.updateMember);
export const useDeleteMember = () => useStore((state) => state.deleteMember);
export const useRemoveMember = () => useStore((state) => state.removeMember);
export const useUnassignTask = () => useStore((state) => state.unassignTask);
export const useRemoveTaskFromGroup = () => useStore((state) => state.removeTaskFromGroup);

export const useSettings = () => useStore((state) => state?.settings || initialState.settings);
export const useUpdateSettings = () => useStore((state) => state.updateSettings);

export const useProfile = () => useStore((state) => state?.profile || initialState.profile);
export const useUpdateProfile = () => useStore((state) => state.updateProfile);

// Stats selectors
export const useTaskStats = () => {
  const tasks = useTasks();
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  };
};

// Calendar selectors
export const useCalendarTasks = () => {
  const tasks = useTasks();
  return tasks.reduce((acc, task) => {
    const date = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'unscheduled';
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});
};