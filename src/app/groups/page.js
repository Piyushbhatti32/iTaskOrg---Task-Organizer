'use client';

import { useState, useEffect } from 'react';
import { 
  useGroups,
  useAddGroup,
  useUpdateGroup,
  useDeleteGroup,
  useRemoveMember,
  useRemoveTaskFromGroup
} from '../../store';
import GroupCreateForm from '../../components/groups/GroupCreateForm';
import GroupChat from '../../components/groups/GroupChat';
import { useTheme } from '../../contexts/ThemeContext';

// Group form component for adding/editing groups
function GroupForm({ onSubmit, initialData = null, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        id: initialData?.id,
        members: initialData?.members || [],
        tasks: initialData?.tasks || []
      });
      
      if (!initialData) {
        setName('');
        setDescription('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setName('');
    setDescription('');
  };

  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl ${
      isDark 
        ? 'bg-gray-900/70 border-gray-700 hover:bg-gray-900/80' 
        : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <div className="p-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {initialData ? 'Edit Group' : 'Create New Group'}
        </h2>
        {initialData && (
          <button
            type="button"
            onClick={handleCancel}
            className={`text-sm font-medium px-3 py-1 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter group name"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
              isDark 
                ? 'bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
            rows="3"
            placeholder="Optional description for this group"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className={`border-t p-5 flex justify-end ${
        isDark 
          ? 'border-gray-700 bg-gray-900/50' 
          : 'border-gray-100 bg-white/50'
      }`}>
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Group' : 'Create Group')}
        </button>
      </div>
    </div>
  );
}

// Member list component
function MemberList({ members, onRemoveMember, isLoading }) {
  const [showMembers, setShowMembers] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${showMembers ? 'rotate-90' : ''}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </button>
      </div>
      
      {showMembers && (
        <div className="space-y-2">
          {members.length === 0 ? (
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>No members yet</p>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                  isDark 
                    ? 'bg-gray-800/50 text-gray-200' 
                    : 'bg-gray-50/50 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{member.name}</span>
                </div>
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 text-xs"
                  disabled={isLoading}
                  aria-label={`Remove ${member.name} from group`}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Task list component for groups
function GroupTasks({ tasks, groupId, onRemoveTask, isLoading }) {
  const [showTasks, setShowTasks] = useState(false);
  const completedTasks = tasks.filter(task => task.completed).length;
  const { isDark } = useTheme();
  
  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={() => setShowTasks(!showTasks)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${showTasks ? 'rotate-90' : ''}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </button>
        {tasks.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-full ${
              isDark 
                ? 'text-green-400 bg-green-900/50' 
                : 'text-green-600 bg-green-50'
            }`}>
              ✓ {completedTasks} completed
            </span>
            {tasks.length - completedTasks > 0 && (
              <span className={`px-2 py-0.5 rounded-full ${
                isDark 
                  ? 'text-yellow-400 bg-yellow-900/50' 
                  : 'text-yellow-600 bg-yellow-50'
              }`}>
                ⏳ {tasks.length - completedTasks} pending
              </span>
            )}
          </div>
        )}
      </div>
      
      {showTasks && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>No tasks assigned to this group</p>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                  task.completed 
                    ? isDark 
                      ? 'bg-green-900/30 text-green-300'
                      : 'bg-green-50/50 text-green-800'
                    : isDark 
                      ? 'bg-gray-800/50 text-gray-200'
                      : 'bg-gray-50/50 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className={task.completed ? `line-through ${
                    isDark ? 'text-green-400' : 'text-green-700'
                  }` : ''}>
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveTask(groupId, task.id)}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 text-xs"
                  disabled={isLoading}
                  aria-label={`Remove task "${task.title}" from group`}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Group card component
function GroupCard({ group, onEdit, onDelete, onRemoveMember, onRemoveTask, isSelected, isLoading }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useTheme();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(group.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl group ${
        isDark 
          ? 'bg-gray-900/70 border-gray-700 hover:bg-gray-900/80' 
          : 'bg-white/70 border-white/20 hover:bg-white/80'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-200 ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {group.name}
          </h3>
          {group.description && (
            <p className={`text-sm mb-3 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{group.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(group)}
            className={`p-2 rounded-lg transition-all duration-200 group/btn ${
              isDark 
                ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-all duration-200 group/btn ${
              isDark 
                ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800' 
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
            disabled={isLoading || isDeleting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </div>

      <MemberList
        members={group.members || []}
        onRemoveMember={(memberId) => onRemoveMember(group.id, memberId)}
        isLoading={isLoading}
      />

      <GroupTasks
        tasks={group.tasks || []}
        groupId={group.id}
        onRemoveTask={onRemoveTask}
        isLoading={isLoading}
      />
    </div>
  );
}

// Success message component
function SuccessMessage({ message }) {
  const { isDark } = useTheme();
  
  return message ? (
    <div className={`mb-8 p-4 border rounded-xl flex items-center gap-3 animate-fade-in ${
      isDark 
        ? 'bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700 text-green-300' 
        : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700'
    }`}>
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  ) : null;
}

// Main Groups page component
export default function GroupsPage() {
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const groups = useGroups();
  const addGroup = useAddGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const removeMember = useRemoveMember();
  const removeTaskFromGroup = useRemoveTaskFromGroup();
  const { isDark } = useTheme();

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Refresh group list after creation
  const handleGroupCreated = async (groupData) => {
    setIsLoading(true);
    try {
      await addGroup(groupData);
      setSelectedGroupId(groupData.id);
      showSuccessMessage('Group created successfully! ✨');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (groupData) => {
    setIsLoading(true);
    try {
      if (editingGroup) {
        await updateGroup(groupData);
        setEditingGroup(null);
        showSuccessMessage('Group updated successfully! 🎉');
      } else {
        await addGroup(groupData);
        showSuccessMessage('Group created successfully! ✨');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    setIsLoading(true);
    try {
      await deleteGroup(groupId);
      // If we deleted the selected group, select another one
      if (selectedGroupId === groupId) {
        const remainingGroups = groups.filter(g => g.id !== groupId);
        setSelectedGroupId(remainingGroups.length > 0 ? remainingGroups[0].id : null);
      }
      showSuccessMessage('Group deleted successfully! 🗑️');
    } finally {
      setIsLoading(false);
    }
  };

  // Default to first group if none selected
  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-3xl -z-10 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30' 
            : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'
        }`} />
        <div className={`absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10 ${
          isDark ? 'opacity-20' : 'opacity-40'
        }`} />
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Groups
        </h1>
        <p className={`mb-8 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Create and manage groups for collaborative work and team communication.
        </p>

      <SuccessMessage message={successMessage} />

      {/* Group Creation Form */}
      <div className="mb-8">
        <GroupCreateForm onGroupCreated={handleGroupCreated} />
      </div>

      {/* Existing Group Form for editing */}
      {editingGroup && (
        <GroupForm
          onSubmit={handleSubmit}
          initialData={editingGroup}
          onCancel={() => setEditingGroup(null)}
        />
      )}

      <div className="space-y-6 mb-10">
        {groups.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800/50 border-gray-600 text-gray-400' 
              : 'bg-gray-50/50 border-gray-200 text-gray-500'
          }`}>
            <p className="text-lg">No groups yet. Create your first group to get started! ✨</p>
          </div>
        ) : (
          groups.map(group => (
            <div
              key={group.id}
              className={`cursor-pointer rounded-2xl border-2 p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-blue-400 ${
                selectedGroupId === group.id 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50' 
                  : isDark ? 'border-transparent bg-gray-900/80' : 'border-transparent bg-white/80'
              }`}
              onClick={() => setSelectedGroupId(group.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedGroupId(group.id);
                }
              }}
              aria-label={`Select group ${group.name}`}
            >
              <GroupCard
                group={group}
                onEdit={setEditingGroup}
                onDelete={handleDeleteGroup}
                onRemoveMember={removeMember}
                onRemoveTask={removeTaskFromGroup}
                isSelected={selectedGroupId === group.id}
                isLoading={isLoading}
              />
            </div>
          ))
        )}
      </div>

      {/* Group Chat Window */}
      <div className="mt-12">
        {selectedGroupId ? (
          <div className={`backdrop-blur-sm rounded-2xl shadow-lg border p-0 md:p-4 transition-all duration-300 hover:shadow-xl ${
            isDark 
              ? 'bg-gray-900/70 border-gray-700 hover:bg-gray-900/80' 
              : 'bg-white/70 border-white/20 hover:bg-white/80'
          }`}>
            <GroupChat groupId={selectedGroupId} />
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800/50 border-gray-600 text-gray-400' 
              : 'bg-gray-50/50 border-gray-200 text-gray-500'
          }`}>
            <p className="text-lg">Select a group to start chatting.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
