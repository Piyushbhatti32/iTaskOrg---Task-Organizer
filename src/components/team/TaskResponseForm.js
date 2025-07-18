import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function TaskResponseForm({ teamId, task, memberId, onResponded }) {
  const { isDark } = useTheme();
  const [response, setResponse] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (!response) {
      setError('Please select accept or reject');
      setLoading(false);
      return;
    }
    if (response === 'reject' && !reason.trim()) {
      setError('Please provide a reason for rejection');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/teams/tasks/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          taskId: task.id,
          memberId,
          response,
          reason: response === 'reject' ? reason : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit response');
      } else {
        setSuccess(`Task ${response}ed successfully!`);
        setResponse('');
        setReason('');
        if (onResponded) onResponded(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border mt-4 transition-all duration-300 hover:shadow-xl ${
      isDark ? 'bg-gray-800/70 border-gray-600 hover:bg-gray-800/80' : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Respond to Task</h3>
      <div className={`mb-4 p-4 rounded-xl border ${
        isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50/50 border-gray-200'
      }`}>
        <div className={`font-semibold mb-2 ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>{task.title}</div>
        <div className={`text-sm mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>{task.description}</div>
        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
          isDark ? 'text-gray-400 bg-blue-900/50' : 'text-gray-500 bg-blue-50'
        }`}>Deadline: {task.deadline ? new Date(task.deadline).toLocaleString() : 'N/A'}</div>
      </div>
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            response === 'accept' 
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25' 
              : isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setResponse('accept')}
          disabled={loading}
        >
          Accept
        </button>
        <button
          type="button"
          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            response === 'reject' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
              : isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setResponse('reject')}
          disabled={loading}
        >
          Reject
        </button>
      </div>
      {response === 'reject' && (
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>Reason for rejection</label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
              isDark ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder:text-gray-400' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500'
            }`}
            placeholder="Please provide a reason for rejection"
            required
          />
        </div>
      )}
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <button
        type="submit"
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading || !response}
      >
        {loading ? 'Submitting...' : 'Submit Response'}
      </button>
    </form>
  );
} 