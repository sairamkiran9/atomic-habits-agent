"use client"

import { useState, useMemo } from 'react';
import { Container } from '@/components/layout/container';
import { HabitList } from '@/components/habits/habit-list';
import { Sidebar } from '@/components/habits/sidebar';
import { HabitForm } from '@/components/habits/habit-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockHabits, type Habit, type HabitCategory } from '@/lib/types/habit';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesArchived = showArchived === habit.isArchived;
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
      if (!habit.isArchived) {
        counts[habit.category]++;
        counts['All']++;
      } else {
        counts['Archived']++;
      }
    });

    return counts;
  }, [habits]);

  const handleAddHabit = (data: Partial<Habit>) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: data.title || '',
      description: data.description || '',
      frequency: data.frequency || 'daily',
      timeOfDay: data.timeOfDay,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0,
      completed: false,
      category: data.category as HabitCategory || 'Other',
      reminderTime: data.reminderTime,
      isArchived: false
    };

    setHabits([...habits, newHabit]);
  };

  const handleHabitComplete = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const handleHabitUpdate = (id: string, data: Partial<Habit>) => {
    setHabits(habits.map(habit =>
      habit.id === id ? { ...habit, ...data, updatedAt: new Date().toISOString() } : habit
    ));
  };

  const handleHabitDelete = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const handleArchiveHabit = (id: string) => {
    setHabits(habits.map(habit =>
      habit.id === id ? { ...habit, isArchived: !habit.isArchived } : habit
    ));
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        selectedCategory={selectedCategory}
        showArchived={showArchived}
        onSelectCategory={setSelectedCategory}
        onToggleArchived={() => setShowArchived(!showArchived)}
        categoryCount={categoryCount}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Container>
          <div className="py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {showArchived ? 'Archived Habits' : 'Your Habits'}
                  {selectedCategory && ` - ${selectedCategory}`}
                </h1>
                <p className="text-gray-600 mt-2">
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
              showArchiveButton={true}
            />
          </div>
        </Container>
      </main>
    </div>
  );
}