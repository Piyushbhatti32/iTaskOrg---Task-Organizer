import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import GroupUserSelector from './GroupUserSelector';

export default function GroupCreateForm({ onGroupCreated }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to create a group');
      setLoading(false);
      return;
    }
    
    if (!name.trim()) {
      setError('Group name is required');
      setLoading(false);
      return;
    }
    if (selectedUsers.length === 0) {
      setError('Add at least one group member');
      setLoading(false);
      return;
    }
    
    try {
      // Get the user's ID token for authentication
      const token = await user.getIdToken();
      
      const res = await fetch('/api/groups/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          description, 
          members: selectedUsers.map(user => ({
            email: user.email,
            name: user.name,
            role: user.role
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create group');
      } else {
        setSuccess('Group created successfully!');
        setName('');
        setDescription('');
        setSelectedUsers([]);
        if (onGroupCreated) onGroupCreated(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gray-900/70 border-gray-700' : 'bg-white/70 border-white/20'} backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-4 max-w-4xl mx-auto transition-all duration-300 hover:shadow-xl ${isDark ? 'hover:bg-gray-900/80' : 'hover:bg-white/80'}`}>
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Group</h2>
      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Group Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDark ? 'bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
          placeholder="Enter group name"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${isDark ? 'bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
          placeholder="Optional description for this group"
          rows={3}
        />
      </div>
      {/* Group User Selector */}
      <div>
        <GroupUserSelector
          selectedUsers={selectedUsers}
          onUsersChange={setSelectedUsers}
        />
      </div>
      {error && <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</div>}
      {success && <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{success}</div>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );
} 