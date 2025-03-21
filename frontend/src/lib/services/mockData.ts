// src/lib/services/mockData.ts
import { Habit, HabitCategory, HabitFrequency } from '../types/habit';
import { User } from '../types/auth';

// Demo user
export const mockUser: User = {
  id: 1,
  email: 'demo@example.com',
  full_name: 'Demo User',
  created_at: new Date(2024, 0, 15).toISOString()
};

// Generate a set of realistic habits with various states and categories
export const generateMockHabits = (): Habit[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const habits: Habit[] = [
    {
      id: 1,
      title: 'Morning Meditation',
      description: 'Start each day with 10 minutes of mindful meditation to clear your mind and set positive intentions for the day.',
      frequency: 'daily',
      time_of_day: '06:30',
      created_at: new Date(2024, 0, 15).toISOString(),
      updated_at: new Date(2024, 1, 20).toISOString(),
      streak: 7,
      completed: true,
      category: 'Mindfulness',
      reminder_time: '06:25',
      is_archived: false,
      last_completed: now.toISOString()
    },
    {
      id: 2,
      title: 'Read 20 Pages',
      description: 'Read 20 pages of a non-fiction book to expand knowledge and vocabulary.',
      frequency: 'daily',
      time_of_day: '21:00',
      created_at: new Date(2024, 0, 16).toISOString(),
      updated_at: new Date(2024, 1, 22).toISOString(),
      streak: 4,
      completed: false,
      category: 'Learning',
      reminder_time: '20:55',
      is_archived: false,
      last_completed: yesterday.toISOString()
    },
    {
      id: 3,
      title: 'Workout Session',
      description: 'Complete a 30-minute strength training workout focusing on major muscle groups.',
      frequency: 'weekly',
      time_of_day: '17:30',
      created_at: new Date(2024, 0, 20).toISOString(),
      updated_at: new Date(2024, 2, 5).toISOString(),
      streak: 3,
      completed: true,
      category: 'Fitness',
      reminder_time: '17:15',
      is_archived: false,
      last_completed: new Date(now.setDate(now.getDate() - 2)).toISOString()
    },
    {
      id: 4,
      title: 'Gratitude Journaling',
      description: 'Write down three things you are grateful for to cultivate positivity and mindfulness.',
      frequency: 'daily',
      time_of_day: '22:00',
      created_at: new Date(2024, 0, 10).toISOString(),
      updated_at: new Date(2024, 1, 15).toISOString(),
      streak: 0,
      completed: false,
      category: 'Mindfulness',
      reminder_time: '21:55',
      is_archived: false,
      last_completed: new Date(now.setDate(now.getDate() - 3)).toISOString()
    },
    {
      id: 5,
      title: 'Weekly Planning',
      description: 'Plan your goals and tasks for the upcoming week to stay organized and focused.',
      frequency: 'weekly',
      time_of_day: '18:00',
      created_at: new Date(2024, 1, 5).toISOString(),
      updated_at: new Date(2024, 2, 1).toISOString(),
      streak: 5,
      completed: true,
      category: 'Productivity',
      reminder_time: '17:45',
      is_archived: false,
      last_completed: new Date(now.setDate(now.getDate() - 4)).toISOString()
    },
    {
      id: 6,
      title: 'Learn Spanish',
      description: 'Practice Spanish vocabulary for 15 minutes using a language learning app.',
      frequency: 'daily',
      time_of_day: '19:30',
      created_at: new Date(2024, 0, 25).toISOString(),
      updated_at: new Date(2024, 1, 28).toISOString(),
      streak: 12,
      completed: true,
      category: 'Learning',
      reminder_time: '19:25',
      is_archived: false,
      last_completed: now.toISOString()
    },
    {
      id: 7,
      title: 'Monthly Budget Review',
      description: 'Review your monthly expenses and update your budget for the coming month.',
      frequency: 'monthly',
      time_of_day: '10:00',
      created_at: new Date(2024, 0, 30).toISOString(),
      updated_at: new Date(2024, 2, 1).toISOString(),
      streak: 2,
      completed: true,
      category: 'Career',
      reminder_time: '09:55',
      is_archived: false,
      last_completed: new Date(2024, 2, 1).toISOString()
    },
    {
      id: 8,
      title: 'Daily Water Intake',
      description: 'Drink at least 2 liters of water throughout the day for proper hydration.',
      frequency: 'daily',
      time_of_day: null,
      created_at: new Date(2024, 0, 12).toISOString(),
      updated_at: new Date(2024, 1, 10).toISOString(),
      streak: 0,
      completed: false,
      category: 'Health',
      reminder_time: null,
      is_archived: true,
      last_completed: new Date(2024, 2, 10).toISOString()
    },
    {
      id: 9,
      title: 'Call a Friend',
      description: 'Reach out to a friend or family member to maintain social connections.',
      frequency: 'weekly',
      time_of_day: '19:00',
      created_at: new Date(2024, 1, 8).toISOString(),
      updated_at: new Date(2024, 2, 7).toISOString(),
      streak: 4,
      completed: false,
      category: 'Social',
      reminder_time: '18:45',
      is_archived: false,
      last_completed: new Date(2024, 2, 7).toISOString()
    },
    {
      id: 10,
      title: 'Digital Detox Hour',
      description: 'Spend one hour without digital devices to reduce screen time and improve mental clarity.',
      frequency: 'daily',
      time_of_day: '20:00',
      created_at: new Date(2024, 1, 15).toISOString(),
      updated_at: new Date(2024, 2, 14).toISOString(),
      streak: 1,
      completed: true,
      category: 'Mindfulness',
      reminder_time: '19:55',
      is_archived: false,
      last_completed: now.toISOString()
    }
  ];
  
  return habits;
};

