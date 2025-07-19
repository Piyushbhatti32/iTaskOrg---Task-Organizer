'use client';

import { useState, useEffect } from 'react';
import { useUncompletedTasks, useTaskActions, useTemplates } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import Link from 'next/link';
import { Calendar, Clock, Tag, Flag, AlignLeft, Plus, Edit2, Trash2, CheckCircle, ChevronDown, ChevronUp, FileText, Users } from 'lucide-react';
import UserAssignmentField from '../../components/tasks/UserAssignmentField';

// Enhanced Task input form for adding new tasks
function TaskInput({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const templates = useTemplates();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: '',
    schedule: {
      time: '',
      reminder: false
    },
    assignedUsers: []
  });

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        title: template.taskTitle,
        description: template.description || '',
        priority: template.priority,
        templateId: template.id // Store the template ID
      });
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
    }
  };

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
        },
        assignedUsers: []
      });
      setSelectedTemplate(null);
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
    <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl shadow-lg border ${isDark ? 'border-gray-700/50' : 'border-white/20'} overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl ${isDark ? 'hover:bg-gray-900/80' : 'hover:bg-white/80'}`}>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <input
            className={`flex-1 text-lg font-medium ${isDark ? 'text-gray-200 placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'} bg-transparent focus:outline-none`}
            placeholder="Add a new task..."
            value={formData.title}
            onChange={e => updateFormData('title', e.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl transition-all duration-300`}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} p-5 space-y-4 ${isDark ? 'bg-gray-900/50' : 'bg-white/50'}`}>
          {/* Template selector */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Use Template</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300`}
              >
                <option value="">Select a template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            {templates.length === 0 && (
              <Link 
                href="/templates"
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Create your first template →
              </Link>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Description</label>
            <textarea
              value={formData.description}
              onChange={e => updateFormData('description', e.target.value)}
              placeholder="Add details about your task..."
              className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-400'} rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => updateFormData('dueDate', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Schedule Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.schedule.time}
                  onChange={e => updateFormData('schedule', { ...formData.schedule, time: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => updateFormData('category', e.target.value)}
                  placeholder="e.g., Work, Personal, Shopping"
                  className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>Priority</label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.priority}
                  onChange={e => updateFormData('priority', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* User Assignment Field */}
          <UserAssignmentField
            selectedUsers={formData.assignedUsers}
            onUsersChange={(users) => updateFormData('assignedUsers', users)}
            placeholder="Search users to assign this task..."
            maxUsers={5}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="reminder"
              checked={formData.schedule.reminder}
              onChange={e => updateFormData('schedule', { ...formData.schedule, reminder: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
            />
            <label htmlFor="reminder" className={`ml-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Set reminder
            </label>
          </div>
        </div>
      )}

      <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} p-5 flex justify-end ${isDark ? 'bg-gray-900/50' : 'bg-white/50'}`}>
        <button
          type="submit"
          disabled={!formData.title.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
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
  const { isDark } = useTheme();

  return (
    <div className="ml-0 sm:ml-9 mt-3 pb-4">
      <form
        className="flex flex-col sm:flex-row gap-2 mb-3"
        onSubmit={e => {
          e.preventDefault();
          if (subtaskTitle.trim()) {
            addSubtask(task.id, subtaskTitle);
            setSubtaskTitle('');
          }
        }}
      >
        <input
          className={`flex-1 ${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-400' : 'bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400'} border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
          placeholder="Add subtask..."
          value={subtaskTitle}
          onChange={e => setSubtaskTitle(e.target.value)}
        />
        <button
          type="submit"
          className={`px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} rounded-xl font-medium transition-all duration-300 hover:shadow-md active:scale-95`}
        >
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {task.subtasks?.map(st => (
          <li key={st.id} className="flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={st.completed}
                onChange={() => toggleSubtask(task.id, st.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors peer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded opacity-0 peer-checked:opacity-100 transition-opacity duration-300" />
            </div>
            <span className={`text-sm transition-all duration-300 flex-1 break-words ${
              st.completed 
                ? `line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}` 
                : isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {st.title}
            </span>
            <button
              onClick={() => deleteSubtask(task.id, st.id)}
              className={`sm:opacity-0 sm:group-hover:opacity-100 p-1 ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} rounded-lg transition-all duration-300 flex-shrink-0`}
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
  const { isDark } = useTheme();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR/hydration
  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className={`h-8 rounded w-1/4 mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-12 rounded mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
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
        return {
          bg: 'bg-gradient-to-r from-red-500/10 to-red-600/10',
          text: 'text-red-600',
          ring: 'ring-red-500/20'
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10',
          text: 'text-yellow-600',
          ring: 'ring-yellow-500/20'
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-green-500/10 to-green-600/10',
          text: 'text-green-600',
          ring: 'ring-green-500/20'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500/10 to-gray-600/10',
          text: 'text-gray-600',
          ring: 'ring-gray-500/20'
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 lg:py-8 px-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-3xl -z-10 ${isDark ? 'bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30' : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'}`} />
        <div className={`absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10 ${isDark ? 'opacity-20' : 'opacity-40'}`} />
        <h1 className="text-2xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Tasks</h1>
        <p className={`mb-6 lg:mb-8 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your tasks and stay organized</p>
      
      <TaskInput onAdd={addTask} />
      
      <div className="space-y-4">
        {tasks.length === 0 && (
            <div className={`text-center py-16 ${isDark ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl border ${isDark ? 'border-gray-700/50' : 'border-white/20'} shadow-xl`}>
              <div className="text-gray-400 text-7xl mb-6 animate-bounce">📝</div>
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-xl font-medium mb-3`}>No tasks yet</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Add your first task above to get started!</p>
          </div>
        )}
          {tasks.map(task => {
            const priorityColors = getPriorityColor(task.priority);
            return (
              <div 
                key={task.id} 
                className={`group ${isDark ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl shadow-lg border ${isDark ? 'border-gray-700/50' : 'border-white/20'} overflow-hidden transition-all duration-300 hover:shadow-xl ${isDark ? 'hover:bg-gray-900/80' : 'hover:bg-white/80'}`}
              >
                <div className="p-5">
              <div className="flex items-start sm:items-center gap-3">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`mt-1 sm:mt-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    task.completed
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent scale-105'
                      : 'border-gray-300 hover:border-blue-500 hover:scale-105'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                
                {editingId === task.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      className={`flex-1 ${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white/50 border-gray-200 text-gray-900'} border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(task)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} font-medium transition-all duration-300`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className={`text-base sm:text-lg transition-all duration-300 break-words ${task.completed ? `line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}` : isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                      {task.priority && (
                        <span className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ring-1 ${priorityColors.bg} ${priorityColors.text} ${priorityColors.ring} font-medium transition-all duration-300 self-start`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                  <button
                    onClick={() => startEdit(task)}
                    className={`p-2 ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} rounded-xl transition-all duration-300`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`p-2 ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} rounded-xl transition-all duration-300`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} ml-0 sm:ml-9`}>{task.description}</p>
              )}

              {(task.dueDate || task.category || task.assignedUsers?.length > 0) && (
                <div className="mt-3 ml-0 sm:ml-9 flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                  {task.dueDate && (
                    <div className={`flex items-center gap-2 ${isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-50 text-gray-700'} px-3 py-1.5 rounded-full`}>
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.category && (
                    <div className={`flex items-center gap-2 ${isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-50 text-gray-700'} px-3 py-1.5 rounded-full`}>
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm">{task.category}</span>
                    </div>
                  )}
                  {task.assignedUsers?.length > 0 && (
                    <div className={`flex items-center gap-2 ${isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-50 text-gray-700'} px-3 py-1.5 rounded-full`}>
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm">{task.assignedUsers.length} assigned</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Assigned Users Display */}
              {task.assignedUsers?.length > 0 && (
                <div className="mt-3 ml-0 sm:ml-9">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Assigned to:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.assignedUsers.map((user) => {
                      const roleColors = isDark ? {
                        member: 'bg-blue-900/30 text-blue-300 border-blue-700',
                        admin: 'bg-purple-900/30 text-purple-300 border-purple-700',
                        leader: 'bg-green-900/30 text-green-300 border-green-700'
                      } : {
                        member: 'bg-blue-100 text-blue-800 border-blue-200',
                        admin: 'bg-purple-100 text-purple-800 border-purple-200',
                        leader: 'bg-green-100 text-green-800 border-green-200'
                      };
                      
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs font-medium ${roleColors[user.role] || roleColors.member}`}
                        >
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-current opacity-20 flex items-center justify-center text-current text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="hidden sm:inline">{user.name}</span>
                          <span className="sm:hidden">{user.name.split(' ')[0]}</span>
                          <span className="opacity-70 hidden sm:inline">({user.role})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Subtasks */}
            <Subtasks task={task} />
          </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}