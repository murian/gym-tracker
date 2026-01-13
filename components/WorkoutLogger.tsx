'use client';

import { useState, useEffect } from 'react';
import { WorkoutLog, WorkoutType, getDatabase } from '@/lib/db';
import { Check, X } from 'lucide-react';

interface WorkoutLoggerProps {
  selectedDate: string;
  existingLog?: WorkoutLog;
  onSave: () => void;
  onCancel: () => void;
}

export default function WorkoutLogger({ selectedDate, existingLog, onSave, onCancel }: WorkoutLoggerProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>(existingLog?.type || 'crossfit');
  const [completed, setCompleted] = useState(existingLog?.completed || false);

  const handleSave = () => {
    const db = getDatabase();

    if (existingLog) {
      db.updateWorkoutLog(existingLog.id, {
        type: workoutType,
        completed,
      });
    } else {
      db.addWorkoutLog({
        date: selectedDate,
        type: workoutType,
        completed,
      });
    }

    onSave();
  };

  const handleDelete = () => {
    if (existingLog && confirm('Are you sure you want to delete this workout?')) {
      const db = getDatabase();
      db.deleteWorkoutLog(existingLog.id);
      onSave();
    }
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {existingLog ? 'Edit Workout' : 'Log Workout'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">{formatDate(selectedDate)}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Workout Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWorkoutType('crossfit')}
              className={`
                p-4 rounded-lg border-2 transition-all font-semibold
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
                p-4 rounded-lg border-2 transition-all font-semibold
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
                p-4 rounded-lg border-2 transition-all font-semibold
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
                p-4 rounded-lg border-2 transition-all font-semibold
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
              For detailed exercise tracking, save this workout first, then click on the date again to add exercises.
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
          Save Workout
        </button>
        {existingLog && (
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
