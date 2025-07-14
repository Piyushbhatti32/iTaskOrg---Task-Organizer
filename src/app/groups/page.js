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

// Group form component for adding/editing groups
function GroupForm({ onSubmit, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      id: initialData?.id,
      members: initialData?.members || [],
      tasks: initialData?.tasks || []
    });
    if (!initialData) {
      setName('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Group Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows="3"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {initialData ? 'Update Group' : 'Create Group'}
      </button>
    </form>
  );
}

// Member list component
function MemberList({ members, onRemoveMember }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Members</h3>
      {members.length === 0 ? (
        <p className="text-gray-500">No members yet</p>
      ) : (
        <ul className="space-y-2">
          {members.map(member => (
            <li key={member.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{member.name}</span>
              <button
                onClick={() => onRemoveMember(member.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Task list component for groups
function GroupTasks({ tasks, groupId, onRemoveTask }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned to this group</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.title}
              </span>
              <button
                onClick={() => onRemoveTask(groupId, task.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Group card component
function GroupCard({ group, onEdit, onDelete, onRemoveMember, onRemoveTask }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{group.name}</h2>
        <div className="space-x-2">
          <button
            onClick={() => onEdit(group)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(group.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
      
      {group.description && (
        <p className="text-gray-600 mb-4">{group.description}</p>
      )}

      <MemberList
        members={group.members || []}
        onRemoveMember={(memberId) => onRemoveMember(group.id, memberId)}
      />

      <GroupTasks
        tasks={group.tasks || []}
        groupId={group.id}
        onRemoveTask={onRemoveTask}
      />
    </div>
  );
}

// Main Groups page component
export default function GroupsPage() {
  const [editingGroup, setEditingGroup] = useState(null);
  const groups = useGroups();
  const addGroup = useAddGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const removeMember = useRemoveMember();
  const removeTaskFromGroup = useRemoveTaskFromGroup();
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Refresh group list after creation
  const handleGroupCreated = (groupData) => {
    addGroup(groupData);
    setSelectedGroupId(groupData.id); // Select the new group
  };

  const handleSubmit = (groupData) => {
    if (editingGroup) {
      updateGroup(groupData);
      setEditingGroup(null);
    } else {
      addGroup(groupData);
    }
  };

  // Default to first group if none selected
  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">Groups</h1>

      {/* Group Creation Form */}
      <div className="mb-8">
        <GroupCreateForm onGroupCreated={handleGroupCreated} />
      </div>

      {/* Existing Group Form for editing (hidden by default) */}
      {editingGroup && (
        <GroupForm
          onSubmit={handleSubmit}
          initialData={editingGroup}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {groups.length === 0 ? (
          <div className="col-span-2 text-center text-gray-400 bg-white/70 rounded-2xl shadow-lg p-8 border border-white/20">
            No groups yet. Create one above!
          </div>
        ) : (
          groups.map(group => (
            <div
              key={group.id}
              className={
                `cursor-pointer rounded-2xl border-2 p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-blue-400 ${selectedGroupId === group.id ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50' : 'border-transparent bg-white/80'}`
              }
              onClick={() => setSelectedGroupId(group.id)}
            >
              <GroupCard
                group={group}
                onEdit={setEditingGroup}
                onDelete={deleteGroup}
                onRemoveMember={removeMember}
                onRemoveTask={removeTaskFromGroup}
              />
            </div>
          ))
        )}
      </div>

      {/* Group Chat Window */}
      <div className="mt-12">
        {selectedGroupId ? (
          <div className="rounded-2xl shadow-2xl border border-blue-100 bg-white/90 p-0 md:p-4">
            <GroupChat groupId={selectedGroupId} />
          </div>
        ) : (
          <div className="text-center text-gray-400">Select a group to start chatting.</div>
        )}
      </div>
    </div>
  );
}