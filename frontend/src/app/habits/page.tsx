"use client"

import { useState, useEffect, useMemo } from 'react';
import { Container } from '@/components/layout/container';
import { HabitList } from '@/components/habits/habit-list';
import { Sidebar } from '@/components/habits/sidebar';
import { HabitForm } from '@/components/habits/habit-form';
import { Button } from '@/components/ui/button';
import { Plus, Archive } from 'lucide-react';
import { HabitsService } from '@/lib/services/habits';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/auth';
import type { Habit, CreateHabitData, HabitCategory } from '@/lib/types/habit';

// Type definitions
interface CategoryCounts {
  [key: string]: number;
  All: number;
  Archived: number;
  Mindfulness: number;
  Learning: number;
  Productivity: number;
  Health: number;
  Fitness: number;
  Career: number;
  Social: number;
  Other: number;
}

export default function HabitsPage() {
  // State management
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check and initial data fetch
  useEffect(() => {
    const checkAuthAndFetchHabits = async () => {
      if (!AuthService.isAuthenticated()) {
        router.push('/login');
        return;
      }
      await fetchHabits();
    };

    checkAuthAndFetchHabits();
  }, [router]);

  // Function to handle toggling between active and archived habits view
  const handleToggleArchived = async () => {
    // Toggle the showArchived state
    setShowArchived(!showArchived);
    
    // Refetch habits to ensure we have the latest data
    await fetchHabits();
  };

  // Data fetching
  const fetchHabits = async () => {
    try {
      setError(null);
      const fetchedHabits = await HabitsService.getHabits();
      setHabits(fetchedHabits);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error fetching habits:', errorMessage);
      setError('Failed to load habits. Please try again.');
      
      if (errorMessage.includes('401')) {
        AuthService.logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Memoized computations
  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesArchived = showArchived === habit.is_archived;
      const matchesCategory = !selectedCategory || habit.category === selectedCategory;
      return matchesArchived && matchesCategory;
    });
  }, [habits, selectedCategory, showArchived]);

  const categoryCount = useMemo<CategoryCounts>(() => {
    const counts: CategoryCounts = {
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
      if (habit.is_archived) {
        counts.Archived++;
        // Only count categories for archived items when in archived view
        if (showArchived) {
          counts[habit.category]++;
          counts.All++;
        }
      } else {
        // Only count categories for unarchived items when not in archived view
        if (!showArchived) {
          counts[habit.category]++;
          counts.All++;
        }
      }
    });

    return counts;
  }, [habits, showArchived]);

  // Event handlers
  const handleAddHabit = async (data: CreateHabitData) => {
    try {
      setError(null);
      const newHabit = await HabitsService.createHabit(data);
      setHabits(prev => [...prev, newHabit]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error creating habit:', errorMessage);
      setError('Failed to create habit. Please try again.');
    }
  };

  const handleHabitComplete = async (id: number) => {
    try {
      setError(null);
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const updatedHabit = await HabitsService.updateHabit(id, {
        completed: !habit.completed
      });

      setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error updating habit:', errorMessage);
      setError('Failed to update habit. Please try again.');
    }
  };

  const handleHabitUpdate = async (id: number, data: Partial<Habit>) => {
    try {
      setError(null);
      const updatedHabit = await HabitsService.updateHabit(id, data);
      setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error updating habit:', errorMessage);
      setError('Failed to update habit. Please try again.');
    }
  };

  const handleHabitDelete = async (id: number) => {
    try {
      setError(null);
      await HabitsService.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error deleting habit:', errorMessage);
      setError('Failed to delete habit. Please try again.');
    }
  };

  const handleArchiveHabit = async (id: number) => {
    try {
      setError(null);
      const updatedHabit = await HabitsService.toggleArchiveHabit(id);
      
      // Update state to reflect the change
      setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
      
      // Refetch habits if needed to ensure we have the most up-to-date data
      if (showArchived) {
        await fetchHabits();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error archiving/unarchiving habit:', errorMessage);
      setError('Failed to archive/unarchive habit. Please try again.');
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
        onToggleArchived={handleToggleArchived}
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
                    ? 'View, restore, or permanently delete your archived habits'
                    : 'Track and manage your daily habits'}
                </p>
              </div>
              
              {!showArchived && (
                <HabitForm
                  onSubmit={handleAddHabit}
                  defaultCategory={selectedCategory || undefined}
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
              showArchiveButton={true}
              isArchivedView={showArchived}
            />

            {showArchived && filteredHabits.length === 0 && (
              <div className="text-center py-16 bg-gray-800/20 rounded-lg">
                <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No archived habits</h3>
                <p className="text-gray-400">When you archive habits, they'll appear here.</p>
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}