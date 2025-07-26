'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  useTeams,
  useLoadTeams,
  useAddTeam,
  useDeleteTeam
} from '../../store';
import TeamCreateForm from '../../components/team/TeamCreateForm';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';



// Team Card component
function TeamCard({ team, onDelete, onView, user, isDark }) {
  const getMemberCount = () => {
    if (team.members && typeof team.members === 'object') {
      return Object.keys(team.members).length;
    }
    return team.memberCount || 0;
  };

  const isTeamLeader = user && team.leaderId === user.uid;
  const memberCount = getMemberCount();

  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80 border-gray-600/30 hover:border-purple-500/30' 
        : 'bg-gradient-to-br from-white/90 via-white/95 to-white/90 border-gray-200/50 hover:border-blue-300/50'
    }`}>
      {/* Animated background gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-indigo-900/10'
          : 'bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-50/50'
      }`} />
      
      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${
        isTeamLeader 
          ? 'bg-gradient-to-bl from-yellow-400/30 to-transparent'
          : 'bg-gradient-to-bl from-blue-400/30 to-transparent'
      }`} />
      
      <div className="relative p-6">
        {/* Header section */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* Team avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                  isTeamLeader
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={`text-xl font-bold leading-tight ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>{team.name}</h3>
                  {isTeamLeader && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      isDark 
                        ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-600/30'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.062 41.062 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.899-.288-1.843-.288-2.516zM21 12.615a41.006 41.006 0 00-.39-3.114 29.106 29.106 0 00-5.265 2.708 31.154 31.154 0 01-.713-.321A30.008 30.008 0 0014 11.459v.394c0 .673-.069 1.617-.288 2.516.508-.29 1.026-.564 1.554-.82a.75.75 0 00.419-.74z" clipRule="evenodd" />
                      </svg>
                      Team Leader
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>{team.description || 'No description provided'}</p>
        </div>

        {/* Stats section */}
        <div className={`mb-4 space-y-3`}>
          {/* Stats row */}
          <div className={`flex items-center justify-between p-3 rounded-xl ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/30'
              : 'bg-gray-50/50 border border-gray-200/30'
          }`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <svg className={`w-4 h-4 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                  </svg>
                </div>
                <div>
                  <span className={`text-lg font-bold ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>{memberCount}</span>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Members</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  isDark ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <svg className={`w-4 h-4 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.5a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className={`text-lg font-bold ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>0</span>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Tasks</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Date row */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-800/30 border border-gray-700/20'
              : 'bg-gray-50/30 border border-gray-200/20'
          }`}>
            <div className={`p-1.5 rounded-md ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <svg className={`w-3.5 h-3.5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M3 21h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Created {team.createdAt ? (() => {
                try {
                  let date;
                  if (team.createdAt.toDate) {
                    date = team.createdAt.toDate();
                  } else if (typeof team.createdAt === 'string') {
                    date = new Date(team.createdAt);
                  } else {
                    date = team.createdAt;
                  }
                  return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
                } catch (error) {
                  return 'Unknown';
                }
              })() : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => onView(team.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Team
          </button>
          
          {isTeamLeader && (
            <button
              onClick={() => onDelete(team.id)}
              className={`p-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                isDark 
                  ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-700/30 hover:border-red-600/50' 
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300'
              }`}
              title="Delete Team"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Team page component
export default function TeamPage() {
  const teams = useTeams();
  const loadTeams = useLoadTeams();
  const addTeam = useAddTeam();
  const deleteTeam = useDeleteTeam();
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

  // Load teams when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadTeamsData();
    }
  }, [user, loadTeamsData]);

  // Handle team creation - add to local state and refresh
  const handleTeamCreated = (teamData) => {
    console.log('Team created:', teamData);
    addTeam(teamData);
    // Optionally reload teams to get the most up-to-date data
    loadTeamsData();
  };

  // Handle team deletion
  const handleTeamDelete = async (teamId) => {
    try {
      setLoading(true);
      await deleteTeam(teamId);
      console.log('Team deleted:', teamId);
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  // Handle team view
  const handleTeamView = (teamId) => {
    // Navigate to team details page
    window.location.href = `/team/${teamId}`;
  };


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
        <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg slide-up stagger-1">Teams</h1>

        {/* Error Display */}
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${
            isDark ? 'bg-red-900/20 text-red-300 border border-red-600/30' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        {/* Teams List */}
        <div className="mb-8 slide-up stagger-2">
          <h2 className={`text-2xl font-semibold mb-4 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>Your Teams</h2>
          
          {loading ? (
            <div className={`text-center rounded-2xl shadow-lg p-8 border ${
              isDark 
                ? 'text-gray-400 bg-gray-900/70 border-gray-700' 
                : 'text-gray-400 bg-white/70 border-white/20'
            }`}>
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className={`text-center rounded-2xl shadow-lg p-8 border ${
              isDark 
                ? 'text-gray-400 bg-gray-900/70 border-gray-700' 
                : 'text-gray-400 bg-white/70 border-white/20'
            }`}>
              No teams yet. Create your first team below!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className={`slide-up`}
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <TeamCard
                    team={team}
                    onDelete={handleTeamDelete}
                    onView={handleTeamView}
                    user={user}
                    isDark={isDark}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Creation Form */}
        <div className="mb-8 slide-up stagger-3">
          <h2 className={`text-2xl font-semibold mb-4 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>Create New Team</h2>
          <TeamCreateForm onTeamCreated={handleTeamCreated} />
        </div>

      </div>
    </div>
  );
} 