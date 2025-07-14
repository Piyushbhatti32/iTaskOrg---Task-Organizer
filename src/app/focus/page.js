'use client';

import { useState, useEffect } from 'react';
import { useStore, useUpdateTask, useUncompletedTasks } from '../../store';

// Timer display component showing minutes and seconds
function TimerDisplay({ timeLeft, isBreak, isRunning }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = ((timeLeft / (isBreak ? (timeLeft >= 15 * 60 ? 15 * 60 : 5 * 60) : 25 * 60)) * 100).toFixed(1);
  
  return (
    <div className="relative w-72 h-72 mx-auto mb-8">
      {/* Background pulse animation when running */}
      {isRunning && (
        <div className={`absolute inset-0 rounded-full ${isBreak ? 'animate-pulse-green' : 'animate-pulse-blue'}`} />
      )}
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circles for depth */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="2"
          className="transition-all duration-200"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
          className="transition-all duration-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={isBreak ? '#10B981' : '#3B82F6'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="282.743"
          strokeDashoffset={282.743 - (282.743 * percentage) / 100}
          className="transition-all duration-1000"
          transform="rotate(-90 50 50)"
          style={{
            filter: `drop-shadow(0 0 8px ${isBreak ? '#10B981' : '#3B82F6'})`
          }}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
        <div className="text-7xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-mono tracking-tight">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm font-medium text-gray-500 mt-2">
          {percentage}% remaining
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {isBreak ? 'Break ends in' : 'Focus ends in'} {minutes}m {seconds}s
        </div>
      </div>
    </div>
  );
}

// Task selector component
function TaskSelector({ selectedTaskId, onSelectTask }) {
  const tasks = useUncompletedTasks();
  return (
    <div className="relative">
    <select
      value={selectedTaskId || ''}
      onChange={(e) => onSelectTask(e.target.value)}
        className="w-full p-4 pl-5 pr-10 border border-gray-200 rounded-2xl bg-white/90 backdrop-blur-sm
                 text-gray-700 appearance-none hover:border-blue-400 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
    >
      <option value="">Select a task to focus on...</option>
      {tasks.map(task => (
          <option key={task.id} value={task.id} className="py-2">
          {task.title}
        </option>
      ))}
    </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
        <svg className="w-5 h-5 transition-transform duration-200 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// Session progress component
function SessionProgress({ sessionCount, totalSessions = 4 }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <div className="flex justify-center gap-3">
        {Array.from({ length: totalSessions }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
              index < (sessionCount % totalSessions)
                ? 'bg-blue-500 scale-110'
                : 'bg-gray-200'
            }`}
          >
            {index < (sessionCount % totalSessions) && (
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-500">
        Session {(sessionCount % totalSessions) + 1} of {totalSessions}
      </div>
    </div>
  );
}

// Stats display component
function StatsDisplay({ sessionCount, totalFocusTime }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-gray-700">{sessionCount}</div>
        <div className="text-sm text-gray-500">Sessions Completed</div>
      </div>
      <div className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-gray-700">
          {Math.round(totalFocusTime / 60)}m
        </div>
        <div className="text-sm text-gray-500">Total Focus Time</div>
      </div>
    </div>
  );
}

// Main Focus page component
export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const updateTask = useUpdateTask();
  const tasks = useUncompletedTasks();

  // Timer effect
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (!isBreak) {
          setTotalFocusTime(prev => prev + 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
      
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
        setTimeLeft(sessionCount % 4 === 3 ? 15 * 60 : 5 * 60);
        setIsBreak(true);
      } else {
        // Break completed
        setTimeLeft(25 * 60);
        setIsBreak(false);
      }
      setIsRunning(false);

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(isBreak ? 'Break Complete!' : 'Focus Session Complete!', {
          body: isBreak ? 'Ready to focus again?' : 'Time for a break!',
          icon: '/favicon.ico'
        });
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak, selectedTaskId, sessionCount, tasks, updateTask]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => {
    if (!selectedTaskId && !isBreak) {
      alert('Please select a task first');
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (isRunning) {
      const shouldReset = window.confirm('Timer is still running. Are you sure you want to reset?');
      if (!shouldReset) return;
    }
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent text-center">
          Focus Mode
        </h1>
        
        <StatsDisplay sessionCount={sessionCount} totalFocusTime={totalFocusTime} />
      
      {!isBreak && (
          <div className="mb-8">
        <TaskSelector
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />
          </div>
        )}

        <div className="text-center mb-6">
          <div className={`text-xl font-semibold mb-2 ${
            isBreak ? 'text-green-600' : 'text-blue-600'
          }`}>
            {isBreak ? '🌿 Break Time!' : '🎯 Focus Time'}
          </div>
          <SessionProgress sessionCount={sessionCount} />
        </div>

        <TimerDisplay timeLeft={timeLeft} isBreak={isBreak} isRunning={isRunning} />

        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`
              px-8 py-3 rounded-xl font-medium text-white
              transform transition-all duration-200
              active:scale-95 shadow-lg
              ${isRunning
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/25'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Start
                </>
              )}
            </span>
          </button>
          <button
            onClick={resetTimer}
            className="
              px-8 py-3 rounded-xl font-medium
              bg-gradient-to-r from-gray-100 to-gray-200
              hover:from-gray-200 hover:to-gray-300
              text-gray-700 transform transition-all duration-200
              active:scale-95 shadow-lg shadow-gray-200/25
              flex items-center gap-2
            "
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
} 