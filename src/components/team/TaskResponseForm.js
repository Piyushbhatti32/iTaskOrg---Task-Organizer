import { useState } from 'react';

export default function TaskResponseForm({ teamId, task, memberId, onResponded }) {
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
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-2">Respond to Task</h3>
      <div className="mb-2">
        <div className="font-medium">{task.title}</div>
        <div className="text-sm text-gray-600">{task.description}</div>
        <div className="text-xs text-gray-500">Deadline: {task.deadline ? new Date(task.deadline).toLocaleString() : 'N/A'}</div>
      </div>
      <div className="flex gap-4 mb-2">
        <button
          type="button"
          className={`px-4 py-2 rounded ${response === 'accept' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setResponse('accept')}
          disabled={loading}
        >
          Accept
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${response === 'reject' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setResponse('reject')}
          disabled={loading}
        >
          Reject
        </button>
      </div>
      {response === 'reject' && (
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Reason for rejection</label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
      )}
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading || !response}
      >
        {loading ? 'Submitting...' : 'Submit Response'}
      </button>
    </form>
  );
} 