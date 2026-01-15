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
  const [currentLogs, setCurrentLogs] = useState<WorkoutLog[]>([]);
  const [selectedWorkoutLog, setSelectedWorkoutLog] = useState<WorkoutLog | undefined>(undefined);

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
    const logs = db.getWorkoutLogsByDate(date);
    setCurrentLogs(logs);
    setSelectedWorkoutLog(undefined);
    setViewMode('log');
  };

  const handleSaveWorkout = () => {
    loadWorkouts();
    const db = getDatabase();
    if (selectedDate) {
      const logs = db.getWorkoutLogsByDate(selectedDate);
      setCurrentLogs(logs);
      // Stay in log view to allow adding more workouts
      setViewMode('log');
    }
  };

  const handleCancelWorkout = () => {
    setViewMode('calendar');
    setSelectedDate(null);
    setCurrentLogs([]);
    setSelectedWorkoutLog(undefined);
  };

  const handleUpdateDetail = () => {
    loadWorkouts();
    const db = getDatabase();
    if (selectedDate) {
      const logs = db.getWorkoutLogsByDate(selectedDate);
      setCurrentLogs(logs);
      // Update the selected workout log if it still exists
      if (selectedWorkoutLog) {
        const updatedLog = logs.find(log => log.id === selectedWorkoutLog.id);
        setSelectedWorkoutLog(updatedLog);
      }
    }
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      const db = getDatabase();
      db.deleteWorkoutLog(workoutId);
      loadWorkouts();
      if (selectedDate) {
        const logs = db.getWorkoutLogsByDate(selectedDate);
        setCurrentLogs(logs);
        if (logs.length === 0) {
          setViewMode('calendar');
          setSelectedDate(null);
        } else {
          setViewMode('log');
        }
      }
      if (selectedWorkoutLog && selectedWorkoutLog.id === workoutId) {
        setSelectedWorkoutLog(undefined);
        setViewMode('log');
      }
    }
  };

  const handleEditWorkout = (workout: WorkoutLog) => {
    setSelectedWorkoutLog(workout);
    if (workout.type === 'free-workout') {
      setViewMode('detail');
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
              <div className="space-y-6">
                {/* Existing workouts for this date */}
                {currentLogs.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Workouts on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <div className="space-y-3">
                      {currentLogs.map(log => (
                        <div key={log.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                log.type === 'crossfit' ? 'bg-orange-500 text-white' :
                                log.type === 'pilates' ? 'bg-purple-500 text-white' :
                                log.type === 'squash' ? 'bg-green-500 text-white' :
                                'bg-blue-500 text-white'
                              }`}>
                                {log.type === 'crossfit' ? 'Crossfit' :
                                 log.type === 'pilates' ? 'Pilates' :
                                 log.type === 'squash' ? 'Squash' :
                                 'Free Workout'}
                              </span>
                              {log.completed && (
                                <span className="text-green-600 text-sm font-semibold">✓ Completed</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {log.type === 'free-workout' && (
                              <button
                                onClick={() => handleEditWorkout(log)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                              >
                                View Details
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteWorkout(log.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              aria-label="Delete workout"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add new workout */}
                <WorkoutLogger
                  selectedDate={selectedDate}
                  onSave={handleSaveWorkout}
                  onCancel={handleCancelWorkout}
                />
              </div>
            )}

            {viewMode === 'detail' && selectedWorkoutLog && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Free Workout Details</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteWorkout(selectedWorkoutLog.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Workout
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWorkoutLog(undefined);
                          setViewMode('log');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Back to Workouts
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <FreeWorkoutTracker
                  workoutLog={selectedWorkoutLog}
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
