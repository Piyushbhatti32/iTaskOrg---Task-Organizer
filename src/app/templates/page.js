'use client';

import { useState } from 'react';
import { useTemplates, useAddTemplate, useUpdateTemplate, useDeleteTemplate, useAddTask, useStore } from '../../store';

// Template form component for adding/editing templates
function TemplateForm({ onSubmit, initialData = null, onCancel }) {
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8 border border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          {initialData ? 'Edit Template' : 'Create New Template'}
        </h2>
        {initialData && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="space-y-4">
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/50
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                     transition-all duration-200"
          placeholder="Enter template name"
          required
        />
      </div>
      
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/50
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                     transition-all duration-200 resize-none"
          rows="3"
          placeholder="Optional description for this template"
        />
      </div>
      
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Title</label>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/50
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                     transition-all duration-200"
          placeholder="Enter task title"
          required
        />
      </div>
      
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
          <div className="relative">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/50
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                       transition-all duration-200 appearance-none"
        >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
        </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl
                 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25
                 transform hover:scale-[1.02] active:scale-[0.98]"
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

  return (
    <div
      className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100
                 transition-all duration-300 hover:shadow-xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {template.name}
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityStyle.badge}`}>
              {priorityStyle.icon} {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Task: <span className="font-medium text-gray-700">{template.taskTitle}</span>
            </span>
          </div>
          
          {/* Task statistics */}
          {linkedTasks.length > 0 && (
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => setShowTasks(!showTasks)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
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
            className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50
                     transition-all duration-200 group/btn"
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
                ? 'text-red-700 bg-red-50'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
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
        <div className={`bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl text-gray-600 text-sm leading-relaxed
                      transition-all duration-300 ${isHovered ? 'bg-gray-100/80' : ''}`}>
          {template.description}
        </div>
      )}

      {/* Linked tasks list */}
      {showTasks && linkedTasks.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tasks created from this template:</h4>
          {linkedTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg text-sm
                         ${task.completed 
                           ? 'bg-green-50/50 text-green-800'
                           : 'bg-gray-50/50 text-gray-800'
                         }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className={task.completed ? 'line-through text-green-700' : ''}>
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

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = (templateData) => {
    if (editingTemplate) {
      updateTemplate(templateData);
      setEditingTemplate(null);
      showSuccessMessage('Template updated successfully! 🎉');
    } else {
      addTemplate(templateData);
      showSuccessMessage('Template created successfully! ✨');
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
          Templates
        </h1>
        <p className="text-gray-600 text-lg">
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
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">No templates yet. Create your first template to get started! ✨</p>
          </div>
        ) : (
          templates.map(template => (
              <TemplateItem
                key={template.id}
                template={template}
                onEdit={setEditingTemplate}
                onDelete={handleDelete}
                onUse={handleUseTemplate}
              />
          ))
        )}
      </div>
    </div>
  );
} 