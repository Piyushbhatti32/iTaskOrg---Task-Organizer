import { useState } from 'react';

export default function TaskAssignForm({ teamId, members, onTaskAssigned }) {
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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-2">Assign Task</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Assign To</label>
        <select
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Select member</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Task Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Assigning...' : 'Assign Task'}
      </button>
    </form>
  );
} 