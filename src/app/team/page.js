'use client';

import { useState } from 'react';
import { 
  useMembers,
  useAddMember,
  useUpdateMember,
  useDeleteMember,
  useUnassignTask
} from '../../store';

// Member form component for adding/editing team members
function MemberForm({ onSubmit, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [email, setEmail] = useState(initialData?.email || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      role,
      email,
      id: initialData?.id,
      tasks: initialData?.tasks || []
    });
    if (!initialData) {
      setName('');
      setRole('');
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {initialData ? 'Update Member' : 'Add Member'}
      </button>
    </form>
  );
}

// Member tasks component
function MemberTasks({ tasks, memberId, onUnassign }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Assigned Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div>
                <span className={task.completed ? 'line-through text-gray-400' : ''}>
                  {task.title}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {task.priority}
                </span>
              </div>
              <button
                onClick={() => onUnassign(memberId, task.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Unassign
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Member statistics component
function MemberStats({ member }) {
  const completedTasks = member.tasks?.filter(t => t.completed)?.length || 0;
  const totalTasks = member.tasks?.length || 0;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mt-4 bg-gray-50 p-4 rounded">
      <div className="text-center">
        <div className="text-2xl font-bold">{totalTasks}</div>
        <div className="text-sm text-gray-500">Total Tasks</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{completedTasks}</div>
        <div className="text-sm text-gray-500">Completed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{completionRate}%</div>
        <div className="text-sm text-gray-500">Completion Rate</div>
      </div>
    </div>
  );
}

// Member card component
function MemberCard({ member, onEdit, onDelete, onUnassignTask }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{member.name}</h2>
          <p className="text-gray-600">{member.role}</p>
          <p className="text-gray-500 text-sm">{member.email}</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => onEdit(member)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </div>

      <MemberStats member={member} />
      <MemberTasks
        tasks={member.tasks || []}
        memberId={member.id}
        onUnassign={onUnassignTask}
      />
    </div>
  );
}

// Main Team page component
export default function TeamPage() {
  const [editingMember, setEditingMember] = useState(null);
  const members = useMembers();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const unassignTask = useUnassignTask();

  const handleSubmit = (memberData) => {
    if (editingMember) {
      updateMember(memberData);
      setEditingMember(null);
    } else {
      addMember(memberData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Team</h1>
      
      <MemberForm
        onSubmit={handleSubmit}
        initialData={editingMember}
      />

      <div className="space-y-6">
        {members.length === 0 ? (
          <p className="text-center text-gray-500">No team members yet. Add someone above!</p>
        ) : (
          members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={setEditingMember}
              onDelete={deleteMember}
              onUnassignTask={unassignTask}
            />
          ))
        )}
      </div>
    </div>
  );
} 