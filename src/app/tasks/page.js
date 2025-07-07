'use client';

import { useState } from 'react';
import { 
  useUncompletedTasks,
  useAddTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskCompletion
} from '../../store';
import Link from 'next/link';

// Task input form for adding new tasks
function TaskInput({ onAdd }) {
  const [title, setTitle] = useState('');
  return (
    <form
      className="flex gap-2 mb-6"
      onSubmit={e => {
        e.preventDefault();
        if (title.trim()) {
          onAdd({ title });
          setTitle('');
        }
      }}
    >
      <input
        className="border rounded px-3 py-2 flex-1"
        placeholder="Add a new task..."
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Add
      </button>
    </form>
  );
}

// Subtask list and controls
function Subtasks({ task }) {
  const { addSubtask, toggleSubtask, deleteSubtask } = useTaskActions();
  const [subtaskTitle, setSubtaskTitle] = useState('');
  return (
    <div className="ml-6 mt-2">
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
          className="border rounded px-2 py-1 flex-1"
          placeholder="Add subtask..."
          value={subtaskTitle}
          onChange={e => setSubtaskTitle(e.target.value)}
        />
        <button className="bg-gray-200 px-2 py-1 rounded" type="submit">
          +
        </button>
      </form>
      <ul>
        {task.subtasks?.map(st => (
          <li key={st.id} className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={st.completed}
              onChange={() => toggleSubtask(task.id, st.id)}
            />
            <span className={st.completed ? 'line-through text-gray-400' : ''}>{st.title}</span>
            <button
              className="text-xs text-red-500 ml-2"
              onClick={() => deleteSubtask(task.id, st.id)}
              title="Delete subtask"
            >
              Delete
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
    return <div className="p-6">Loading...</div>;
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      <TaskInput onAdd={addTask} />
      
      <div className="space-y-4">
        {tasks.length === 0 && <div className="text-center text-gray-500 py-8">No tasks yet. Add your first task above!</div>}
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="h-5 w-5"
              />
              {editingId === task.id ? (
                <>
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                  <button className="text-blue-600 ml-2" onClick={() => saveEdit(task)}>
                    Save
                  </button>
                  <button className="text-gray-400 ml-1" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.title}</span>
                  <button className="text-xs text-blue-600 ml-2" onClick={() => startEdit(task)}>
                    Edit
                  </button>
                </>
              )}
              <button
                className="text-xs text-red-500 ml-4"
                onClick={() => deleteTask(task.id)}
                title="Delete task"
              >
                Delete
              </button>
            </div>
            {/* Subtasks for this task */}
            <Subtasks task={task} />
          </div>
        ))}
      </div>
      <Link href="/" className="block mt-8 text-blue-600 hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
}