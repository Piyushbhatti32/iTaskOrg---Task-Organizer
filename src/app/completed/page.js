'use client';

import { useState } from 'react';
import { 
  useCompletedTasks,
  useDeleteTask,
  useToggleTaskCompletion
} from '../../store';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';

// Filter controls component
function FilterControls({ filters, onFilterChange }) {
  const { isDark } = useTheme();
  
  return (
    <div className="flex gap-4 mb-6">
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sort by</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className={`border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark 
              ? 'border-gray-600 bg-gray-800/50 text-gray-200' 
              : 'border-gray-200 bg-white/50 text-gray-900'
          }`}
        >
          <option value="completedAt">Completion Date</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className={`border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark 
              ? 'border-gray-600 bg-gray-800/50 text-gray-200' 
              : 'border-gray-200 bg-white/50 text-gray-900'
          }`}
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Search</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search tasks..."
          className={`border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
            isDark 
              ? 'border-gray-600 bg-gray-800/50 text-gray-200 placeholder-gray-400' 
              : 'border-gray-200 bg-white/50 text-gray-900 placeholder-gray-500'
          }`}
        />
      </div>
    </div>
  );
}

// Task list component
function TaskList({ tasks = [], onRestore, onDelete }) {
  const { isDark } = useTheme();
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const groupedTasks = safeTasks.reduce((groups, task) => {
    const date = format(new Date(task.completedAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
{Object.entries(groupedTasks)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .map(([date, dateTasks], groupIndex) => (
          <div
            key={date}
            className={`backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl slide-up ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50 hover:bg-gray-800/80' 
                : 'bg-white/70 border-white/20 hover:bg-white/80'
            }`}
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            <div className={`px-6 py-4 border-b ${
              isDark 
                ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 border-gray-700/50' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-white/20'
            }`}>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {format(new Date(date), 'MMMM d, yyyy')}
              </h3>
            </div>
            <ul>
              {dateTasks.map((task, taskIndex) => (
                <li
                  key={task.id}
                  className={`p-6 border-b last:border-b-0 slide-up ${
                    isDark ? 'border-gray-700/50' : 'border-gray-100'
                  }`}
                  style={{ animationDelay: `${(groupIndex * 300) + (taskIndex * 50)}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{task.title}</h4>
                      {task.description && (
                        <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{task.description}</p>
                      )}
                      <div className="flex items-center mt-3 space-x-4 text-sm">
                        <span className={`px-3 py-1 rounded-full font-medium ${
                          task.priority === 'high' 
                            ? (isDark ? 'bg-red-900/50 text-red-300 border border-red-700/50' : 'bg-red-100 text-red-800 border border-red-200') :
                          task.priority === 'medium' 
                            ? (isDark ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50' : 'bg-yellow-100 text-yellow-800 border border-yellow-200') :
                          (isDark ? 'bg-green-900/50 text-green-300 border border-green-700/50' : 'bg-green-100 text-green-800 border border-green-200')
                        }`}>
                          {task.priority}
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          Completed at {format(new Date(task.completedAt), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onRestore(task)}
                        className={`px-3 py-1 rounded-lg transition-all duration-200 font-medium ${
                          isDark 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30' 
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        }`}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className={`px-3 py-1 rounded-lg transition-all duration-200 font-medium ${
                          isDark 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

// Main Completed Tasks page component
export default function CompletedPage() {
  const tasksRaw = useCompletedTasks();
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const deleteTask = useDeleteTask();
  const toggleTaskCompletion = useToggleTaskCompletion();
  const { isDark } = useTheme();

  const [filters, setFilters] = useState({
    sortBy: 'completedAt',
    priority: 'all',
    search: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRestore = (task) => {
    // Toggle the task completion status to restore it
    toggleTaskCompletion(task.id);
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  // Apply filters and sorting
  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter(task => {
        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false;
        }
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'priority':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          default: // completedAt
            return new Date(b.completedAt) - new Date(a.completedAt);
        }
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="relative mb-8">
        <div className={`absolute inset-0 rounded-3xl -z-10 ${
          isDark ? 'bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30' : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'
        }`} />
        <div className={`absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10 ${
          isDark ? 'opacity-20' : 'opacity-40'
        }`} />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Completed Tasks</h1>
          <span className={`backdrop-blur-sm px-4 py-2 rounded-full border font-medium ${
            isDark ? 'text-gray-300 bg-gray-800/70 border-gray-700/50' : 'text-gray-600 bg-white/70 border-white/20'
          }`}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className={`mb-8 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          View and manage your completed tasks. You can restore or permanently delete them.
        </p>
      </div>

      <FilterControls
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {filteredTasks.length === 0 ? (
        <div className={`text-center py-12 backdrop-blur-sm rounded-2xl shadow-lg border ${
          isDark ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-white/20'
        }`}>
          <div className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No completed tasks found
          </div>
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
} 