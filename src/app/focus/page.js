'use client';

import { useState, useEffect } from 'react';
import { useStore, useUpdateTask, useUncompletedTasks } from '../../store';

// Timer display component showing minutes and seconds
function TimerDisplay({ timeLeft }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <div className="text-6xl font-bold text-center mb-8">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

// Task selector component
function TaskSelector({ selectedTaskId, onSelectTask }) {
  const tasks = useUncompletedTasks();
  return (
    <select
      value={selectedTaskId || ''}
      onChange={(e) => onSelectTask(e.target.value)}
      className="w-full p-2 border rounded mb-4"
    >
      <option value="">Select a task to focus on...</option>
      {tasks.map(task => (
        <option key={task.id} value={task.id}>
          {task.title}
        </option>
      ))}
    </select>
  );
}

// Main Focus page component
export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const updateTask = useUpdateTask();
  const tasks = useUncompletedTasks();

  // Timer effect
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (!isBreak) {
        // Work session completed
        setSessionCount(prev => prev + 1);
        if (selectedTaskId) {
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            updateTask({
              ...task,
              completedPomodoros: (task.completedPomodoros || 0) + 1
            });
          }
        }
        // Start break
        setTimeLeft(sessionCount % 4 === 3 ? 15 * 60 : 5 * 60); // 15 min break every 4 sessions
        setIsBreak(true);
      } else {
        // Break completed
        setTimeLeft(25 * 60);
        setIsBreak(false);
      }
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak, selectedTaskId, sessionCount, tasks, updateTask]);

  const toggleTimer = () => {
    if (!selectedTaskId && !isBreak) {
      alert('Please select a task first');
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Focus Mode</h1>
      
      {!isBreak && (
        <TaskSelector
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />
      )}

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-4">
          <div className="text-xl font-semibold text-gray-600">
            {isBreak ? 'Break Time!' : 'Focus Time'}
          </div>
          <div className="text-sm text-gray-500">
            Session {sessionCount + 1}
          </div>
        </div>

        <TimerDisplay timeLeft={timeLeft} />

        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2 rounded ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
} 