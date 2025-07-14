'use client';

import { useState, useMemo } from 'react';
import { useStore } from '../../store';
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
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => onNavigate('prev')}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <button
        onClick={() => onNavigate('next')}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95"
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
  const categoryColors = {
    work: 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700',
    personal: 'bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-700',
    shopping: 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-700',
    health: 'bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-700',
    default: 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 text-gray-700'
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[category] || categoryColors.default}`}>
      {category || 'uncategorized'}
    </span>
  );
}

// Enhanced calendar grid component
function CalendarGrid({ selectedDate, onSelectDate, tasks }) {
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
    <div className="grid grid-cols-7 gap-1.5 p-1 rounded-xl bg-gray-100/50">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-medium py-2 text-gray-500 text-sm">
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
              backdrop-blur-sm
              ${!isSameMonth(day, selectedDate) 
                ? 'bg-white/50 hover:bg-white' 
                : 'bg-white hover:bg-white shadow-sm'}
              ${isToday(day) 
                ? 'ring-2 ring-blue-500/20 bg-gradient-to-b from-blue-50 to-white' 
                : 'rounded-xl'}
              ${isSameDay(day, selectedDate) 
                ? 'bg-gradient-to-b from-blue-100/80 to-blue-50/80 shadow-md ring-1 ring-blue-200' 
                : ''}
            `}
          >
            <span className={`
              inline-flex items-center justify-center
              rounded-full w-6 h-6 text-sm font-medium
              transition-colors duration-200
              ${!isSameMonth(day, selectedDate) ? 'text-gray-400' : 'text-gray-700'}
              ${isToday(day) ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' : ''}
            `}>
              {format(day, 'd')}
            </span>
            
            {dayTasks.length > 0 && (
              <div className="absolute bottom-1 left-1 right-1 space-y-0.5">
                {hasOverdue && (
                  <div className="text-[10px] bg-gradient-to-r from-red-100 to-red-50 text-red-700 rounded-full px-1.5 py-px font-medium backdrop-blur-sm">
                    {dayTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length} overdue
                  </div>
                )}
                {hasCompleted && (
                  <div className="text-[10px] bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-full px-1.5 py-px font-medium backdrop-blur-sm">
                    {dayTasks.filter(t => t.completed).length} completed
                  </div>
                )}
                {dayTasks.filter(t => !t.completed && new Date(t.dueDate) >= new Date()).length > 0 && (
                  <div className="text-[10px] bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full px-1.5 py-px font-medium backdrop-blur-sm">
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
    <div className="mt-6 bg-white rounded-xl shadow-sm p-6 backdrop-blur-sm bg-white/80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          Tasks for {format(date, 'MMMM d, yyyy')}
        </h2>
        <div className="flex gap-1.5 bg-gray-100/50 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === 'all' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === 'pending' 
                ? 'bg-white text-yellow-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === 'completed' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {dayTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} tasks scheduled for this day.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {dayTasks.map(task => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50/80 rounded-lg transition-all duration-200"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
              />
              <div className="flex-1">
                <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-700'} transition-colors duration-200`}>
                  {task.title}
                </span>
                {task.category && (
                  <div className="mt-1.5">
                    <TaskCategoryBadge category={task.category} />
                  </div>
                )}
              </div>
              {new Date(task.dueDate) < new Date() && !task.completed && (
                <span className="text-xs font-medium bg-red-100/50 text-red-700 px-2 py-1 rounded-full">Overdue</span>
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
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Calendar</h1>
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