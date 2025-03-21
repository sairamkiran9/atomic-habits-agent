"use client"

import { useState } from 'react';
import { Habit, CreateHabitData } from '@/lib/types/habit';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HabitForm } from './habit-form';
import { Archive, CheckCircle2, Circle, Clock, Edit2, Flame, Target, ArchiveRestore, Trash2 } from 'lucide-react';
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
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100';
      case 'weekly':
        return 'bg-purple-50 text-purple-700 hover:bg-purple-100';
      case 'monthly':
        return 'bg-orange-50 text-orange-700 hover:bg-orange-100';
      default:
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100';
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative">
      {habits.map((habit) => (
        <Card 
          key={habit.id} 
          className={cn(
            "group transition-all duration-300 hover:shadow-md",
            "border-l-4",
            habit.completed ? "border-l-purple-500" : "border-l-gray-200"
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="line-clamp-1 text-lg font-semibold">
                    {habit.title}
                  </CardTitle>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "text-xs font-medium capitalize",
                      getFrequencyColor(habit.frequency)
                    )}
                  >
                    {habit.frequency}
                  </Badge>
                </div>
                <CardDescription className="mt-1 line-clamp-2 text-sm">
                  {habit.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-orange-600">
                  <Flame className="h-4 w-4" />
                  <span className="font-medium">{habit.streak}</span>
                  <span className="text-gray-600">day streak</span>
                </div>
                {habit.time_of_day && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{habit.time_of_day}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Target className="h-3.5 w-3.5" />
                <span>Started {formatDate(habit.created_at)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t">
            <div className="flex justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHabitComplete(habit.id)}
                className={cn(
                  "hover:bg-purple-50 transition-colors",
                  habit.completed ? "text-purple-600" : "text-gray-500"
                )}
              >
                {habit.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </Button>
              <div className="flex gap-1">
                <HabitForm
                  initialData={habit}
                  onSubmit={handleUpdate(habit)}
                  trigger={
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-gray-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onArchiveHabit(habit.id)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  {isArchivedView ? (
                    <ArchiveRestore className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHabitToDelete(habit.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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