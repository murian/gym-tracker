'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkoutLog } from '@/lib/db';

interface CalendarProps {
  workoutLogs: WorkoutLog[];
  onDateClick: (date: string) => void;
  selectedDate: string | null;
}

export default function Calendar({ workoutLogs, onDateClick, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getWorkoutForDate = (day: number): WorkoutLog | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workoutLogs.find(log => log.date === dateStr);
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'crossfit':
        return 'bg-orange-500';
      case 'pilates':
        return 'bg-purple-500';
      case 'squash':
        return 'bg-green-500';
      case 'free-workout':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getWorkoutTypeLabel = (type: string) => {
    switch (type) {
      case 'crossfit':
        return 'CF';
      case 'pilates':
        return 'PL';
      case 'squash':
        return 'SQ';
      case 'free-workout':
        return 'FW';
      default:
        return '';
    }
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const workout = getWorkoutForDate(day);
    const isSelected = selectedDate === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    days.push(
      <button
        key={day}
        onClick={() => onDateClick(dateStr)}
        className={`
          aspect-square p-2 rounded-lg border-2 transition-all
          ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:border-gray-300'}
          ${isToday ? 'ring-2 ring-green-500' : ''}
          ${workout ? 'font-semibold' : 'font-normal'}
          relative group
        `}
      >
        <div className="text-sm">{day}</div>
        {workout && (
          <div className={`
            absolute bottom-1 left-1/2 -translate-x-1/2
            ${getWorkoutTypeColor(workout.type)}
            text-white text-xs px-1.5 py-0.5 rounded-full
            font-bold
          `}>
            {getWorkoutTypeLabel(workout.type)}
          </div>
        )}
        {isToday && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-sm font-semibold text-gray-600 py-2">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>

      <div className="mt-6 flex gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">CF</div>
          <span className="text-gray-600">Crossfit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">PL</div>
          <span className="text-gray-600">Pilates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">SQ</div>
          <span className="text-gray-600">Squash</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">FW</div>
          <span className="text-gray-600">Free Workout</span>
        </div>
      </div>
    </div>
  );
}
