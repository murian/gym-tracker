'use client';

import { useState, useEffect } from 'react';
import { WorkoutLog, Exercise, ExerciseSet, FreeWorkoutExercise, getDatabase } from '@/lib/db';
import { Plus, Trash2, Check, TrendingUp, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

interface FreeWorkoutTrackerProps {
  workoutLog: WorkoutLog;
  onUpdate: () => void;
}

interface TimerState {
  isRunning: boolean;
  timeElapsed: number; // in seconds
  isBreak: boolean;
  breakTimeLeft: number; // in seconds
  isCountdown: boolean;
  countdownValue: number; // 3, 2, 1
}

export default function FreeWorkoutTracker({ workoutLog, onUpdate }: FreeWorkoutTrackerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dayFilter, setDayFilter] = useState<'all' | 1 | 2>('all');
  const [workoutExercises, setWorkoutExercises] = useState<FreeWorkoutExercise[]>(
    workoutLog.exercises || []
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [timers, setTimers] = useState<{ [exerciseIndex: number]: TimerState }>({});

  useEffect(() => {
    const db = getDatabase();
    setExercises(db.getExercises());
  }, []);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const exerciseIndex = parseInt(key);
          const timer = updated[exerciseIndex];

          if (timer.isRunning) {
            if (timer.isCountdown) {
              // Countdown 3, 2, 1
              if (timer.countdownValue > 0) {
                updated[exerciseIndex] = {
                  ...timer,
                  countdownValue: timer.countdownValue - 1,
                };
              } else {
                // Countdown finished, start workout timer
                updated[exerciseIndex] = {
                  ...timer,
                  isCountdown: false,
                  countdownValue: 3,
                };
              }
            } else if (timer.isBreak) {
              // Countdown break time
              if (timer.breakTimeLeft > 0) {
                updated[exerciseIndex] = {
                  ...timer,
                  breakTimeLeft: timer.breakTimeLeft - 1,
                };
              } else {
                // Break finished
                updated[exerciseIndex] = {
                  ...timer,
                  isBreak: false,
                  isRunning: false,
                };
              }
            } else {
              // Count up workout time
              updated[exerciseIndex] = {
                ...timer,
                timeElapsed: timer.timeElapsed + 1,
              };
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startTimer = (exerciseIndex: number) => {
    setTimers(prev => ({
      ...prev,
      [exerciseIndex]: {
        isRunning: true,
        timeElapsed: prev[exerciseIndex]?.timeElapsed || 0,
        isBreak: false,
        breakTimeLeft: 60,
        isCountdown: true,
        countdownValue: 3,
      },
    }));
  };

  const pauseTimer = (exerciseIndex: number) => {
    setTimers(prev => ({
      ...prev,
      [exerciseIndex]: prev[exerciseIndex]
        ? { ...prev[exerciseIndex], isRunning: false }
        : { isRunning: false, timeElapsed: 0, isBreak: false, breakTimeLeft: 60, isCountdown: false, countdownValue: 3 },
    }));
  };

  const resetTimer = (exerciseIndex: number) => {
    setTimers(prev => ({
      ...prev,
      [exerciseIndex]: { isRunning: false, timeElapsed: 0, isBreak: false, breakTimeLeft: 60, isCountdown: false, countdownValue: 3 },
    }));
  };

  const finishSet = (exerciseIndex: number) => {
    setTimers(prev => ({
      ...prev,
      [exerciseIndex]: {
        isRunning: true,
        timeElapsed: prev[exerciseIndex]?.timeElapsed || 0,
        isBreak: true,
        breakTimeLeft: 60,
        isCountdown: false,
        countdownValue: 3,
      },
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = () => {
    if (!selectedExerciseId) return;

    const exercise = exercises.find(e => e.id === selectedExerciseId);
    if (!exercise) return;

    const defaultSets: ExerciseSet[] = Array.from({ length: exercise.defaultSets || 3 }, () => ({
      reps: exercise.defaultReps || 12,
      weight: 0,
      restTime: exercise.defaultRestTime || 30,
      completed: false,
    }));

    const newWorkoutExercise: FreeWorkoutExercise = {
      exerciseId: selectedExerciseId,
      sets: defaultSets,
    };

    const updated = [...workoutExercises, newWorkoutExercise];
    setWorkoutExercises(updated);
    saveWorkout(updated);
    setSelectedExerciseId('');
  };

  const removeExercise = (index: number) => {
    const updated = workoutExercises.filter((_, i) => i !== index);
    setWorkoutExercises(updated);
    saveWorkout(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<ExerciseSet>) => {
    const updated = [...workoutExercises];
    const oldSet = updated[exerciseIndex].sets[setIndex];
    updated[exerciseIndex].sets[setIndex] = {
      ...oldSet,
      ...updates,
    };
    setWorkoutExercises(updated);
    saveWorkout(updated);

    // If set was just marked as completed, start break timer
    if (updates.completed && !oldSet.completed) {
      const isLastSet = setIndex === updated[exerciseIndex].sets.length - 1;
      if (!isLastSet) {
        // Only start break if it's not the last set
        startBreak(exerciseIndex);
      }
    }
  };

  const setWeightForAllSets = (exerciseIndex: number, weight: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.map(set => ({
      ...set,
      weight: weight,
    }));
    setWorkoutExercises(updated);
    saveWorkout(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({
      reps: lastSet.reps,
      weight: lastSet.weight,
      restTime: lastSet.restTime,
      completed: false,
    });
    setWorkoutExercises(updated);
    saveWorkout(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setWorkoutExercises(updated);
    saveWorkout(updated);
  };

  const saveWorkout = (updated: FreeWorkoutExercise[]) => {
    const db = getDatabase();
    db.updateWorkoutLog(workoutLog.id, {
      exercises: updated,
    });
    onUpdate();
  };

  const getSuggestedWeight = (exerciseId: string): number | null => {
    const db = getDatabase();
    return db.getSuggestedWeight(exerciseId, workoutLog.date);
  };

  const getExerciseInfo = (exerciseId: string): Exercise | undefined => {
    return exercises.find(e => e.id === exerciseId);
  };

  const availableExercises = exercises.filter(e => {
    const notAlreadyAdded = !workoutExercises.some(we => we.exerciseId === e.id);
    const matchesDay = dayFilter === 'all' || e.workoutDay === dayFilter;
    return notAlreadyAdded && matchesDay;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Add Exercise</h3>

        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <button
            onClick={() => setDayFilter('all')}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-colors ${
              dayFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Workouts
          </button>
          <button
            onClick={() => setDayFilter(1)}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-colors ${
              dayFilter === 1
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Workout 1
          </button>
          <button
            onClick={() => setDayFilter(2)}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-colors ${
              dayFilter === 2
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            Workout 2
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-400 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-500 cursor-pointer"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
          >
            <option value="" className="text-gray-500">Select an exercise...</option>
            {availableExercises.map(exercise => (
              <option key={exercise.id} value={exercise.id} className="text-gray-900 font-medium py-2 bg-white hover:bg-blue-100">
                {exercise.equipment ? `${exercise.equipment} - ${exercise.name}` : exercise.name}
                {exercise.workoutDay ? ` (Workout ${exercise.workoutDay})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={addExercise}
            disabled={!selectedExerciseId}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add
          </button>
        </div>
      </div>

      {workoutExercises.map((workoutEx, exIndex) => {
        const exercise = getExerciseInfo(workoutEx.exerciseId);
        if (!exercise) return null;

        const suggestedWeight = getSuggestedWeight(exercise.id);
        const totalWeight = workoutEx.sets.reduce((sum, set) => sum + set.weight, 0);
        const currentAvgWeight = workoutEx.sets.length > 0 ? totalWeight / workoutEx.sets.length : 0;

        return (
          <div key={exIndex} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              {exercise.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-gray-900">
                  {exercise.equipment && (
                    <span className="text-xs sm:text-sm font-normal text-gray-500">{exercise.equipment} - </span>
                  )}
                  {exercise.name}
                </h4>
                {exercise.category && (
                  <p className="text-xs sm:text-sm text-gray-500">{exercise.category}</p>
                )}
              </div>
              <button
                onClick={() => removeExercise(exIndex)}
                className="p-1.5 sm:p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex-shrink-0"
                aria-label="Remove exercise"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Timer Section - Apple Watch Style */}
            <div className="mb-3 sm:mb-4 bg-black rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Timer Display */}
                <div className="flex flex-col items-center">
                  {timers[exIndex]?.isCountdown ? (
                    // Countdown: 3, 2, 1
                    <div className="text-center">
                      <div className="text-6xl sm:text-8xl font-bold text-green-400 animate-pulse">
                        {timers[exIndex]?.countdownValue || 'GO!'}
                      </div>
                      <div className="text-sm sm:text-base text-gray-400 mt-2 uppercase tracking-wide">
                        Get Ready
                      </div>
                    </div>
                  ) : timers[exIndex]?.isBreak ? (
                    // Break Timer
                    <div className="text-center">
                      <div className={`text-5xl sm:text-7xl font-bold ${
                        (timers[exIndex]?.breakTimeLeft || 60) <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'
                      }`}>
                        {formatTime(timers[exIndex]?.breakTimeLeft || 60)}
                      </div>
                      <div className="text-sm sm:text-base text-gray-400 mt-2 uppercase tracking-wide">
                        Rest
                      </div>
                    </div>
                  ) : (
                    // Workout Timer
                    <div className="text-center">
                      <div className="text-5xl sm:text-7xl font-bold text-green-400">
                        {formatTime(timers[exIndex]?.timeElapsed || 0)}
                      </div>
                      <div className="text-sm sm:text-base text-gray-400 mt-2 uppercase tracking-wide">
                        Workout
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3 w-full">
                  {!timers[exIndex]?.isRunning ? (
                    <>
                      <button
                        onClick={() => startTimer(exIndex)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full transition-all transform hover:scale-105 font-semibold text-sm sm:text-base uppercase tracking-wide shadow-lg"
                        aria-label="Start timer"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => resetTimer(exIndex)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
                        aria-label="Reset timer"
                      >
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : timers[exIndex]?.isCountdown ? (
                    // During countdown, show nothing or a cancel button
                    <button
                      onClick={() => resetTimer(exIndex)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-full transition-all transform hover:scale-105 font-semibold text-sm sm:text-base uppercase tracking-wide shadow-lg"
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                  ) : timers[exIndex]?.isBreak ? (
                    // During break, show pause and skip
                    <>
                      <button
                        onClick={() => pauseTimer(exIndex)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-full transition-all transform hover:scale-105 font-semibold text-sm sm:text-base uppercase tracking-wide shadow-lg"
                        aria-label="Pause timer"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => resetTimer(exIndex)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
                        aria-label="Skip break"
                      >
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : (
                    // During workout, show finish set and pause
                    <>
                      <button
                        onClick={() => finishSet(exIndex)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full transition-all transform hover:scale-105 font-semibold text-sm sm:text-base uppercase tracking-wide shadow-lg"
                        aria-label="Finish set"
                      >
                        Finish Set
                      </button>
                      <button
                        onClick={() => pauseTimer(exIndex)}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
                        aria-label="Pause timer"
                      >
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={() => resetTimer(exIndex)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
                        aria-label="Reset timer"
                      >
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Set weight for all sets */}
            <div className="mb-3 sm:mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Set weight for all sets
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g., 12"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseFloat((e.target as HTMLInputElement).value);
                      if (!isNaN(value)) {
                        setWeightForAllSets(exIndex, value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const value = parseFloat(input.value);
                    if (!isNaN(value)) {
                      setWeightForAllSets(exIndex, value);
                      input.value = '';
                    }
                  }}
                  className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sets weight to all sets. You can still adjust individual sets below.
              </p>
            </div>

            {suggestedWeight !== null && (
              <div className="mb-3 sm:mb-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Suggested Weight: {suggestedWeight} kg (avg across all sets)
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  {currentAvgWeight >= suggestedWeight ? (
                    <span className="flex items-center gap-1 text-green-700">
                      <Check className="w-3 h-3" />
                      On track! Your average weight ({currentAvgWeight.toFixed(1)} kg) meets the 5% progression goal.
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-blue-700">
                      <AlertCircle className="w-3 h-3" />
                      Try to reach this average weight for progressive overload. (Current avg: {currentAvgWeight.toFixed(1)} kg)
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {workoutEx.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 w-full overflow-x-auto">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 w-10 sm:w-12 flex-shrink-0">
                      Set {setIndex + 1}
                    </span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, { reps: parseInt(e.target.value) || 0 })}
                      className="w-14 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Reps"
                    />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">reps</span>
                    <span className="text-gray-400 text-xs sm:text-sm">×</span>
                    <input
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-14 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Weight"
                    />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">kg</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 sm:flex-initial">
                      <input
                        type="checkbox"
                        checked={set.completed}
                        onChange={(e) => updateSet(exIndex, setIndex, { completed: e.target.checked })}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <Check className={`w-4 h-4 sm:w-5 sm:h-5 ${set.completed ? 'text-green-600' : 'text-gray-300'}`} />
                    </label>
                    {workoutEx.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(exIndex, setIndex)}
                        className="p-1.5 sm:p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        aria-label="Remove set"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exIndex)}
              className="mt-3 w-full py-2 text-sm sm:text-base border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Add Set
            </button>
          </div>
        );
      })}

      {workoutExercises.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-500">No exercises added yet. Select an exercise above to get started.</p>
        </div>
      )}
    </div>
  );
}
