'use client';

import { useState } from 'react';
import { useTemplates, useAddTemplate, useUpdateTemplate, useDeleteTemplate, useAddTask, useStore } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { auth } from '../../config/firebase';

// Template form component for adding/editing templates
function TemplateForm({ onSubmit, initialData = null, onCancel }) {
  const { isDark, accentColor } = useTheme();
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [taskTitle, setTaskTitle] = useState(initialData?.taskTitle || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      taskTitle,
      priority,
      id: initialData?.id
    });
    if (!initialData) {
      setName('');
      setDescription('');
      setTaskTitle('');
      setPriority('medium');
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setName('');
    setDescription('');
    setTaskTitle('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8 border transition-all duration-300 slide-up stagger-2 hover-lift ${
      isDark 
        ? 'bg-gray-900/70 border-gray-700' 
        : 'bg-white/80 border-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
          isDark 
            ? 'from-white to-gray-200' 
            : 'from-blue-600 to-blue-800'
        }`}>
          {initialData ? 'Edit Template' : 'Create New Template'}
        </h2>
        {initialData && (
          <button
            type="button"
            onClick={handleCancel}
            className={`text-sm font-medium px-3 py-1 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="space-y-4">
      <div>
          <label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>Template Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
            className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200 ${
              isDark 
                ? 'bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500/20' 
                : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          placeholder="Enter template name"
          required
        />
      </div>
      
      <div>
          <label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
            className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
              isDark 
                ? 'bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500/20' 
                : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          rows="3"
          placeholder="Optional description for this template"
        />
      </div>
      
      <div>
          <label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>Task Title</label>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
            className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200 ${
              isDark 
                ? 'bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500/20' 
                : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          placeholder="Enter task title"
          required
        />
      </div>
      
      <div>
          <label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>Priority</label>
          <div className="relative">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-600 text-gray-100 focus:border-gray-500 focus:ring-gray-500/20' 
                  : 'bg-white/50 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
        >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
        </select>
            <div className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium shadow-lg transform hover:scale-[1.02] active:scale-[0.98] hover-glow"
        style={{
          backgroundColor: `var(--color-primary-500)`,
          boxShadow: `0 10px 25px -5px var(--color-primary-500)40`,
          ':focus': {
            ringColor: `var(--color-primary-300)`
          }
        }}
        onMouseEnter={(e) => {
          e.target.style.filter = 'brightness(1.1)';
          e.target.style.boxShadow = `0 15px 30px -5px var(--color-primary-500)60`;
        }}
        onMouseLeave={(e) => {
          e.target.style.filter = 'brightness(1)';
          e.target.style.boxShadow = `0 10px 25px -5px var(--color-primary-500)40`;
        }}
      >
        {initialData ? 'Update Template' : 'Add Template'}
      </button>
    </form>
  );
}

// Template list item component
function TemplateItem({ template, onEdit, onDelete, onUse }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const { isDark } = useTheme();
  
  // Get all tasks to find ones created from this template
  const tasks = useStore(state => state.tasks || []);
  const linkedTasks = tasks.filter(task => task.templateId === template.id);
  const completedTasks = linkedTasks.filter(task => task.completed);
  const pendingTasks = linkedTasks.filter(task => !task.completed);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'text-red-700 bg-gradient-to-r from-red-100 to-red-50',
          icon: '🔴'
        };
      case 'medium':
        return {
          badge: 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-yellow-50',
          icon: '🟡'
        };
      case 'low':
        return {
          badge: 'text-green-700 bg-gradient-to-r from-green-100 to-green-50',
          icon: '🟢'
        };
      default:
        return {
          badge: 'text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50',
          icon: '⚪'
        };
    }
  };

  const priorityStyle = getPriorityStyle(template.priority);
  
  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(template.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl group slide-up hover-lift ${
        isDark 
          ? 'bg-gray-900/80 border-gray-700 hover:bg-gray-900/90' 
          : 'bg-white/80 border-gray-100 hover:bg-white/90'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
        <h3 className={`text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-200 ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {template.name}
        </h3>
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityStyle.badge}`}>
              {priorityStyle.icon} {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)}
            </span>
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Task: <span className={`font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>{template.taskTitle}</span>
            </span>
          </div>
          
          {/* Task statistics */}
          {linkedTasks.length > 0 && (
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => setShowTasks(!showTasks)}
                className={`text-sm flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 ${
                  isDark
                    ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                <svg className={`w-4 h-4 transition-transform duration-200 ${showTasks ? 'rotate-90' : ''}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                {linkedTasks.length} task{linkedTasks.length !== 1 ? 's' : ''} created
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  ✓ {completedTasks.length} completed
                </span>
                {pendingTasks.length > 0 && (
                  <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    ⏳ {pendingTasks.length} pending
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(template)}
            className={`p-2 rounded-lg transition-all duration-200 group/btn ${
              isDark
                ? 'text-gray-400 hover:text-blue-400 bg-gray-800/50 hover:bg-blue-900/20'
                : 'text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-all duration-200 group/btn ${
              showConfirmDelete
                ? isDark
                  ? 'text-red-400 bg-red-900/50'
                  : 'text-red-700 bg-red-50'
                : isDark
                  ? 'text-gray-400 bg-gray-800/50 hover:text-red-400 hover:bg-red-900/20'
                  : 'text-gray-600 bg-gray-50 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="sr-only">Delete</span>
          </button>
          <button
            onClick={() => onUse(template)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600
                     text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700
                     focus:outline-none focus:ring-2 focus:ring-green-500/20
                     transition-all duration-200 font-medium shadow-lg shadow-green-500/25
                     transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Use
          </button>
        </div>
      </div>
      
      {template.description && (
        <div className={`backdrop-blur-sm p-4 rounded-xl text-sm leading-relaxed transition-all duration-300 ${
          isDark
            ? `bg-gray-800/50 text-gray-300 ${isHovered ? 'bg-gray-700/50' : ''}`
            : `bg-gray-50/80 text-gray-600 ${isHovered ? 'bg-gray-100/80' : ''}`
        }`}>
          {template.description}
        </div>
      )}

      {/* Linked tasks list */}
      {showTasks && linkedTasks.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className={`text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>Tasks created from this template:</h4>
          {linkedTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                task.completed 
                  ? isDark
                    ? 'bg-green-900/20 text-green-400'
                    : 'bg-green-50/50 text-green-800'
                  : isDark
                    ? 'bg-gray-700/50 text-gray-300'
                    : 'bg-gray-50/50 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className={task.completed 
                  ? isDark
                    ? 'line-through text-green-400'
                    : 'line-through text-green-700'
                  : ''
                }>
                  {task.title}
                </span>
              </div>
              <div className="text-xs">
                {task.completed ? 'Completed' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Success message component
function SuccessMessage({ message }) {
  return message ? (
    <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200
                    text-green-700 rounded-xl flex items-center gap-3 animate-fade-in">
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  ) : null;
}

// Main Templates page component
export default function TemplatesPage() {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const templates = useTemplates();
  const addTemplate = useAddTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const addTask = useAddTask();
  const { isDark } = useTheme();

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (templateData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(templateData);
        setEditingTemplate(null);
        showSuccessMessage('Template updated successfully! 🎉');
      } else {
        // Get current user from auth
        const user = auth?.currentUser;
        if (user) {
          await addTemplate(user.uid, templateData);
          showSuccessMessage('Template created successfully! ✨');
        } else {
          throw new Error('User must be authenticated to create templates');
        }
      }
    } catch (error) {
      console.error('Error handling template:', error);
      showSuccessMessage('Error: ' + error.message);
    }
  };

  const handleUseTemplate = (template) => {
    // Add templateId to link the task with its source template
    addTask({
      title: template.taskTitle,
      priority: template.priority,
      description: template.description,
      templateId: template.id // Add this line to link the task to its template
    });
    showSuccessMessage('Task created from template! 📋');
  };

  const handleDelete = (templateId) => {
    deleteTemplate(templateId);
    showSuccessMessage('Template deleted successfully! 🗑️');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 slide-up stagger-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
          Templates
        </h1>
        <p className={`text-lg ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Create and manage reusable task templates to speed up your workflow.
        </p>
      </div>
      
      <SuccessMessage message={successMessage} />
      
      <TemplateForm
        onSubmit={handleSubmit}
        initialData={editingTemplate}
        onCancel={() => setEditingTemplate(null)}
      />

      <div className="space-y-6">
        {templates.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl border-2 border-dashed transition-all duration-300 slide-up stagger-4 ${
            isDark 
              ? 'bg-gray-800/50 border-gray-600 text-gray-400' 
              : 'bg-gray-50/50 border-gray-200 text-gray-500'
          }`}>
            <p className="text-lg">No templates yet. Create your first template to get started! ✨</p>
          </div>
        ) : (
          templates.map((template, index) => (
              <div key={template.id} className={`slide-up stagger-${Math.min(index + 4, 8)}`}>
                <TemplateItem
                  template={template}
                  onEdit={setEditingTemplate}
                  onDelete={handleDelete}
                  onUse={handleUseTemplate}
                />
              </div>
          ))
        )}
      </div>
    </div>
  );
} 