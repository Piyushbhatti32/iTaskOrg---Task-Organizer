'use client';

import { useState } from 'react';
import { useTasks } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

// Task statistics calculation
function calculateTaskStats(tasks) {
  if (!Array.isArray(tasks)) return { completed: 0, total: 0, highPriority: 0, overdue: 0 };
  
  const completedTasks = tasks.filter(t => t?.completed).length;
  const totalTasks = tasks.length;
  const highPriorityTasks = tasks.filter(t => t?.priority === 'high').length;
  const overdueTasks = tasks.filter(t => {
    if (!t?.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return !t.completed && dueDate < new Date();
  }).length;

  return {
    completed: completedTasks,
    total: totalTasks,
    highPriority: highPriorityTasks,
    overdue: overdueTasks
  };
}

// Weekly task completion chart
function WeeklyChart({ tasks, isDark }) {
  if (!Array.isArray(tasks)) return null;

  const startDate = startOfWeek(new Date());
  const endDate = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDay = (date) => {
    return tasks.filter(task => {
      if (!task?.completedAt) return false;
      const completionDate = new Date(task.completedAt);
      return format(completionDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    }).length;
  };

  const maxTasks = Math.max(...weekDays.map(getTasksForDay));
  const barHeight = (count) => (maxTasks > 0 ? (count / maxTasks) * 100 : 0);

  return (
    <div className={`slide-up stagger-5 mt-8 backdrop-blur-sm rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${
      isDark 
        ? 'bg-gray-800/70 border-gray-700/30 hover:bg-gray-800/80' 
        : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Weekly Task Completion</h3>
      <div className="flex items-end justify-between h-40 gap-2">
        {weekDays.map(day => {
          const taskCount = getTasksForDay(day);
          return (
            <div key={day.toString()} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t transition-all duration-300"
                style={{ height: `${barHeight(taskCount)}%` }}
              />
              <div className={`text-xs mt-2 font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>{format(day, 'EEE')}</div>
              <div className={`text-xs font-bold ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>{taskCount}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Priority distribution chart
function PriorityChart({ tasks, isDark }) {
  if (!Array.isArray(tasks)) return null;

  const priorityCounts = {
    high: tasks.filter(t => t?.priority === 'high').length,
    medium: tasks.filter(t => t?.priority === 'medium').length,
    low: tasks.filter(t => t?.priority === 'low').length
  };

  const total = Object.values(priorityCounts).reduce((a, b) => a + b, 0);
  const getPercentage = (count) => (total > 0 ? (count / total) * 100 : 0);

  return (
    <div className={`slide-up stagger-6 mt-8 backdrop-blur-sm rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${
      isDark 
        ? 'bg-gray-800/70 border-gray-700/30 hover:bg-gray-800/80' 
        : 'bg-white/70 border-white/20 hover:bg-white/80'
    }`}>
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Task Priority Distribution</h3>
      <div className="space-y-4">
        {Object.entries(priorityCounts).map(([priority, count]) => (
          <div key={priority}>
            <div className="flex justify-between text-sm mb-2">
              <span className={`capitalize font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>{priority}</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{count} tasks ({Math.round(getPercentage(count))}%)</span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  priority === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${getPercentage(count)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Statistics page component
export default function StatsPage() {
  const tasks = useTasks();
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'
  const { isDark } = useTheme();

  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter(task => {
        if (!task) return false;
        if (timeRange === 'all') return true;
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        const now = new Date();
        if (timeRange === 'week') {
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return taskDate >= weekAgo;
        } else if (timeRange === 'month') {
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return taskDate >= monthAgo;
        }
        return true;
      })
    : [];

  const stats = calculateTaskStats(filteredTasks);

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'
    }`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="relative mb-8">
          <div className={`absolute inset-0 rounded-3xl -z-10 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' 
              : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'
          }`} />
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10" />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Statistics</h1>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`border rounded-xl px-4 py-2.5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 bg-gray-800/70 text-gray-200' 
                  : 'border-gray-200 bg-white/70 text-gray-900'
              }`}
            >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
          <p className={`mt-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Track your productivity with comprehensive task analytics and insights.</p>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`slide-up hover-lift stagger-1 backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
            isDark 
              ? 'bg-gray-800/70 border-gray-700/30 hover:bg-gray-800/80' 
              : 'bg-white/70 border-white/20 hover:bg-white/80'
          }`}>
            <h3 className={`font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Tasks</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</p>
          </div>
          <div className={`slide-up hover-lift stagger-2 backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
            isDark 
              ? 'bg-gray-800/70 border-gray-700/30 hover:bg-gray-800/80' 
              : 'bg-white/70 border-white/20 hover:bg-white/80'
          }`}>
            <h3 className={`font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Completed Tasks</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className={`slide-up hover-lift stagger-3 backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
            isDark 
              ? 'bg-gray-800/70 border-gray-700/30 hover:bg-gray-800/80' 
              : 'bg-white/70 border-white/20 hover:bg-white/80'
          }`}>
            <h3 className={`font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>High Priority</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.highPriority}</p>
          </div>
          <div className={`slide-up hover-lift stagger-4 backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
            isDark 
              ? 'bg-gray-800/70 border-gray-700/30 hover:bg-gray-800/80' 
              : 'bg-white/70 border-white/20 hover:bg-white/80'
          }`}>
            <h3 className={`font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Overdue Tasks</h3>
            <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>

        <WeeklyChart tasks={filteredTasks} isDark={isDark} />
        <PriorityChart tasks={filteredTasks} isDark={isDark} />
      </div>
    </div>
  );
} 