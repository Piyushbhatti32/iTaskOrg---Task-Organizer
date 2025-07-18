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
import { useTheme } from '../../contexts/ThemeContext';


// Member tasks component
function MemberTasks({ tasks, memberId, onUnassign }) {
  const { isDark } = useTheme();
  
  return (
    <div className="mt-4">
      <h3 className={`text-lg font-medium mb-2 ${
        isDark ? 'text-gray-200' : 'text-gray-900'
      }`}>Assigned Tasks</h3>
      {tasks.length === 0 ? (
        <p className={`${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>No tasks assigned</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className={`flex items-center justify-between p-2 rounded ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <div>
                <span className={task.completed ? `line-through ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }` : `${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {task.title}
                </span>
                <span className={`text-sm ml-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {task.priority}
                </span>
              </div>
              <button
                onClick={() => onUnassign(memberId, task.id)}
                className={`text-sm transition-colors ${
                  isDark 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-red-600 hover:text-red-800'
                }`}
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
  const { isDark } = useTheme();

  return (
    <div className={`grid grid-cols-3 gap-4 mt-4 p-4 rounded ${
      isDark ? 'bg-gray-800/50' : 'bg-gray-50'
    }`}>
      <div className="text-center">
        <div className={`text-2xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>{totalTasks}</div>
        <div className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>Total Tasks</div>
      </div>
      <div className="text-center">
        <div className={`text-2xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>{completedTasks}</div>
        <div className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>Completed</div>
      </div>
      <div className="text-center">
        <div className={`text-2xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>{completionRate}%</div>
        <div className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>Completion Rate</div>
      </div>
    </div>
  );
}

// Member card component
function MemberCard({ member, onDelete, onUnassignTask }) {
  const { isDark } = useTheme();
  
  const getRoleStyle = (role) => {
    const baseStyles = isDark ? 'border-opacity-30' : 'border-opacity-100';
    switch (role) {
      case 'leader':
        return isDark 
          ? `bg-green-900/30 text-green-300 border-green-600 ${baseStyles}`
          : `bg-green-100 text-green-800 border-green-200 ${baseStyles}`;
      case 'admin':
        return isDark 
          ? `bg-purple-900/30 text-purple-300 border-purple-600 ${baseStyles}`
          : `bg-purple-100 text-purple-800 border-purple-200 ${baseStyles}`;
      case 'member':
      default:
        return isDark 
          ? `bg-blue-900/30 text-blue-300 border-blue-600 ${baseStyles}`
          : `bg-blue-100 text-blue-800 border-blue-200 ${baseStyles}`;
    }
  };

  return (
    <div className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border mb-4 transition-all duration-300 hover:shadow-xl ${
      isDark 
        ? 'bg-gray-900/70 border-gray-700 hover:bg-gray-900/80' 
        : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>{member.name}</h2>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>{member.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleStyle(member.role)}`}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </span>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => onDelete(member.id)}
            className={`px-3 py-1 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
            }`}
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
  const members = useMembers();
  const deleteMember = useDeleteMember();
  const unassignTask = useUnassignTask();
  const { user } = useAuth();
  const { isDark } = useTheme();
  // const user = { uid: 'demo-user' }; // Temporary for debugging

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


  // For demo, use a static teamId (in a real app, get from context or route)
  const teamId = 'demo-team-id';
  const currentUserId = user?.uid || 'demo-user-id';

  // Get current member object for the logged-in user
  const currentMember = members.find(m => m.id === currentUserId);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-3xl -z-10 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30' 
            : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'
        }`} />
        <div className={`absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10 ${
          isDark ? 'opacity-20' : 'opacity-40'
        }`} />
        <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">Team</h1>

        {/* Team Creation Form */}
        <div className="mb-8">
          <TeamCreateForm onTeamCreated={handleTeamCreated} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {members.length === 0 ? (
            <div className={`col-span-2 text-center rounded-2xl shadow-lg p-8 border ${
              isDark 
                ? 'text-gray-400 bg-gray-900/70 border-gray-700' 
                : 'text-gray-400 bg-white/70 border-white/20'
            }`}>
              No team members yet. Add someone above!
            </div>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className={`rounded-2xl border-2 p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-blue-400 border-transparent ${
                  isDark ? 'bg-gray-900/80' : 'bg-white/80'
                }`}
              >
                <MemberCard
                  member={member}
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
          <h2 className={`text-2xl font-semibold mb-4 ${
            isDark ? 'text-blue-400' : 'text-blue-700'
          }`}>Your Assigned Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentMember.tasks.filter(task => task.status === 'pending').map(task => (
              <div key={task.id} className={`rounded-2xl shadow-lg border p-0 md:p-4 ${
                isDark 
                  ? 'border-gray-700 bg-gray-900/90' 
                  : 'border-blue-100 bg-white/90'
              }`}>
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
    </div>
  );
} 