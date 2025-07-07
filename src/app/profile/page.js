'use client';

import { useState } from 'react';
import { useStore, useProfile, useUpdateProfile } from '../../store';

// Profile form component
function ProfileForm({ profile, onUpdate }) {
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'UTC');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      name,
      email,
      bio,
      timezone
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Activity summary component
function ActivitySummary({ tasks }) {
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const monthlyStats = tasks.reduce((stats, task) => {
    if (task.completedAt) {
      const completedDate = new Date(task.completedAt);
      if (completedDate.getMonth() === thisMonth &&
          completedDate.getFullYear() === thisYear) {
        stats.completedThisMonth++;
      }
    }
    return stats;
  }, { completedThisMonth: 0 });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {monthlyStats.completedThisMonth}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
      </div>
    </div>
  );
}

// Recent activity component
function RecentActivity({ tasks }) {
  const recentTasks = tasks
    .filter(task => task.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      {recentTasks.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        <ul className="space-y-4">
          {recentTasks.map(task => (
            <li key={task.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-500">
                  Completed on {new Date(task.completedAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Task statistics component
function TaskStats({ tasks }) {
  if (!Array.isArray(tasks)) return null;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t?.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
        <div className="text-gray-600">Total Tasks</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
        <div className="text-gray-600">Completed</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
        <div className="text-gray-600">Completion Rate</div>
      </div>
    </div>
  );
}

// Main Profile page component
export default function ProfilePage() {
  const tasks = useStore(state => {
    const tasks = state?.tasks;
    return Array.isArray(tasks) ? tasks : [];
  });
  const profile = useProfile();
  const updateProfile = useUpdateProfile();

  const handleProfileUpdate = (updates) => {
    updateProfile(updates);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <ProfileForm
        profile={profile}
        onUpdate={handleProfileUpdate}
      />

      <TaskStats tasks={tasks} />
      <ActivitySummary tasks={tasks} />
      <RecentActivity tasks={tasks} />
    </div>
  );
} 