import { useState } from 'react';
import TeamUserSelector from './TeamUserSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Simple fallback component in case of import issues
function FallbackUserSelector({ selectedUsers, onUsersChange }) {
  const [emailInput, setEmailInput] = useState('');
  const { isDark } = useTheme();
  
  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && !selectedUsers.some(u => u.email === email)) {
      const name = email.split('@')[0];
      onUsersChange([...selectedUsers, { id: Date.now(), name, email, role: 'member' }]);
      setEmailInput('');
    }
  };
  
  return (
    <div>
      <label className={`block text-sm font-medium mb-1.5 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>Add Team Members</label>
      <div className="flex gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="user@example.com"
          className={`flex-1 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder:text-gray-400' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500'
          }`}
        />
        <button type="button" onClick={handleAddEmail} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          Add
        </button>
      </div>
      {selectedUsers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <span key={user.email} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {user.name} ({user.email})
              <button
                onClick={() => onUsersChange(selectedUsers.filter(u => u.email !== user.email))}
                className={`ml-1 ${
                  isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                }`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamCreateForm({ onTeamCreated }) {
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
      setError('You must be logged in to create a team');
      setLoading(false);
      return;
    }
    
    if (!name.trim()) {
      setError('Team name is required');
      setLoading(false);
      return;
    }
    if (selectedUsers.length === 0) {
      setError('Add at least one team member');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/teams/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description, 
          leaderId: user.uid,
          members: selectedUsers.map(user => ({
            email: user.email,
            name: user.name,
            role: user.role
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create team');
      } else {
        setSuccess('Team created successfully!');
        setName('');
        setDescription('');
        setSelectedUsers([]);
        if (onTeamCreated) onTeamCreated(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border space-y-4 max-w-4xl mx-auto transition-all duration-300 hover:shadow-xl ${
      isDark ? 'bg-gray-800/70 border-gray-600 hover:bg-gray-800/80' : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Team</h2>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Team Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder:text-gray-400' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500'
          }`}
          placeholder="Enter team name"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
            isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder:text-gray-400' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500'
          }`}
          placeholder="Optional description for this team"
          rows={3}
        />
      </div>
      
      {/* Team User Selector */}
      <div>
        <TeamUserSelector
          selectedUsers={selectedUsers}
          onUsersChange={setSelectedUsers}
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Team'}
      </button>
    </form>
  );
} 