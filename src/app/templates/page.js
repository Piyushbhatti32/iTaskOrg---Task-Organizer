'use client';

import { useState } from 'react';
import { 
  useTemplates, 
  useAddTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate,
  useAddTask 
} from '../../store';

// Template form component for adding/editing templates
function TemplateForm({ onSubmit, initialData = null }) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows="3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Task Title</label>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {initialData ? 'Update Template' : 'Add Template'}
      </button>
    </form>
  );
}

// Template list item component
function TemplateItem({ template, onEdit, onDelete, onUse }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{template.name}</h3>
        <div className="space-x-2">
          <button
            onClick={() => onEdit(template)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
          <button
            onClick={() => onUse(template)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Use Template
          </button>
        </div>
      </div>
      {template.description && (
        <p className="text-gray-600 text-sm mb-2">{template.description}</p>
      )}
      <div className="text-sm text-gray-500">
        Task: {template.taskTitle} • Priority: {template.priority}
      </div>
    </div>
  );
}

// Main Templates page component
export default function TemplatesPage() {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const templates = useTemplates();
  const addTemplate = useAddTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const addTask = useAddTask();

  const handleSubmit = (templateData) => {
    if (editingTemplate) {
      updateTemplate(templateData);
      setEditingTemplate(null);
    } else {
      addTemplate(templateData);
    }
  };

  const handleUseTemplate = (template) => {
    addTask({
      title: template.taskTitle,
      priority: template.priority,
      description: template.description
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Templates</h1>
      
      <TemplateForm
        onSubmit={handleSubmit}
        initialData={editingTemplate}
      />

      <div className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-gray-500 text-center">No templates yet. Create one above!</p>
        ) : (
          templates.map(template => (
            <TemplateItem
              key={template.id}
              template={template}
              onEdit={setEditingTemplate}
              onDelete={deleteTemplate}
              onUse={handleUseTemplate}
            />
          ))
        )}
      </div>
    </div>
  );
} 