// Type for completion dates storage
interface CompletionDates {
  [habitId: number]: string;
}

// Mock storage in localStorage
const STORAGE_KEYS = {
  HABITS: 'demo_habits',
  USER: 'demo_user',
  TOKEN: 'demo_token',
  HABITS_COMPLETED: 'demo_habits_completed' // To store completion dates separately
};

// Helper to initialize the mock data if it doesn't exist
export const initializeMockData = (): void => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(generateMockHabits()));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.TOKEN)) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'demo_mock_jwt_token');
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.HABITS_COMPLETED)) {
    // Initialize completion dates storage
    const completionDates: CompletionDates = {};
    const habits = generateMockHabits();
    habits.forEach(habit => {
      if (habit.completed) {
        completionDates[habit.id] = new Date().toISOString();
      }
    });
    localStorage.setItem(STORAGE_KEYS.HABITS_COMPLETED, JSON.stringify(completionDates));
  }
};

// Helper to reset the mock data
export const resetMockData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(generateMockHabits()));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
  localStorage.setItem(STORAGE_KEYS.TOKEN, 'demo_mock_jwt_token');
  
  // Reset completion dates
  const completionDates: CompletionDates = {};
  const habits = generateMockHabits();
  habits.forEach(habit => {
    if (habit.completed && habit.last_completed) {
      completionDates[habit.id] = habit.last_completed;
    }
  });
  localStorage.setItem(STORAGE_KEYS.HABITS_COMPLETED, JSON.stringify(completionDates));
};

// Get all mock habits
export const getMockHabits = (): Habit[] => {
  if (typeof window === 'undefined') return [];
  
  const habitsString = localStorage.getItem(STORAGE_KEYS.HABITS);
  return habitsString ? JSON.parse(habitsString) : [];
};

// Save all mock habits
export const saveMockHabits = (habits: Habit[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

// Get last completion date for a habit
export const getLastCompletedDate = (habitId: number): string | null => {
  if (typeof window === 'undefined') return null;
  
  const completionDatesString = localStorage.getItem(STORAGE_KEYS.HABITS_COMPLETED);
  if (!completionDatesString) return null;
  
  const completionDates: CompletionDates = JSON.parse(completionDatesString);
  return completionDates[habitId] || null;
};

// Set last completion date for a habit
export const setLastCompletedDate = (habitId: number, date: string | null): void => {
  if (typeof window === 'undefined') return;
  
  const completionDatesString = localStorage.getItem(STORAGE_KEYS.HABITS_COMPLETED);
  const completionDates: CompletionDates = completionDatesString ? JSON.parse(completionDatesString) : {};
  
  if (date === null) {
    delete completionDates[habitId];
  } else {
    completionDates[habitId] = date;
  }
  
  localStorage.setItem(STORAGE_KEYS.HABITS_COMPLETED, JSON.stringify(completionDates));
};