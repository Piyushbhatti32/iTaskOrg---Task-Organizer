'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function GroupCard({ group }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const isAdmin = group.members[user?.uid]?.role === 'admin';
  const memberCount = Object.keys(group.members).length;

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${group.id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave group');
      }

      router.refresh();
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      setIsLeaveDialogOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {group.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => router.push(`/groups/${group.id}`)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Details
                  </button>
                  
                  {isAdmin && (
                    <button
                      onClick={() => router.push(`/groups/${group.id}/settings`)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push(`/groups/${group.id}/chat`)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Open Chat
                  </button>
                  
                  <button
                    onClick={() => setIsLeaveDialogOpen(true)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Leave Group
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          {group.description}
        </p>

        <div className="mt-6 flex items-center space-x-2">
          <div className="flex -space-x-2">
            {Object.entries(group.members).slice(0, 3).map(([userId, member]) => (
              <div
                key={userId}
                className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                title={member.displayName || 'Member'}
              >
                {member.photoURL ? (
                  <img
                    src={member.photoURL}
                    alt={member.displayName || 'Member'}
                    className="h-full w-full rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {(member.displayName || 'M').charAt(0)}
                  </span>
                )}
              </div>
            ))}
            
            {memberCount > 3 && (
              <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{memberCount - 3}
                </span>
              </div>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => router.push(`/groups/${group.id}/invite`)}
              className="ml-auto flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Leave Group Dialog */}
      {isLeaveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Leave Group
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to leave this group? You'll need to be invited back to rejoin.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsLeaveDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 