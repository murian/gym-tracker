'use client';

import { useState, useEffect } from 'react';
import { WorkoutLog, Exercise, ExerciseSet, FreeWorkoutExercise, getDatabase } from '@/lib/db';
import { Plus, Trash2, Check, TrendingUp, AlertCircle } from 'lucide-react';

interface FreeWorkoutTrackerProps {
  workoutLog: WorkoutLog;
  onUpdate: () => void;
}

export default function FreeWorkoutTracker({ workoutLog, onUpdate }: FreeWorkoutTrackerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<FreeWorkoutExercise[]>(
    workoutLog.exercises || []
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  useEffect(() => {
    const db = getDatabase();
    setExercises(db.getExercises());
  }, []);

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
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      ...updates,
    };
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

  const availableExercises = exercises.filter(
    e => !workoutExercises.some(we => we.exerciseId === e.id)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Exercise</h3>
        <div className="flex gap-3">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an exercise...</option>
            {availableExercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.equipment ? `${exercise.equipment} - ${exercise.name}` : exercise.name}
              </option>
            ))}
          </select>
          <button
            onClick={addExercise}
            disabled={!selectedExerciseId}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      {workoutExercises.map((workoutEx, exIndex) => {
        const exercise = getExerciseInfo(workoutEx.exerciseId);
        if (!exercise) return null;

        const suggestedWeight = getSuggestedWeight(exercise.id);
        const currentMaxWeight = Math.max(...workoutEx.sets.map(s => s.weight), 0);

        return (
          <div key={exIndex} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              {exercise.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900">
                  {exercise.equipment && (
                    <span className="text-sm font-normal text-gray-500">{exercise.equipment} - </span>
                  )}
                  {exercise.name}
                </h4>
                {exercise.category && (
                  <p className="text-sm text-gray-500">{exercise.category}</p>
                )}
              </div>
              <button
                onClick={() => removeExercise(exIndex)}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                aria-label="Remove exercise"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {suggestedWeight !== null && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900">
                    Suggested Weight: {suggestedWeight} kg
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  {currentMaxWeight >= suggestedWeight ? (
                    <span className="flex items-center gap-1 text-green-700">
                      <Check className="w-3 h-3" />
                      On track! You're meeting or exceeding the 5% progression goal.
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-blue-700">
                      <AlertCircle className="w-3 h-3" />
                      Try to reach this weight for progressive overload.
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {workoutEx.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-semibold text-gray-600 w-12">
                      Set {setIndex + 1}
                    </span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, { reps: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Reps"
                    />
                    <span className="text-sm text-gray-600">reps</span>
                    <span className="text-gray-400">×</span>
                    <input
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Weight"
                    />
                    <span className="text-sm text-gray-600">kg</span>
                    <span className="text-gray-400">×</span>
                    <input
                      type="number"
                      value={set.restTime}
                      onChange={(e) => updateSet(exIndex, setIndex, { restTime: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rest"
                    />
                    <span className="text-sm text-gray-600">sec</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={set.completed}
                      onChange={(e) => updateSet(exIndex, setIndex, { completed: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Check className={`w-5 h-5 ${set.completed ? 'text-green-600' : 'text-gray-300'}`} />
                  </label>
                  {workoutEx.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(exIndex, setIndex)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      aria-label="Remove set"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exIndex)}
              className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Set
            </button>
          </div>
        );
      })}

      {workoutExercises.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-gray-500">No exercises added yet. Select an exercise above to get started.</p>
        </div>
      )}
    </div>
  );
}
