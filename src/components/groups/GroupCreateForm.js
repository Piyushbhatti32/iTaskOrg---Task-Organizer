import { useState } from 'react';

export default function GroupCreateForm({ onGroupCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }
    if (emails.includes(email)) {
      setError('Email already added');
      return;
    }
    setEmails([...emails, email]);
    setEmailInput('');
    setError(null);
  };

  const handleRemoveEmail = (email) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (!name.trim()) {
      setError('Group name is required');
      setLoading(false);
      return;
    }
    if (emails.length === 0) {
      setError('Add at least one user email');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/groups/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, emails })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create group');
      } else {
        setSuccess('Group created successfully!');
        setName('');
        setDescription('');
        setEmails([]);
        if (onGroupCreated) onGroupCreated(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-2">Create Group</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Group Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
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
        <label className="block text-sm font-medium mb-1">Add Users by Email</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="user@example.com"
          />
          <button type="button" onClick={handleAddEmail} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {emails.map(email => (
            <span key={email} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
              {email}
              <button type="button" onClick={() => handleRemoveEmail(email)} className="text-red-500 ml-1">&times;</button>
            </span>
          ))}
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );
} 