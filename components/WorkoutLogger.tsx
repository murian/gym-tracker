'use client';

import { useState, useEffect } from 'react';
import { WorkoutLog, WorkoutType, getDatabase } from '@/lib/db';
import { Check, X } from 'lucide-react';

interface WorkoutLoggerProps {
  selectedDate: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function WorkoutLogger({ selectedDate, onSave, onCancel }: WorkoutLoggerProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>('free-workout');
  const [completed, setCompleted] = useState(false);

  const handleSave = () => {
    const db = getDatabase();
    db.addWorkoutLog({
      date: selectedDate,
      type: workoutType,
      completed,
    });

    // Reset form
    setWorkoutType('free-workout');
    setCompleted(false);

    onSave();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Add Workout
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4 sm:mb-6">
        <p className="text-sm sm:text-base text-gray-600">{formatDate(selectedDate)}</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Workout Type
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => setWorkoutType('crossfit')}
              className={`
                p-3 sm:p-4 rounded-lg border-2 transition-all font-semibold text-sm sm:text-base
                ${workoutType === 'crossfit'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-orange-300 text-gray-700'}
              `}
            >
              Crossfit
            </button>
            <button
              onClick={() => setWorkoutType('pilates')}
              className={`
                p-3 sm:p-4 rounded-lg border-2 transition-all font-semibold text-sm sm:text-base
                ${workoutType === 'pilates'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300 text-gray-700'}
              `}
            >
              Pilates
            </button>
            <button
              onClick={() => setWorkoutType('squash')}
              className={`
                p-3 sm:p-4 rounded-lg border-2 transition-all font-semibold text-sm sm:text-base
                ${workoutType === 'squash'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 text-gray-700'}
              `}
            >
              Squash
            </button>
            <button
              onClick={() => setWorkoutType('free-workout')}
              className={`
                p-3 sm:p-4 rounded-lg border-2 transition-all font-semibold text-sm sm:text-base
                ${workoutType === 'free-workout'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 text-gray-700'}
              `}
            >
              Free Workout
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">
              Mark as completed
            </span>
          </label>
        </div>

        {workoutType === 'free-workout' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              After adding, click "View Details" to track exercises for this workout.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Add Workout
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
