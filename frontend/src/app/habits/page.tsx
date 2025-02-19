"use client"

import { useState, useEffect, useMemo } from 'react';
import { Container } from '@/components/layout/container';
import { HabitList } from '@/components/habits/habit-list';
import { Sidebar } from '@/components/habits/sidebar';
import { HabitForm } from '@/components/habits/habit-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { type Habit, type HabitCategory, type CreateHabitData } from '@/lib/types/habit';
import { HabitsService } from '@/lib/services/habits';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/auth';

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchHabits();
  }, [router]);

  const fetchHabits = async () => {
    try {
      setError(null);
      const fetchedHabits = await HabitsService.getHabits();
      setHabits(fetchedHabits);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError('Failed to load habits. Please try again.');
      if (error instanceof Error && error.message.includes('401')) {
        AuthService.logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesArchived = showArchived === habit.is_archived;
      const matchesCategory = !selectedCategory || habit.category === selectedCategory;
      return matchesArchived && matchesCategory;
    });
  }, [habits, selectedCategory, showArchived]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {
      All: 0,
      Archived: 0,
      Mindfulness: 0,
      Learning: 0,
      Productivity: 0,
      Health: 0,
      Fitness: 0,
      Career: 0,
      Social: 0,
      Other: 0,
    };

    habits.forEach(habit => {
      if (!habit.is_archived) {
        counts[habit.category]++;
        counts['All']++;
      } else {
        counts['Archived']++;
      }
    });

    return counts;
  }, [habits]);

  const handleAddHabit = async (data: CreateHabitData) => {
    try {
      setError(null);
      const newHabit = await HabitsService.createHabit({
        title: data.title,
        description: data.description,
        frequency: data.frequency,
        time_of_day: data.time_of_day,
        category: data.category,
        reminder_time: data.reminder_time,
      });
      setHabits(prevHabits => [...prevHabits, newHabit]);
    } catch (error) {
      console.error('Error creating habit:', error);
      setError('Failed to create habit. Please try again.');
    }
  };

  const handleHabitComplete = async (id: number) => {
    try {
      setError(null);
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const updatedHabit = await HabitsService.updateHabit(id, {
        ...habit,
        completed: !habit.completed
      });

      setHabits(prevHabits => 
        prevHabits.map(h => h.id === id ? updatedHabit : h)
      );
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Failed to update habit. Please try again.');
    }
  };

  const handleHabitUpdate = async (id: number, data: Partial<Habit>) => {
    try {
      setError(null);
      const updatedHabit = await HabitsService.updateHabit(id, data);
      setHabits(prevHabits => 
        prevHabits.map(h => h.id === id ? updatedHabit : h)
      );
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Failed to update habit. Please try again.');
    }
  };

  const handleHabitDelete = async (id: number) => {
    try {
      setError(null);
      await HabitsService.deleteHabit(id);
      setHabits(prevHabits => prevHabits.filter(h => h.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Failed to delete habit. Please try again.');
    }
  };

  const handleArchiveHabit = async (id: number) => {
    try {
      setError(null);
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const updatedHabit = await HabitsService.updateHabit(id, {
        ...habit,
        is_archived: !habit.is_archived
      });

      setHabits(prevHabits => 
        prevHabits.map(h => h.id === id ? updatedHabit : h)
      );
    } catch (error) {
      console.error('Error archiving habit:', error);
      setError('Failed to archive habit. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Sidebar
        selectedCategory={selectedCategory}
        showArchived={showArchived}
        onSelectCategory={setSelectedCategory}
        onToggleArchived={() => setShowArchived(!showArchived)}
        categoryCount={categoryCount}
      />
      <main className="flex-1 overflow-y-auto">
        <Container>
          <div className="py-8">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 text-red-500 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {showArchived ? 'Archived Habits' : 'Your Habits'}
                  {selectedCategory && ` - ${selectedCategory}`}
                </h1>
                <p className="text-gray-300 mt-2">
                  {showArchived 
                    ? 'View and manage your archived habits'
                    : 'Track and manage your daily habits'}
                </p>
              </div>
              {!showArchived && (
                <HabitForm
                  onSubmit={handleAddHabit}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Habit
                    </Button>
                  }
                />
              )}
            </div>

            <HabitList
              habits={filteredHabits}
              onHabitComplete={handleHabitComplete}
              onHabitUpdate={handleHabitUpdate}
              onHabitDelete={handleHabitDelete}
              onArchiveHabit={handleArchiveHabit}
              showArchiveButton={!showArchived}
            />
          </div>
        </Container>
      </main>
    </div>
  );
}