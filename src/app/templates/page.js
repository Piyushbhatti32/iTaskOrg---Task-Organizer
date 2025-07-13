'use client';

import { useState } from 'react';
import { useTemplates, useAddTemplate, useUpdateTemplate, useDeleteTemplate, useAddTask } from '../../store';

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
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Template' : 'Create New Template'}
        </h2>
        {initialData && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter template name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          placeholder="Optional description for this template"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter task title"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        {initialData ? 'Update Template' : 'Add Template'}
      </button>
    </div>
  );
}

// Template list item component
function TemplateItem({ template, onEdit, onDelete, onUse }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(template.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Task:</span>
            <span className="text-sm font-medium text-gray-900">{template.taskTitle}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(template.priority)}`}>
              {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(template)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className={`text-sm font-medium hover:underline ${
              showConfirmDelete ? 'text-red-800 bg-red-100 px-2 py-1 rounded' : 'text-red-600 hover:text-red-800'
            }`}
          >
            {showConfirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
          {showConfirmDelete && (
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium hover:underline"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onUse(template)}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
          >
            Use Template
          </button>
        </div>
      </div>
      
      {template.description && (
        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-md">
          {template.description}
        </p>
      )}
    </div>
  );
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
      showSuccessMessage('Template updated successfully!');
    } else {
      addTemplate(templateData);
      showSuccessMessage('Template created successfully!');
    }
  };

  const handleUseTemplate = (template) => {
    addTask({
      title: template.taskTitle,
      priority: template.priority,
      description: template.description
    });
    showSuccessMessage('Task created from template!');
  };

  const handleDelete = (templateId) => {
    deleteTemplate(templateId);
    showSuccessMessage('Template deleted successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates</h1>
        <p className="text-gray-600">Create and manage reusable task templates to speed up your workflow.</p>
      </div>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      <TemplateForm
        onSubmit={handleSubmit}
        initialData={editingTemplate}
        onCancel={() => setEditingTemplate(null)}
      />

      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg mb-2">No templates yet</p>
            <p className="text-gray-400 text-sm">Create your first template above to get started!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Templates</h2>
              <span className="text-sm text-gray-500">{templates.length} template{templates.length !== 1 ? 's' : ''}</span>
            </div>
            {templates.map(template => (
              <TemplateItem
                key={template.id}
                template={template}
                onEdit={setEditingTemplate}
                onDelete={handleDelete}
                onUse={handleUseTemplate}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
} 