'use client';

import { useState } from 'react';
import { 
  useMembers,
  useAddMember,
  useUpdateMember,
  useDeleteMember,
  useUnassignTask
} from '../../store';
import TeamCreateForm from '../../components/team/TeamCreateForm';
import TaskAssignForm from '../../components/team/TaskAssignForm';
import TaskResponseForm from '../../components/team/TaskResponseForm';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  // Optionally handle team creation (e.g., refresh members or show a toast)
  const handleTeamCreated = (teamData) => {
    // You could fetch members for the new team or show a notification
    // For now, just log the created team
    console.log('Team created:', teamData);
  };

  // Optionally handle task assignment (e.g., refresh tasks or show a toast)
  const handleTaskAssigned = (taskData) => {
    // You could refresh tasks or show a notification
    console.log('Task assigned:', taskData);
  };

  // Optionally handle task response (e.g., refresh tasks or show a toast)
  const handleTaskResponded = (responseData) => {
    // You could refresh tasks or show a notification
    console.log('Task response:', responseData);
  };

  const handleSubmit = (memberData) => {
    if (editingMember) {
      updateMember(memberData);
      setEditingMember(null);
    } else {
      addMember(memberData);
    }
  };

  // For demo, use a static teamId (in a real app, get from context or route)
  const teamId = 'demo-team-id';
  const currentUserId = user?.uid || 'demo-user-id';

  // Get current member object for the logged-in user
  const currentMember = members.find(m => m.id === currentUserId);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">Team</h1>

      {/* Team Creation Form */}
      <div className="mb-8">
        <TeamCreateForm onTeamCreated={handleTeamCreated} />
      </div>

      <div className="mb-8">
        <MemberForm
          onSubmit={handleSubmit}
          initialData={editingMember}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {members.length === 0 ? (
          <div className="col-span-2 text-center text-gray-400 bg-white/70 rounded-2xl shadow-lg p-8 border border-white/20">
            No team members yet. Add someone above!
          </div>
        ) : (
          members.map(member => (
            <div
              key={member.id}
              className="rounded-2xl border-2 p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-blue-400 border-transparent bg-white/80"
            >
              <MemberCard
                member={member}
                onEdit={setEditingMember}
                onDelete={deleteMember}
                onUnassignTask={unassignTask}
              />
            </div>
          ))
        )}
      </div>

      {/* Task Assignment Form (show only if there are members) */}
      {members.length > 0 && (
        <div className="mb-12">
          <TaskAssignForm teamId={teamId} members={members} onTaskAssigned={handleTaskAssigned} />
        </div>
      )}

      {/* Task Response Interface for current user */}
      {currentMember && currentMember.tasks && currentMember.tasks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Your Assigned Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentMember.tasks.filter(task => task.status === 'pending').map(task => (
              <div key={task.id} className="rounded-2xl shadow-lg border border-blue-100 bg-white/90 p-0 md:p-4">
                <TaskResponseForm
                  teamId={teamId}
                  task={task}
                  memberId={currentUserId}
                  onResponded={handleTaskResponded}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 