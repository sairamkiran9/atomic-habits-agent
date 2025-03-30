"use client"

import { useState } from 'react';
import { Habit, CreateHabitData } from '@/lib/types/habit';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HabitForm } from './habit-form';
import { Archive, CheckCircle2, Circle, Edit2, Flame, ArchiveRestore, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteConfirmationProps {
  habitTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

// Simple inline delete confirmation component
function DeleteConfirmation({ habitTitle, onCancel, onConfirm }: DeleteConfirmationProps) {
  return (
    <Card className="absolute bottom-4 right-4 p-4 bg-destructive/10 border-destructive border shadow-lg z-50 max-w-md">
      <CardHeader className="p-2">
        <CardTitle className="text-base">Delete Habit</CardTitle>
        <CardDescription>
          Are you sure you want to delete "{habitTitle}"? This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-2 pt-0 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" size="sm" onClick={onConfirm}>Delete</Button>
      </CardFooter>
    </Card>
  );
}

interface HabitListProps {
  habits: Habit[];
  onHabitComplete: (id: number) => void;
  onHabitUpdate: (id: number, data: Partial<CreateHabitData>) => void;
  onHabitDelete: (id: number) => void;
  onArchiveHabit: (id: number) => void;
  showArchiveButton?: boolean;
  isArchivedView?: boolean;
}

export function HabitList({
  habits,
  onHabitComplete,
  onHabitUpdate,
  onHabitDelete,
  onArchiveHabit,
  showArchiveButton = true,
  isArchivedView = false
}: HabitListProps) {
  // Track which habit is being deleted (if any)
  const [habitToDelete, setHabitToDelete] = useState<number | null>(null);

  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 'bg-amber-50 text-amber-700 border-amber-500';
      case 'weekly':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'monthly':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const handleUpdate = (habit: Habit) => (data: Partial<CreateHabitData>) => {
    onHabitUpdate(habit.id, data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get the habit object for the habit being deleted
  const habitBeingDeleted = habits.find(h => h.id === habitToDelete);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative auto-rows-fr">
      {habits.map((habit) => (
        <Card 
          key={habit.id} 
          className={cn(
            "group h-full bg-white overflow-hidden",
            habit.completed ? "border-l-amber-500 border-l-4 border-t border-r border-b border-amber-500" : "border border-amber-500",
          )}
        >
          {/* Card Header */}
          <CardHeader className="py-2 px-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs font-normal rounded-full px-3 py-1",
                  getFrequencyColor(habit.frequency)
                )}
              >
                {habit.frequency}
              </Badge>
            </div>
            <div className="mt-2">
              <CardTitle className="text-base font-medium text-amber-800 line-clamp-1">
                {habit.title}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2 text-xs text-amber-700/70">
                {habit.description}
              </CardDescription>
            </div>
          </CardHeader>
          
          {/* Card Content */}
          <CardContent className="px-4 pt-2 flex-1">
            <div className="flex items-center gap-2 text-amber-600 mt-2">
              <Flame className="h-4 w-4" />
              <span className="font-medium text-amber-700">{habit.streak}</span>
              <span className="text-amber-600/80">day streak</span>
            </div>
            
            {/* <div className="mt-4">
              <div className="text-xs text-amber-500/80">
                Started {formatDate(habit.created_at)}
              </div>
            </div>
             */}
          </CardContent>
          
          {/* Card Footer */}
          <CardFooter className="px-4 py-2 flex-shrink-0 mt-auto">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onHabitComplete(habit.id)}
                  className={cn(
                    "p-1 rounded-full",
                    habit.completed ? "text-amber-600" : "text-amber-300"
                  )}
                >
                  {habit.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <HabitForm
                  initialData={habit}
                  onSubmit={handleUpdate(habit)}
                  trigger={
                    <button className="p-1 text-amber-500 rounded-full">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  }
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <button 
                  className="p-1 text-amber-500 rounded-full"
                  onClick={() => onArchiveHabit(habit.id)}
                >
                  {isArchivedView ? (
                    <ArchiveRestore className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </button>
                <button 
                  className="p-1 text-red-400 rounded-full"
                  onClick={() => setHabitToDelete(habit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}

      {/* Show delete confirmation if a habit is selected for deletion */}
      {habitToDelete !== null && habitBeingDeleted && (
        <DeleteConfirmation
          habitTitle={habitBeingDeleted.title}
          onCancel={() => setHabitToDelete(null)}
          onConfirm={() => {
            onHabitDelete(habitToDelete);
            setHabitToDelete(null);
          }}
        />
      )}
    </div>
  );
}