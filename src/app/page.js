'use client';

import { useState, useEffect } from 'react';
import {
  useStore,
  useAddTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskCompletion,
  useUncompletedTasks
} from '../store';

// Task form component
function TaskForm({ onSubmit, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'medium');
      setDueDate(initialData.dueDate || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      priority,
      dueDate,
      id: initialData?.id
    });
    if (!initialData) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {initialData ? 'Update Task' : 'Add Task'}
      </button>
    </form>
  );
}

// Task list component
function TaskList({ tasks = [], onToggle, onEdit, onDelete }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  return (
    <div className="space-y-4">
      {safeTasks.map(task => (
        <div key={task.id} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggle(task.id)}
                  className="mr-3 h-5 w-5 text-blue-600"
                />
                <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
              </div>
              {task.description && (
                <p className="mt-2 text-gray-600">{task.description}</p>
              )}
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(task)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main page component
export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  

  const tasks = useUncompletedTasks();
  const addTask = useAddTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTaskCompletion = useToggleTaskCompletion();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (taskData) => {
    if (taskData.id) {
      updateTask(taskData);
      setEditingTask(null);
    } else {
      addTask(taskData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleDelete = (taskId) => {
    deleteTask(taskId);
  };

  // Show loading state during SSR/hydration
  if (!isClient) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      
      <TaskForm
        onSubmit={handleSubmit}
        initialData={editingTask}
      />

      {editingTask && (
        <div className="mb-6">
          <button
            onClick={() => setEditingTask(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel editing
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No tasks yet. Add your first task above!
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onToggle={toggleTaskCompletion}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
