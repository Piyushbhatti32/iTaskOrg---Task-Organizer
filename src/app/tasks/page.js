'use client';

import { useState, useEffect } from 'react';
import { useUncompletedTasks, useTaskActions } from '../../store';
import Link from 'next/link';
import { Calendar, Clock, Tag, Flag, AlignLeft, Plus, Edit2, Trash2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Enhanced Task input form for adding new tasks
function TaskInput({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: '',
    schedule: {
      time: '',
      reminder: false
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAdd({
        ...formData,
        createdAt: new Date().toISOString(),
        completed: false,
        subtasks: []
      });
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: '',
        schedule: {
          time: '',
          reminder: false
        }
      });
      setIsExpanded(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <input
            className="flex-1 text-lg font-medium placeholder:text-gray-400 focus:outline-none"
            placeholder="Add a new task..."
            value={formData.title}
            onChange={e => updateFormData('title', e.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => updateFormData('description', e.target.value)}
              placeholder="Add details about your task..."
              className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => updateFormData('dueDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.schedule.time}
                  onChange={e => updateFormData('schedule', { ...formData.schedule, time: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => updateFormData('category', e.target.value)}
                  placeholder="e.g., Work, Personal, Shopping"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.priority}
                  onChange={e => updateFormData('priority', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="reminder"
              checked={formData.schedule.reminder}
              onChange={e => updateFormData('schedule', { ...formData.schedule, reminder: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="reminder" className="ml-2 text-sm text-gray-700">
              Set reminder
            </label>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 p-4 flex justify-end">
        <button
          type="submit"
          disabled={!formData.title.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>
    </form>
  );
}

// Enhanced Subtask list and controls
function Subtasks({ task }) {
  const { addSubtask, toggleSubtask, deleteSubtask } = useTaskActions();
  const [subtaskTitle, setSubtaskTitle] = useState('');

  return (
    <div className="ml-8 mt-3">
      <form
        className="flex gap-2 mb-2"
        onSubmit={e => {
          e.preventDefault();
          if (subtaskTitle.trim()) {
            addSubtask(task.id, subtaskTitle);
            setSubtaskTitle('');
          }
        }}
      >
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add subtask..."
          value={subtaskTitle}
          onChange={e => setSubtaskTitle(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
        >
          Add
        </button>
      </form>
      <ul className="space-y-1">
        {task.subtasks?.map(st => (
          <li key={st.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={st.completed}
              onChange={() => toggleSubtask(task.id, st.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className={st.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
              {st.title}
            </span>
            <button
              onClick={() => deleteSubtask(task.id, st.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
              title="Delete subtask"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Main Tasks page component
export default function TasksPage() {
  const [isClient, setIsClient] = useState(false);
  const tasks = useUncompletedTasks();
  const { addTask, updateTask, deleteTask, toggleTaskCompletion } = useTaskActions();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR/hydration
  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle editing a task title
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (task) => {
    if (editTitle.trim()) {
      updateTask({ ...task, title: editTitle });
      setEditingId(null);
      setEditTitle('');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Tasks</h1>
      <p className="text-gray-600 mb-6">Manage your tasks and stay organized</p>
      
      <TaskInput onAdd={addTask} />
      
      <div className="space-y-4">
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-2">No tasks yet</p>
            <p className="text-gray-400 text-sm">Add your first task above to get started!</p>
          </div>
        )}
        {tasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-4 h-4" />}
                </button>
                
                {editingId === task.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                    />
                    <button
                      onClick={() => saveEdit(task)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-4">
                    <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-900'}>
                      {task.title}
                    </span>
                    {task.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(task)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="mt-2 text-sm text-gray-600 ml-8">{task.description}</p>
              )}

              {(task.dueDate || task.category) && (
                <div className="mt-2 ml-8 flex items-center gap-4 text-sm text-gray-500">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.category && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{task.category}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subtasks */}
            <Subtasks task={task} />
          </div>
        ))}
      </div>
    </div>
  );
}