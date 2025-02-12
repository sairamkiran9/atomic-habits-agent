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
  id: string;
  title: string;
  description: string;
  frequency: HabitFrequency;
  timeOfDay?: string;
  createdAt: string;
  updatedAt: string;
  streak: number;
  completed: boolean;
  category: HabitCategory;
  reminderTime?: string;
  isArchived: boolean;
}

// Mock data
export const mockHabits: Habit[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    description: 'Start the day with 10 minutes of mindfulness',
    frequency: 'daily',
    timeOfDay: '06:00',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
    streak: 5,
    completed: false,
    category: 'Mindfulness',
    reminderTime: '06:00',
    isArchived: false
  },
  {
    id: '2',
    title: 'Read 20 Pages',
    description: 'Read at least 20 pages of any book',
    frequency: 'daily',
    timeOfDay: '21:00',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
    streak: 3,
    completed: true,
    category: 'Learning',
    isArchived: false
  },
  {
    id: '3',
    title: 'Weekly Planning',
    description: 'Plan goals and tasks for the upcoming week',
    frequency: 'weekly',
    timeOfDay: '18:00',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
    streak: 2,
    completed: false,
    category: 'Productivity',
    isArchived: true
  }
];