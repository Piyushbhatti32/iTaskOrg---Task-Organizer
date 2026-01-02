'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUncompletedTasks, useTaskActions, useTemplates } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import Link from 'next/link';
import { Calendar, Clock, Tag, Flag, AlignLeft, Plus, Edit2, Trash2, CheckCircle, ChevronDown, ChevronUp, FileText, Users, Filter, SortAsc, Search, X, Star, AlertCircle } from 'lucide-react';
import UserAssignmentField from '../../components/tasks/UserAssignmentField';
import { sendTaskCompletionNotification } from '../../utils/notifications';

// Enhanced Task Edit Modal
function TaskEditModal({ task, isOpen, onClose, onSave }) {
  const { isDark } = useTheme();
  const templates = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate || '',
    priority: task?.priority || 'medium',
    category: task?.category || '',
    schedule: {
      time: task?.schedule?.time || '',
      reminder: task?.schedule?.reminder || false
    },
    assignedUsers: task?.assignedUsers || []
  });

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        schedule: {
          time: task.schedule?.time || '',
          reminder: task.schedule?.reminder || false
        },
        assignedUsers: task.assignedUsers || []
      });
    }
  }, [task]);

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        title: template.taskTitle,
        description: template.description || '',
        priority: template.priority,
        templateId: template.id
      });
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({
        ...task,
        ...formData,
        updatedAt: new Date().toISOString()
      });
      onClose();
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative z-10 ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95`}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Edit Task</h2>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-xl transition-all duration-300`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Template selector */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Use Template</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300`}
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
            </div>

            {/* Title */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Task Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => updateFormData('title', e.target.value)}
                placeholder="Enter task title..."
                className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Description</label>
              <textarea
                value={formData.description}
                onChange={e => updateFormData('description', e.target.value)}
                placeholder="Add details about your task..."
                className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                rows="4"
              />
            </div>

            {/* Due Date and Schedule Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => updateFormData('dueDate', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Schedule Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.schedule.time}
                    onChange={e => updateFormData('schedule', { ...formData.schedule, time: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>
              </div>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => updateFormData('category', e.target.value)}
                    placeholder="e.g., Work, Personal, Shopping"
                    className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Priority</label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.priority}
                    onChange={e => updateFormData('priority', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300`}
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
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Assign To</label>
              <UserAssignmentField
                selectedUsers={formData.assignedUsers}
                onUsersChange={(users) => updateFormData('assignedUsers', users)}
                placeholder="Search users to assign this task..."
                maxUsers={5}
              />
            </div>

            {/* Reminder */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="edit-reminder"
                checked={formData.schedule.reminder}
                onChange={e => updateFormData('schedule', { ...formData.schedule, reminder: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
              />
              <label htmlFor="edit-reminder" className={`ml-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Set reminder
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex gap-3 p-6 border-t ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <Edit2 className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Task input form for adding new tasks
function TaskInput({ onAdd, currentUser }) {
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
                className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all duration-300`}
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
              className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-400'} rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300`}
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
                  className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300`}
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
                  className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300`}
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
                  className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all duration-300`}
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
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 transition-colors peer"
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const { isDark } = useTheme();
  
  // Mock current user - you should replace this with actual auth context
  const currentUser = {
    id: 'current-user-id',
    name: 'Current User',
    email: 'user@example.com',
    role: 'member'
  };

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

  // Handle opening edit modal
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setEditModalOpen(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setTaskToEdit(null);
  };

  // Handle saving task from modal
  const handleSaveTask = (updatedTask) => {
    updateTask(updatedTask);
  };

  // Enhanced task creation with auto-assign functionality
  const handleAddTask = (taskData) => {
    const finalTaskData = {
      ...taskData,
      // Auto-assign to current user if no users are assigned
      assignedUsers: taskData.assignedUsers.length > 0 
        ? taskData.assignedUsers 
        : [currentUser]
    };
    addTask(finalTaskData);
  };

  // Handle editing a task title (inline editing - kept for backward compatibility)
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

// Handle toggle task completion with confirmation
  const handleToggleTaskCompletion = (taskId) => {
    setCurrentTaskId(taskId);
    setShowConfirmation(true);
  };

  const confirmToggleCompletion = () => {
    if (currentTaskId !== null) {
      toggleTaskCompletion(currentTaskId);
      // Show success notification
      // Implement toast or notification logic here
      sendTaskCompletionNotification(currentTaskId);
    }
    setShowConfirmation(false);
    setCurrentTaskId(null);
  };

  const cancelToggleCompletion = () => {
    setShowConfirmation(false);
    setCurrentTaskId(null);
  };

  // Handle delete task with confirmation
  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
    }
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 lg:py-8 px-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-3xl -z-10 ${isDark ? 'bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30' : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'}`} />
        <div className={`absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10 ${isDark ? 'opacity-20' : 'opacity-40'}`} />
        <h1 className="text-2xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Tasks</h1>
        <p className={`mb-6 lg:mb-8 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your tasks and stay organized</p>
      
      <TaskInput onAdd={handleAddTask} currentUser={currentUser} />
      
      {/* Edit Task Modal */}
      <TaskEditModal 
        task={taskToEdit}
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveTask}
      />
      
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with enhanced blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={cancelDeleteTask}
          />
          
          {/* Enhanced Dialog with animations */}
          <div className={`relative z-10 ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95`}>
            {/* Warning animation wrapper */}
            <div className="text-center mb-6">
              <div className="relative">
                {/* Animated rings */}
                <div className="absolute inset-0 animate-ping">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full"></div>
                </div>
                <div className="relative w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-in spin-in-180 duration-500">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Delete Task?
              </h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base leading-relaxed max-w-sm mx-auto`}>
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>
            
            {/* Enhanced buttons with better styling */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={cancelDeleteTask}
                className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-yellow-600 text-white font-semibold hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Yes, Delete!
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      )}
      
    {showConfirmation && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with enhanced blur */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          onClick={cancelToggleCompletion}
        />
        
        {/* Enhanced Dialog with animations */}
        <div className={`relative z-10 ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95`}>
          {/* Success animation wrapper */}
          <div className="text-center mb-6">
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 animate-ping">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"></div>
              </div>
              <div className="relative w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-in spin-in-180 duration-500">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Complete Task?
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base leading-relaxed max-w-sm mx-auto`}>
              Great job! Are you ready to mark this task as completed? You can always undo this action later.
            </p>
          </div>
          
          {/* Enhanced buttons with better styling */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={cancelToggleCompletion}
              className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                isDark 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              Not Yet
            </button>
            <button
              onClick={confirmToggleCompletion}
              className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Yes, Complete!
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="space-y-4">
        {tasks.length === 0 && (
            <div className={`text-center py-16 ${isDark ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl border ${isDark ? 'border-gray-700/50' : 'border-white/20'} shadow-xl`}>
              <div className="text-gray-400 text-7xl mb-6 animate-bounce">📝</div>
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-xl font-medium mb-3`}>No tasks yet</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Add your first task above to get started!</p>
          </div>
        )}
          {tasks.map((task, index) => {
            const priorityColors = getPriorityColor(task.priority);
            return (
              <div 
                key={task.id} 
                className={`group ${isDark ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl shadow-lg border ${isDark ? 'border-gray-700/50' : 'border-white/20'} overflow-hidden transition-all duration-300 hover:shadow-xl ${isDark ? 'hover:bg-gray-900/80' : 'hover:bg-white/80'} hover-lift slide-up stagger-${Math.min(index + 1, 5)}`}
              >
                <div className="p-5">
              <div className="flex items-start sm:items-center gap-3">
                <button
onClick={() => handleToggleTaskCompletion(task.id)}
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
                    onClick={() => handleEditTask(task)}
                    className={`p-2 ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} rounded-xl transition-all duration-300`}
                    title="Edit all task details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className={`p-2 ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} rounded-xl transition-all duration-300`}
                    title="Delete task"
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
                      		<span className="text-xs sm:text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
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