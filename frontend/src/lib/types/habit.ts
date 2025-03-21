export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type HabitCategory = 'Mindfulness' | 'Learning' | 'Productivity' | 'Health' | 'Fitness' | 'Career' | 'Social' | 'Other';

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
  last_completed?: string | null;
}

export interface CreateHabitData {
  title: string;
  description: string;
  frequency: HabitFrequency;
  time_of_day?: string | null;
  category: HabitCategory;
  reminder_time?: string | null;
}