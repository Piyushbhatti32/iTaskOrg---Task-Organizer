'use client';

import { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';

// Navigation controls component
function CalendarNavigation({ currentDate, onNavigate }) {
  const { isDark } = useTheme();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => onNavigate('prev')}
        className={`p-2 rounded-full transition-all duration-200 active:scale-95 ${
          isDark 
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 className={`text-2xl font-semibold ${
        isDark 
          ? 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent' 
          : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
      }`}>
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <button
        onClick={() => onNavigate('next')}
        className={`p-2 rounded-full transition-all duration-200 active:scale-95 ${
          isDark 
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// Task category badge component
function TaskCategoryBadge({ category }) {
  const { isDark } = useTheme();
  
  const categoryColors = {
    work: isDark 
      ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300' 
      : 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700',
    personal: isDark 
      ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300' 
      : 'bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-700',
    shopping: isDark 
      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300' 
      : 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-700',
    health: isDark 
      ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300' 
      : 'bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-700',
    default: isDark 
      ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300' 
      : 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 text-gray-700'
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[category] || categoryColors.default}`}>
      {category || 'uncategorized'}
    </span>
  );
}

// Enhanced calendar grid component
function CalendarGrid({ selectedDate, onSelectDate, tasks }) {
  const { isDark } = useTheme();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (date) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  return (
    <div className={`grid grid-cols-7 gap-1.5 p-1 rounded-xl ${
      isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
    }`}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className={`text-center font-medium py-2 text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {day}
        </div>
      ))}
      {days.map(day => {
        const dayTasks = getTasksForDay(day);
        const hasOverdue = dayTasks.some(task => !task.completed && new Date(task.dueDate) < new Date());
        const hasCompleted = dayTasks.some(task => task.completed);

        return (
          <button
            key={day.toString()}
            onClick={() => onSelectDate(day)}
            className={`
              p-1 h-24 relative transition-all duration-200
              hover:scale-[1.02] hover:shadow-lg hover:z-10
              backdrop-blur-sm rounded-xl
              ${!isSameMonth(day, selectedDate) 
                ? isDark 
                  ? 'bg-gray-800/30 hover:bg-gray-800/50' 
                  : 'bg-white/50 hover:bg-white'
                : isDark 
                  ? 'bg-gray-900/50 hover:bg-gray-900/70 shadow-sm' 
                  : 'bg-white hover:bg-white shadow-sm'}
              ${isToday(day) 
                ? isDark 
                  ? 'ring-2 ring-blue-400/40 bg-gradient-to-b from-blue-900/30 to-gray-900/50' 
                  : 'ring-2 ring-blue-500/20 bg-gradient-to-b from-blue-50 to-white'
                : ''}
              ${isSameDay(day, selectedDate) 
                ? isDark 
                  ? 'bg-gradient-to-b from-blue-900/40 to-blue-800/30 shadow-md ring-1 ring-blue-400/30' 
                  : 'bg-gradient-to-b from-blue-100/80 to-blue-50/80 shadow-md ring-1 ring-blue-200'
                : ''}
            `}
          >
            <span className={`
              inline-flex items-center justify-center
              rounded-full w-6 h-6 text-sm font-medium
              transition-colors duration-200
              ${!isSameMonth(day, selectedDate) 
                ? 'text-gray-400' 
                : isDark 
                  ? 'text-gray-200' 
                  : 'text-gray-700'}
              ${isToday(day) ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' : ''}
            `}>
              {format(day, 'd')}
            </span>
            
            {dayTasks.length > 0 && (
              <div className="absolute bottom-1 left-1 right-1 space-y-0.5">
                {hasOverdue && (
                  <div className={`text-[10px] rounded-full px-1.5 py-px font-medium backdrop-blur-sm ${
                    isDark 
                      ? 'bg-gradient-to-r from-red-900/70 to-red-800/70 text-red-200' 
                      : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700'
                  }`}>
                    {dayTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length} overdue
                  </div>
                )}
                {hasCompleted && (
                  <div className={`text-[10px] rounded-full px-1.5 py-px font-medium backdrop-blur-sm ${
                    isDark 
                      ? 'bg-gradient-to-r from-green-900/70 to-green-800/70 text-green-200' 
                      : 'bg-gradient-to-r from-green-100 to-green-50 text-green-700'
                  }`}>
                    {dayTasks.filter(t => t.completed).length} completed
                  </div>
                )}
                {dayTasks.filter(t => !t.completed && new Date(t.dueDate) >= new Date()).length > 0 && (
                  <div className={`text-[10px] rounded-full px-1.5 py-px font-medium backdrop-blur-sm ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-900/70 to-blue-800/70 text-blue-200' 
                      : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700'
                  }`}>
                    {dayTasks.filter(t => !t.completed && new Date(t.dueDate) >= new Date()).length} pending
                  </div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Enhanced task list component
function DayTasks({ date, tasks }) {
  const { isDark } = useTheme();
  const toggleTaskCompletion = useStore(state => state.toggleTaskCompletion);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  const dayTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    let filteredTasks = tasks.filter(task => {
      if (!task || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });

    if (filter === 'pending') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }

    return filteredTasks;
  }, [tasks, date, filter]);

  return (
    <div className={`mt-6 rounded-xl shadow-sm p-6 backdrop-blur-sm ${
      isDark 
        ? 'bg-gray-900/50 border border-gray-700/50' 
        : 'bg-white/80 border border-gray-200/50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${
          isDark 
            ? 'bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent' 
            : 'bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent'
        }`}>
          Tasks for {format(date, 'MMMM d, yyyy')}
        </h2>
        <div className={`flex gap-1.5 p-1 rounded-lg ${
          isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
        }`}>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === 'all' 
                ? isDark
                  ? 'bg-gray-700/70 text-blue-400 shadow-sm' 
                  : 'bg-white text-blue-700 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === 'pending' 
                ? isDark
                  ? 'bg-gray-700/70 text-yellow-400 shadow-sm' 
                  : 'bg-white text-yellow-700 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === 'completed' 
                ? isDark
                  ? 'bg-gray-700/70 text-green-400 shadow-sm' 
                  : 'bg-white text-green-700 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {dayTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No {filter !== 'all' ? filter : ''} tasks scheduled for this day.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {dayTasks.map(task => (
            <li
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'hover:bg-gray-800/50 border border-gray-700/30' 
                  : 'hover:bg-gray-50/80 border border-gray-200/30'
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className={`w-5 h-5 rounded-md transition-colors duration-200 ${
                  isDark 
                    ? 'border-gray-600 text-blue-500 focus:ring-blue-400 bg-gray-800' 
                    : 'border-gray-300 text-blue-600 focus:ring-blue-500 bg-white'
                }`}
              />
              <div className="flex-1">
                <span className={`transition-colors duration-200 ${
                  task.completed 
                    ? isDark ? 'line-through text-gray-500' : 'line-through text-gray-400'
                    : isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {task.title}
                </span>
                {task.category && (
                  <div className="mt-1.5">
                    <TaskCategoryBadge category={task.category} />
                  </div>
                )}
              </div>
              {new Date(task.dueDate) < new Date() && !task.completed && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isDark 
                    ? 'bg-red-900/50 text-red-300' 
                    : 'bg-red-100/50 text-red-700'
                }`}>Overdue</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Enhanced main Calendar page component
export default function CalendarPage() {
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const tasks = useStore(state => state.tasks);
  
  const safeTasks = useMemo(() => {
    return Array.isArray(tasks) ? tasks : [];
  }, [tasks]);

  const handleNavigate = (direction) => {
    setSelectedDate(current => 
      direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1)
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className={`backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6 ${
        isDark 
          ? 'bg-gray-900/50 border border-gray-700/50' 
          : 'bg-white/80 border border-gray-200/50'
      }`}>
        <h1 className={`text-3xl font-bold mb-6 ${
          isDark 
            ? 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent' 
            : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
        }`}>Calendar</h1>
        <CalendarNavigation
          currentDate={selectedDate}
          onNavigate={handleNavigate}
        />
        <CalendarGrid
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasks={safeTasks}
        />
      </div>
      <DayTasks date={selectedDate} tasks={safeTasks} />
    </div>
  );
}
