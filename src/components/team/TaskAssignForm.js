import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function TaskAssignForm({ teamId, members, onTaskAssigned }) {
  const { isDark } = useTheme();
  const [memberId, setMemberId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (!memberId) {
      setError('Select a team member');
      setLoading(false);
      return;
    }
    if (!title.trim()) {
      setError('Task title is required');
      setLoading(false);
      return;
    }
    if (!deadline) {
      setError('Deadline is required');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/teams/tasks/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          memberId,
          title,
          description,
          priority,
          deadline
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to assign task');
      } else {
        setSuccess('Task assigned successfully!');
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDeadline('');
        setMemberId('');
        if (onTaskAssigned) onTaskAssigned(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border space-y-4 max-w-4xl mx-auto mt-8 transition-all duration-300 hover:shadow-xl ${
      isDark ? 'bg-gray-800/70 border-gray-600 hover:bg-gray-800/80' : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Assign Task</h2>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Assign To</label>
        <select
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200' : 'border-gray-200 bg-white/50 text-gray-900'
          }`}
          required
        >
          <option value="">Select member</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
          ))}
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Task Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder:text-gray-400' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500'
          }`}
          placeholder="Enter task title"
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
          placeholder="Enter task description"
          rows={3}
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Priority</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200' : 'border-gray-200 bg-white/50 text-gray-900'
          }`}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200' : 'border-gray-200 bg-white/50 text-gray-900'
          }`}
          required
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? 'Assigning...' : 'Assign Task'}
      </button>
    </form>
  );
} 