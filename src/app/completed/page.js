'use client';

import { useState } from 'react';
import { 
  useCompletedTasks,
  useDeleteTask,
  useToggleTaskCompletion
} from '../../store';
import { format } from 'date-fns';

// Filter controls component
function FilterControls({ filters, onFilterChange }) {
  return (
    <div className="flex gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Sort by</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="completedAt">Completion Date</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Search</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search tasks..."
          className="border rounded px-3 py-2"
        />
      </div>
    </div>
  );
}

// Task list component
function TaskList({ tasks = [], onRestore, onDelete }) {
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
        .map(([date, dateTasks]) => (
          <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-3">
              <h3 className="text-lg font-medium">
                {format(new Date(date), 'MMMM d, yyyy')}
              </h3>
            </div>
            <ul>
              {dateTasks.map(task => (
                <li key={task.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium">{task.title}</h4>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span>
                          Completed at {format(new Date(task.completedAt), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onRestore(task)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-red-600 hover:text-red-800"
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
  const { deleteTask } = useDeleteTask();

  const [filters, setFilters] = useState({
    sortBy: 'completedAt',
    priority: 'all',
    search: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRestore = (task) => {
    // This function is no longer needed as restore is handled by useToggleTaskCompletion
    // updateTask({
    //   ...task,
    //   completed: false,
    //   completedAt: null
    // });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Completed Tasks</h1>
        <span className="text-gray-500">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <FilterControls
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {filteredTasks.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No completed tasks found
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