'use client';

import { useState, useEffect } from 'react';
import { getDatabase, WorkoutLog } from '@/lib/db';
import Calendar from '@/components/Calendar';
import WorkoutLogger from '@/components/WorkoutLogger';
import FreeWorkoutTracker from '@/components/FreeWorkoutTracker';
import ExerciseManager from '@/components/ExerciseManager';
import { Dumbbell, Settings, Trash2 } from 'lucide-react';

type ViewMode = 'calendar' | 'log' | 'detail';

export default function Home() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showExerciseManager, setShowExerciseManager] = useState(false);
  const [currentLog, setCurrentLog] = useState<WorkoutLog | undefined>(undefined);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    const db = getDatabase();
    setWorkoutLogs(db.getWorkoutLogs());
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    const db = getDatabase();
    const log = db.getWorkoutLogByDate(date);
    setCurrentLog(log);

    if (log && log.type === 'free-workout') {
      setViewMode('detail');
    } else {
      setViewMode('log');
    }
  };

  const handleSaveWorkout = () => {
    loadWorkouts();
    const db = getDatabase();
    if (selectedDate) {
      const log = db.getWorkoutLogByDate(selectedDate);
      setCurrentLog(log);
      if (log && log.type === 'free-workout') {
        setViewMode('detail');
      } else {
        setViewMode('calendar');
        setSelectedDate(null);
      }
    }
  };

  const handleCancelWorkout = () => {
    setViewMode('calendar');
    setSelectedDate(null);
    setCurrentLog(undefined);
  };

  const handleUpdateDetail = () => {
    loadWorkouts();
    const db = getDatabase();
    if (selectedDate) {
      const log = db.getWorkoutLogByDate(selectedDate);
      setCurrentLog(log);
    }
  };

  const handleDeleteWorkout = () => {
    if (!currentLog) return;

    if (confirm('Are you sure you want to delete this workout?')) {
      const db = getDatabase();
      db.deleteWorkoutLog(currentLog.id);
      loadWorkouts();
      setViewMode('calendar');
      setSelectedDate(null);
      setCurrentLog(undefined);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Gym Tracker</h1>
              <p className="text-gray-600">Track your fitness journey</p>
            </div>
          </div>
          <button
            onClick={() => setShowExerciseManager(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors border border-gray-200"
          >
            <Settings className="w-5 h-5" />
            Manage Exercises
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              workoutLogs={workoutLogs}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>

          <div>
            {viewMode === 'log' && selectedDate && (
              <WorkoutLogger
                selectedDate={selectedDate}
                existingLog={currentLog}
                onSave={handleSaveWorkout}
                onCancel={handleCancelWorkout}
              />
            )}

            {viewMode === 'detail' && currentLog && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Free Workout Details</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDeleteWorkout}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Workout
                      </button>
                      <button
                        onClick={handleCancelWorkout}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Back to Calendar
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <FreeWorkoutTracker
                  workoutLog={currentLog}
                  onUpdate={handleUpdateDetail}
                />
              </div>
            )}

            {viewMode === 'calendar' && (
              <div className="bg-white rounded-xl shadow-lg p-12">
                <div className="text-center text-gray-500">
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">Select a date to log a workout</p>
                  <p className="text-sm">Click on any day in the calendar to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showExerciseManager && (
          <ExerciseManager onClose={() => setShowExerciseManager(false)} />
        )}
      </div>
    </main>
  );
}
