import { AuthService } from './auth';

const API_URL = 'http://localhost:8000/api';

export interface Habit {
  id: number;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day?: string;
  created_at: string;
  updated_at: string;
  streak: number;
  completed: boolean;
  category: string;
  reminder_time?: string;
  is_archived: boolean;
}

export interface CreateHabitData {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day?: string;
  category: string;
  reminder_time?: string;
}

export class HabitsService {
  private static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getHabits(): Promise<Habit[]> {
    try {
      const response = await fetch(`${API_URL}/habits`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getHabit(habitId: number): Promise<Habit> {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch habit');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  static async createHabit(data: CreateHabitData): Promise<Habit> {
    try {
      const response = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create habit');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  static async updateHabit(habitId: number, data: Partial<CreateHabitData>): Promise<Habit> {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update habit');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteHabit(habitId: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
    } catch (error) {
      throw error;
    }
  }
}