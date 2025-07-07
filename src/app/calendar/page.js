'use client';

import { useState } from 'react';
import { useCalendarTasks } from '../../store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

// Calendar grid component showing month view
function CalendarGrid({ selectedDate, onSelectDate, tasks }) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
        <div key={day} className="text-center font-medium py-2">
          {day}
        </div>
      ))}
      {days.map(day => {
        const dayTasks = getTasksForDay(day);
        return (
          <button
            key={day.toString()}
            onClick={() => onSelectDate(day)}
            className={`
              p-2 h-24 border rounded relative
              ${!isSameMonth(day, selectedDate) ? 'bg-gray-50' : 'bg-white'}
              ${isToday(day) ? 'border-blue-500' : ''}
              ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}
            `}
          >
            <span className={`
              text-sm
              ${!isSameMonth(day, selectedDate) ? 'text-gray-400' : ''}
              ${isToday(day) ? 'font-bold text-blue-500' : ''}
            `}>
              {format(day, 'd')}
            </span>
            {dayTasks.length > 0 && (
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5">
                  {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Task list component showing tasks for selected date
function DayTasks({ date, tasks }) {
  if (!Array.isArray(tasks)) {
    tasks = [];
  }

  const dayTasks = tasks.filter(task => {
    if (!task || !task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return isSameDay(taskDate, date);
  });

  const toggleTaskCompletion = useCalendarTasks(state => state.toggleTaskCompletion);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Tasks for {format(date, 'MMMM d, yyyy')}
      </h2>
      {dayTasks.length === 0 ? (
        <p className="text-gray-500">No tasks scheduled for this day.</p>
      ) : (
        <ul className="space-y-2">
          {dayTasks.map(task => (
            <li
              key={task.id}
              className="flex items-center gap-2 p-2 bg-white rounded shadow"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
              />
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Main Calendar page component
export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const tasks = useCalendarTasks(state => {
    const tasks = state?.tasks;
    return Array.isArray(tasks) ? tasks : [];
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <div className="text-xl font-semibold mb-4">
        {format(selectedDate, 'MMMM yyyy')}
      </div>
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        tasks={tasks}
      />
      <DayTasks date={selectedDate} tasks={tasks} />
    </div>
  );
} 