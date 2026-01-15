// Simple in-memory database with localStorage persistence
// This will work on Vercel and can be upgraded to a real DB later

export type WorkoutType = 'crossfit' | 'pilates' | 'squash' | 'free-workout';

export interface Exercise {
  id: string;
  name: string;
  equipment?: string;
  category?: string;
  defaultReps?: number;
  defaultSets?: number;
  defaultRestTime?: number;
  goalTime?: number;
  goalSpeed?: number;
  goalIncline?: number;
  imageUrl?: string;
  workoutDay?: 1 | 2; // Day 1 or Day 2 workout split
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
}

export interface FreeWorkoutExercise {
  exerciseId: string;
  sets: ExerciseSet[];
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO date string
  type: WorkoutType;
  completed: boolean;
  exercises?: FreeWorkoutExercise[];
  notes?: string;
}

class Database {
  private exercises: Exercise[] = [];
  private workoutLogs: WorkoutLog[] = [];
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const exercisesData = localStorage.getItem('gym-exercises');
      const logsData = localStorage.getItem('gym-workout-logs');

      if (exercisesData) {
        this.exercises = JSON.parse(exercisesData);
      } else {
        this.initializeDefaultExercises();
      }

      if (logsData) {
        this.workoutLogs = JSON.parse(logsData);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.initializeDefaultExercises();
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gym-exercises', JSON.stringify(this.exercises));
        localStorage.setItem('gym-workout-logs', JSON.stringify(this.workoutLogs));
      } catch (error) {
        console.error('Error saving to storage:', error);
      }
    }
  }

  private initializeDefaultExercises() {
    this.exercises = [
      {
        id: 'dumbbell-press',
        name: 'Dumbbell Press',
        equipment: 'DUMBBELLS',
        category: 'Chest',
        defaultReps: 10,
        defaultSets: 4,
        defaultRestTime: 60,
        imageUrl: '/images/exercises/dumbbell-press.jpg',
        workoutDay: 1,
      },
      {
        id: 'overhead-press',
        name: 'Overhead Press',
        equipment: 'BARBELL',
        category: 'Shoulders',
        defaultReps: 10,
        defaultSets: 3,
        defaultRestTime: 60,
        imageUrl: '/images/exercises/overhead-press.jpg',
        workoutDay: 1,
      },
      {
        id: 'inclined-dumbbell-press',
        name: 'Inclined Dumbbell Press',
        equipment: 'DUMBBELLS',
        category: 'Chest',
        defaultReps: 10,
        defaultSets: 3,
        defaultRestTime: 60,
        imageUrl: '/images/exercises/inclined-dumbbell-press.jpg',
        workoutDay: 1,
      },
      {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        equipment: 'DUMBBELLS',
        category: 'Shoulders',
        defaultReps: 15,
        defaultSets: 3,
        defaultRestTime: 45,
        imageUrl: '/images/exercises/lateral-raises.jpg',
        workoutDay: 1,
      },
      {
        id: 'triceps-dips',
        name: 'Triceps Dips',
        equipment: 'BODYWEIGHT',
        category: 'Triceps',
        defaultReps: 10,
        defaultSets: 3,
        defaultRestTime: 60,
        imageUrl: '/images/exercises/triceps-dips.jpg',
        workoutDay: 1,
      },
    ];
    this.saveToStorage();
  }

  // Exercise methods
  getExercises(): Exercise[] {
    return [...this.exercises];
  }

  getExercise(id: string): Exercise | undefined {
    return this.exercises.find(e => e.id === id);
  }

  getExercisesByDay(day: 1 | 2): Exercise[] {
    return this.exercises.filter(e => e.workoutDay === day);
  }

  addExercise(exercise: Omit<Exercise, 'id'>): Exercise {
    const newExercise: Exercise = {
      ...exercise,
      id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.exercises.push(newExercise);
    this.saveToStorage();
    return newExercise;
  }

  updateExercise(id: string, updates: Partial<Exercise>): Exercise | null {
    const index = this.exercises.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.exercises[index] = { ...this.exercises[index], ...updates };
    this.saveToStorage();
    return this.exercises[index];
  }

  deleteExercise(id: string): boolean {
    const index = this.exercises.findIndex(e => e.id === id);
    if (index === -1) return false;

    this.exercises.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Workout log methods
  getWorkoutLogs(): WorkoutLog[] {
    return [...this.workoutLogs].sort((a, b) => b.date.localeCompare(a.date));
  }

  getWorkoutLogsByDateRange(startDate: string, endDate: string): WorkoutLog[] {
    return this.workoutLogs.filter(
      log => log.date >= startDate && log.date <= endDate
    );
  }

  getWorkoutLogByDate(date: string): WorkoutLog | undefined {
    return this.workoutLogs.find(log => log.date === date);
  }

  addWorkoutLog(log: Omit<WorkoutLog, 'id'>): WorkoutLog {
    const newLog: WorkoutLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.workoutLogs.push(newLog);
    this.saveToStorage();
    return newLog;
  }

  updateWorkoutLog(id: string, updates: Partial<WorkoutLog>): WorkoutLog | null {
    const index = this.workoutLogs.findIndex(log => log.id === id);
    if (index === -1) return null;

    this.workoutLogs[index] = { ...this.workoutLogs[index], ...updates };
    this.saveToStorage();
    return this.workoutLogs[index];
  }

  deleteWorkoutLog(id: string): boolean {
    const index = this.workoutLogs.findIndex(log => log.id === id);
    if (index === -1) return false;

    this.workoutLogs.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Get suggested weight for an exercise based on 5% weekly progression
  getSuggestedWeight(exerciseId: string, currentDate: string): number | null {
    // Find the most recent workout with this exercise BEFORE the current date
    const previousLogs = this.workoutLogs
      .filter(log =>
        log.type === 'free-workout' &&
        log.date < currentDate &&
        log.exercises?.some(ex => ex.exerciseId === exerciseId)
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    if (previousLogs.length === 0) return null;

    const lastLog = previousLogs[0];
    const exerciseData = lastLog.exercises?.find(ex => ex.exerciseId === exerciseId);

    if (!exerciseData || exerciseData.sets.length === 0) return null;

    // Get the max weight used in that workout
    const maxWeight = Math.max(...exerciseData.sets.map(set => set.weight));

    // Calculate days since last workout
    const lastWorkoutDate = new Date(lastLog.date);
    const currentWorkoutDate = new Date(currentDate);
    const daysDifference = Math.floor((currentWorkoutDate.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

    // Only suggest increase if it's been at least 7 days since last workout
    if (daysDifference >= 7) {
      // Suggest 5% increase
      return Math.round(maxWeight * 1.05 * 2) / 2; // Round to nearest 0.5kg
    } else {
      // Less than a week - suggest same weight
      return maxWeight;
    }
  }

  // Get actual progression data for an exercise
  getProgressionData(exerciseId: string): { date: string; maxWeight: number; suggestedWeight: number | null }[] {
    const logsWithExercise = this.workoutLogs
      .filter(log =>
        log.type === 'free-workout' &&
        log.exercises?.some(ex => ex.exerciseId === exerciseId)
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    return logsWithExercise.map(log => {
      const exerciseData = log.exercises?.find(ex => ex.exerciseId === exerciseId);
      const maxWeight = exerciseData
        ? Math.max(...exerciseData.sets.map(set => set.weight))
        : 0;

      const suggestedWeight = this.getSuggestedWeight(exerciseId, log.date);

      return {
        date: log.date,
        maxWeight,
        suggestedWeight,
      };
    });
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

export default Database;
