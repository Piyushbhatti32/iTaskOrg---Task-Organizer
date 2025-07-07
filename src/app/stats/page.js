'use client';

import { useState } from 'react';
import { useTaskStats } from '../../store';
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
function WeeklyChart({ tasks }) {
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
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Weekly Task Completion</h3>
      <div className="flex items-end justify-between h-40 gap-2">
        {weekDays.map(day => {
          const taskCount = getTasksForDay(day);
          return (
            <div key={day.toString()} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${barHeight(taskCount)}%` }}
              />
              <div className="text-xs mt-2">{format(day, 'EEE')}</div>
              <div className="text-xs">{taskCount}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Priority distribution chart
function PriorityChart({ tasks }) {
  if (!Array.isArray(tasks)) return null;

  const priorityCounts = {
    high: tasks.filter(t => t?.priority === 'high').length,
    medium: tasks.filter(t => t?.priority === 'medium').length,
    low: tasks.filter(t => t?.priority === 'low').length
  };

  const total = Object.values(priorityCounts).reduce((a, b) => a + b, 0);
  const getPercentage = (count) => (total > 0 ? (count / total) * 100 : 0);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Task Priority Distribution</h3>
      <div className="space-y-4">
        {Object.entries(priorityCounts).map(([priority, count]) => (
          <div key={priority}>
            <div className="flex justify-between text-sm mb-1">
              <span className="capitalize">{priority}</span>
              <span>{count} tasks ({Math.round(getPercentage(count))}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  priority === 'high' ? 'bg-red-500' :
                  priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
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
  const tasksRaw = useTaskStats(state => {
    const tasks = state?.tasks;
    return Array.isArray(tasks) ? tasks : [];
  });
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Time</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Tasks</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Completed Tasks</h3>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">High Priority</h3>
          <p className="text-2xl font-bold">{stats.highPriority}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Overdue Tasks</h3>
          <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
        </div>
      </div>

      <WeeklyChart tasks={filteredTasks} />
      <PriorityChart tasks={filteredTasks} />
    </div>
  );
} 