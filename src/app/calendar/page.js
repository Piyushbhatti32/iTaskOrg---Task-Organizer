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
        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        ←
      </button>
      <h2 className="text-2xl font-semibold">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <button
        onClick={() => onNavigate('next')}
        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        →
      </button>
    </div>
  );
}

// Task category badge component
function TaskCategoryBadge({ category }) {
  const categoryColors = {
    work: 'bg-blue-100 text-blue-800',
    personal: 'bg-green-100 text-green-800',
    shopping: 'bg-yellow-100 text-yellow-800',
    health: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[category] || categoryColors.default}`}>
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
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-medium py-2 text-gray-600">
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
              p-2 h-32 border rounded-lg relative transition-all
              hover:border-blue-400 hover:shadow-md
              ${!isSameMonth(day, selectedDate) ? 'bg-gray-50' : 'bg-white'}
              ${isToday(day) ? 'border-blue-500 ring-2 ring-blue-200' : ''}
              ${isSameDay(day, selectedDate) ? 'bg-blue-50 border-blue-500' : ''}
            `}
          >
            <span className={`
              inline-block rounded-full w-7 h-7 text-center leading-7
              ${!isSameMonth(day, selectedDate) ? 'text-gray-400' : ''}
              ${isToday(day) ? 'bg-blue-500 text-white' : ''}
            `}>
              {format(day, 'd')}
            </span>
            
            {dayTasks.length > 0 && (
              <div className="absolute bottom-1 left-1 right-1 space-y-1">
                {hasOverdue && (
                  <div className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5">
                    {dayTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length} overdue
                  </div>
                )}
                {hasCompleted && (
                  <div className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                    {dayTasks.filter(t => t.completed).length} completed
                  </div>
                )}
                {dayTasks.filter(t => !t.completed && new Date(t.dueDate) >= new Date()).length > 0 && (
                  <div className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
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
    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Tasks for {format(date, 'MMMM d, yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'completed' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {dayTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} tasks scheduled for this day.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {dayTasks.map(task => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className={`${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </span>
                {task.category && (
                  <div className="mt-1">
                    <TaskCategoryBadge category={task.category} />
                  </div>
                )}
              </div>
              {new Date(task.dueDate) < new Date() && !task.completed && (
                <span className="text-xs text-red-600 font-medium">Overdue</span>
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
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6">Calendar</h1>
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