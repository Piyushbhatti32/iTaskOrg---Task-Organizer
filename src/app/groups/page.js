'use client';

import { useState } from 'react';
import { 
  useGroups,
  useAddGroup,
  useUpdateGroup,
  useDeleteGroup,
  useRemoveMember,
  useRemoveTaskFromGroup
} from '../../store';

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

  const handleSubmit = (groupData) => {
    if (editingGroup) {
      updateGroup(groupData);
      setEditingGroup(null);
    } else {
      addGroup(groupData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Groups</h1>
      
      <GroupForm
        onSubmit={handleSubmit}
        initialData={editingGroup}
      />

      <div className="space-y-6">
        {groups.length === 0 ? (
          <p className="text-center text-gray-500">No groups yet. Create one above!</p>
        ) : (
          groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={setEditingGroup}
              onDelete={deleteGroup}
              onRemoveMember={removeMember}
              onRemoveTask={removeTaskFromGroup}
            />
          ))
        )}
      </div>
    </div>
  );
}