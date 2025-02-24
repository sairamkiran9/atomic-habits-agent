import { AuthService } from './auth';

const API_URL = 'http://localhost:8000/api';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export type HabitCategory = 
  | 'Mindfulness'
  | 'Learning'
  | 'Productivity'
  | 'Health'
  | 'Fitness'
  | 'Career'
  | 'Social'
  | 'Other';

export interface Habit {
  id: number;
  title: string;
  description: string;
  frequency: HabitFrequency;
  time_of_day: string | null;
  created_at: string;
  updated_at: string;
  streak: number;
  completed: boolean;
  category: HabitCategory;
  reminder_time: string | null;
  is_archived: boolean;
}

export interface CreateHabitData {
  title: string;
  description: string;
  frequency: HabitFrequency;
  time_of_day?: string | null;
  category: HabitCategory;
  reminder_time?: string | null;
}

export interface UpdateHabitData extends Partial<Omit<Habit, 'id' | 'created_at' | 'updated_at'>> {}

export interface ApiError {
  message: string;
  status: number;
}

export class HabitsService {
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  static async getHabits(): Promise<Habit[]> {
    try {
      const response = await fetch(`${API_URL}/habits`, {
        headers: this.getHeaders()
      });
      return this.handleResponse<Habit[]>(response);
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error('An unknown error occurred while fetching habits');
    }
  }

  static async getHabit(habitId: number): Promise<Habit> {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        headers: this.getHeaders()
      });
      return this.handleResponse<Habit>(response);
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`An unknown error occurred while fetching habit ${habitId}`);
    }
  }

  static async createHabit(data: CreateHabitData): Promise<Habit> {
    try {
      const response = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse<Habit>(response);
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error('An unknown error occurred while creating habit');
    }
  }

  static async updateHabit(habitId: number, data: UpdateHabitData): Promise<Habit> {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse<Habit>(response);
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`An unknown error occurred while updating habit ${habitId}`);
    }
  }

  static async deleteHabit(habitId: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        throw new Error(`Failed to delete habit ${habitId}`);
      }
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`An unknown error occurred while deleting habit ${habitId}`);
    }
  }
}