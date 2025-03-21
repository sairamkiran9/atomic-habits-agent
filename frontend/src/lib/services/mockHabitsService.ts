// src/lib/services/mockHabitsService.ts
import { 
  Habit, 
  HabitFrequency, 
  HabitCategory, 
  CreateHabitData 
} from '../types/habit';
import { 
  getMockHabits, 
  saveMockHabits, 
  initializeMockData, 
  getLastCompletedDate, 
  setLastCompletedDate 
} from './mockData';
import { format, subDays, isAfter, isSameDay, parseISO } from 'date-fns';

// Define additional types to match the real service
export interface UpdateHabitData extends Partial<Omit<Habit, 'id' | 'created_at' | 'updated_at'>> {
  last_completed?: string | null;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface ArchiveResponse {
  id: number;
  title: string;
  is_archived: boolean;
  message: string;
}

export interface ResetResponse {
  reset_count: number;
  message: string;
}

export class MockHabitsService {
  static async checkAndResetHabits(): Promise<void> {
    // Make sure mock data exists
    initializeMockData();
    
    const habits = getMockHabits();
    const now = new Date();
    let resetCount = 0;
    
    const updatedHabits = habits.map(habit => {
      let shouldReset = false;
      const lastCompletedDate = getLastCompletedDate(habit.id);
      const lastCompletedObj = lastCompletedDate ? new Date(lastCompletedDate) : null;
      
      // Skip archived habits
      if (habit.is_archived) {
        return habit;
      }
      
      // Check if habit needs to be reset based on frequency
      if (habit.frequency === 'daily') {
        // Reset if last completion was not today
        shouldReset = lastCompletedObj 
          ? !isSameDay(lastCompletedObj, now) 
          : true;
      } else if (habit.frequency === 'weekly') {
        // Reset if last completion was more than 7 days ago
        shouldReset = lastCompletedObj 
          ? isAfter(now, subDays(lastCompletedObj, 7)) 
          : true;
      } else if (habit.frequency === 'monthly') {
        // Simple implementation - reset if last completion was in a different month
        shouldReset = lastCompletedObj 
          ? lastCompletedObj.getMonth() !== now.getMonth() 
          : true;
      }
      
      // Reset the habit if needed
      if (shouldReset && habit.completed) {
        resetCount++;
        return {
          ...habit,
          completed: false
        };
      }
      
      return habit;
    });
    
    if (resetCount > 0) {
      saveMockHabits(updatedHabits);
    }
  }
  
  static async getHabits(): Promise<Habit[]> {
    // Make sure mock data exists
    initializeMockData();
    
    // Reset habits if needed
    await this.checkAndResetHabits();
    
    return getMockHabits();
  }
  
  static async getHabit(habitId: number): Promise<Habit> {
    const habits = getMockHabits();
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) {
      throw new Error(`Habit with ID ${habitId} not found`);
    }
    
    return habit;
  }
  
  static async createHabit(data: CreateHabitData): Promise<Habit> {
    const habits = getMockHabits();
    const now = new Date().toISOString();
    
    // Generate a new ID (max ID + 1)
    const newId = Math.max(0, ...habits.map(h => h.id)) + 1;
    
    const newHabit: Habit = {
      id: newId,
      title: data.title,
      description: data.description,
      frequency: data.frequency,
      time_of_day: data.time_of_day || '',
      created_at: now,
      updated_at: now,
      streak: 0,
      completed: false,
      category: data.category,
      reminder_time: data.reminder_time || '',
      is_archived: false
    };
    
    const updatedHabits = [...habits, newHabit];
    saveMockHabits(updatedHabits);
    
    return newHabit;
  }
  
  static async updateHabit(habitId: number, data: UpdateHabitData): Promise<Habit> {
    const habits = getMockHabits();
    const habitIndex = habits.findIndex(h => h.id === habitId);
    
    if (habitIndex === -1) {
      throw new Error(`Habit with ID ${habitId} not found`);
    }
    
    const oldHabit = habits[habitIndex];
    const now = new Date();
    
    // Handle streak logic
    let streak = oldHabit.streak;
    
    if ('completed' in data) {
      if (data.completed && !oldHabit.completed) {
        // Mark as completed
        streak += 1;
        setLastCompletedDate(habitId, now.toISOString());
      } else if (!data.completed && oldHabit.completed) {
        // Mark as uncompleted
        streak = Math.max(0, streak - 1);
      }
    }
    
    // Create updated habit
    const updatedHabit: Habit = {
      ...oldHabit,
      ...data,
      streak,
      updated_at: now.toISOString()
    };
    
    // Update habits array
    const updatedHabits = [...habits];
    updatedHabits[habitIndex] = updatedHabit;
    saveMockHabits(updatedHabits);
    
    return updatedHabit;
  }
  
  static async toggleArchiveHabit(habitId: number): Promise<Habit> {
    const habits = getMockHabits();
    const habitIndex = habits.findIndex(h => h.id === habitId);
    
    if (habitIndex === -1) {
      throw new Error(`Habit with ID ${habitId} not found`);
    }
    
    const habit = habits[habitIndex];
    const updatedHabit: Habit = {
      ...habit,
      is_archived: !habit.is_archived,
      updated_at: new Date().toISOString()
    };
    
    // Update habits array
    const updatedHabits = [...habits];
    updatedHabits[habitIndex] = updatedHabit;
    saveMockHabits(updatedHabits);
    
    return updatedHabit;
  }
  
  static async deleteHabit(habitId: number): Promise<void> {
    const habits = getMockHabits();
    const updatedHabits = habits.filter(h => h.id !== habitId);
    
    if (updatedHabits.length === habits.length) {
      throw new Error(`Habit with ID ${habitId} not found`);
    }
    
    saveMockHabits(updatedHabits);
    
    // Also remove completion date
    setLastCompletedDate(habitId, null);
  }
}