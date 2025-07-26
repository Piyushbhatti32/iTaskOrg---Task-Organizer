'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeams, useLoadTeams } from '../../../store';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import TaskAssignForm from '../../../components/team/TaskAssignForm';
import TaskResponseForm from '../../../components/team/TaskResponseForm';

// Team Details Page Component
export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id;
  const teams = useTeams();
  const loadTeams = useLoadTeams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTeamsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadTeams();
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [loadTeams]);

  // Load teams if not already loaded
  useEffect(() => {
    if (user && teams.length === 0) {
      loadTeamsData();
    }
  }, [user, teams.length, loadTeamsData]);

  const team = teams.find(team => team.id === teamId);
  const isTeamLeader = user && team && team.leaderId === user.uid;
  const isMember = user && team && team.members && team.members[user.uid];

  if (loading) {
    return (
      <div className={`text-center p-8 ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        <p>Fetching team details...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className={`text-center p-8 ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
        <p className="mb-4">The team you are looking for does not exist or you don&apos;t have access to it.</p>
        <button
          onClick={() => router.push('/team')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Back to Teams
        </button>
      </div>
    );
  }

  const { name, description, members = {}, leaderId } = team;
  const membersList = Object.entries(members).map(([id, member]) => ({ id, ...member }));

  // Get current user's member data
  const currentUserMember = members[user?.uid];
  const pendingTasks = currentUserMember?.tasks?.filter(task => task.status === 'pending') || [];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-3xl -z-10 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30' 
            : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'
        }`} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-extrabold mb-2 ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>{name}</h1>
            <p className={`text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{description || 'No description available.'}</p>
            {isTeamLeader && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                isDark 
                  ? 'bg-green-900/30 text-green-300 border border-green-600/30'
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                You are the Team Leader
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/team')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            ← Back to Teams
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDark ? 'bg-red-900/20 text-red-300 border border-red-600/30' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members Section */}
          <div className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${
            isDark 
              ? 'bg-gray-800/70 border-gray-600' 
              : 'bg-white/70 border-white/20'
          }`}>
            <h2 className={`text-2xl font-semibold mb-4 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>Team Members ({membersList.length})</h2>
            
            <div className="space-y-3">
              {membersList.map(member => (
                <div key={member.id} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>{member.name}</p>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {leaderId === member.id && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDark 
                            ? 'bg-green-900/30 text-green-300 border border-green-600/30'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          Leader
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isDark 
                          ? 'bg-blue-900/30 text-blue-300 border border-blue-600/30'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {member.role || 'Member'}
                      </span>
                    </div>
                  </div>
                  
                  {member.joinedAt && (
                    <p className={`text-xs mt-2 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Joined: {(() => {
                        try {
                          let date;
                          if (member.joinedAt.toDate) {
                            date = member.joinedAt.toDate();
                          } else {
                            date = new Date(member.joinedAt);
                          }
                          return date.toLocaleDateString();
                        } catch {
                          return 'Unknown';
                        }
                      })()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Task Management Section */}
          <div className="space-y-6">
            {/* Task Assignment (for leaders) */}
            {isTeamLeader && (
              <div className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-600' 
                  : 'bg-white/70 border-white/20'
              }`}>
                <h3 className={`text-xl font-semibold mb-4 ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>Assign Tasks</h3>
                <TaskAssignForm 
                  teamId={teamId} 
                  members={membersList} 
                  onTaskAssigned={(taskData) => {
                    console.log('Task assigned:', taskData);
                    // Optionally refresh team data
                  }}
                />
              </div>
            )}

            {/* Your Assigned Tasks (for members) */}
            {isMember && pendingTasks.length > 0 && (
              <div className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-600' 
                  : 'bg-white/70 border-white/20'
              }`}>
                <h3 className={`text-xl font-semibold mb-4 ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>Your Pending Tasks</h3>
                <div className="space-y-4">
                  {pendingTasks.map((task, index) => (
                    <TaskResponseForm
                      key={task.id}
                      teamId={teamId}
                      task={task}
                      memberId={user.uid}
                      onResponded={(responseData) => {
                        console.log('Task response:', responseData);
                        // Optionally refresh team data
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Team Stats */}
            <div className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${
              isDark 
                ? 'bg-gray-800/70 border-gray-600' 
                : 'bg-white/70 border-white/20'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>Team Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>{membersList.length}</div>
                  <div className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Members</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>0</div>
                  <div className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Active Tasks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
