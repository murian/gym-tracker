'use client';

import { useState, useEffect } from 'react';
import { Exercise, getDatabase } from '@/lib/db';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface ExerciseManagerProps {
  onClose: () => void;
}

export default function ExerciseManager({ onClose }: ExerciseManagerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    equipment: '',
    category: '',
    defaultReps: 12,
    defaultSets: 3,
    defaultRestTime: 30,
    imageUrl: '',
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = () => {
    const db = getDatabase();
    setExercises(db.getExercises());
  };

  const handleAdd = () => {
    if (!formData.name) return;

    const db = getDatabase();
    db.addExercise({
      name: formData.name,
      equipment: formData.equipment || undefined,
      category: formData.category || undefined,
      defaultReps: formData.defaultReps,
      defaultSets: formData.defaultSets,
      defaultRestTime: formData.defaultRestTime,
      imageUrl: formData.imageUrl || undefined,
    });

    resetForm();
    loadExercises();
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setFormData({
      name: exercise.name,
      equipment: exercise.equipment || '',
      category: exercise.category || '',
      defaultReps: exercise.defaultReps || 12,
      defaultSets: exercise.defaultSets || 3,
      defaultRestTime: exercise.defaultRestTime || 30,
      imageUrl: exercise.imageUrl || '',
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name) return;

    const db = getDatabase();
    db.updateExercise(editingId, {
      name: formData.name,
      equipment: formData.equipment || undefined,
      category: formData.category || undefined,
      defaultReps: formData.defaultReps,
      defaultSets: formData.defaultSets,
      defaultRestTime: formData.defaultRestTime,
      imageUrl: formData.imageUrl || undefined,
    });

    resetForm();
    loadExercises();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    const db = getDatabase();
    db.deleteExercise(id);
    loadExercises();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      equipment: '',
      category: '',
      defaultReps: 12,
      defaultSets: 3,
      defaultRestTime: 30,
      imageUrl: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Manage Exercises</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {(isAdding || editingId) && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Exercise' : 'Add New Exercise'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Chest press - flat bench"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Equipment
                  </label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., DUMBBELLS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Chest, Back, Legs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Reps
                  </label>
                  <input
                    type="number"
                    value={formData.defaultReps}
                    onChange={(e) => setFormData({ ...formData, defaultReps: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Sets
                  </label>
                  <input
                    type="number"
                    value={formData.defaultSets}
                    onChange={(e) => setFormData({ ...formData, defaultSets: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Rest Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.defaultRestTime}
                    onChange={(e) => setFormData({ ...formData, defaultRestTime: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/images/exercises/your-image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={editingId ? handleUpdate : handleAdd}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingId ? 'Update' : 'Add'} Exercise
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full mb-6 py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add New Exercise
            </button>
          )}

          <div className="space-y-3">
            {exercises.map(exercise => (
              <div
                key={exercise.id}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 flex items-center justify-between transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {exercise.equipment && (
                      <span className="text-sm font-normal text-gray-500">{exercise.equipment} - </span>
                    )}
                    {exercise.name}
                  </h4>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    {exercise.category && <span>Category: {exercise.category}</span>}
                    <span>{exercise.defaultSets} sets × {exercise.defaultReps} reps</span>
                    <span>{exercise.defaultRestTime}s rest</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    aria-label="Edit exercise"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    aria-label="Delete exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {exercises.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No exercises yet. Add your first exercise above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
