"use client"

import { useState } from 'react';
import { Habit } from '@/lib/types/habit';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HabitForm } from './habit-form';
import { Check, Clock, Edit2, Flame, Trash2 } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  onHabitComplete: (id: string) => void;
  onHabitUpdate: (id: string, data: Partial<Habit>) => void;
  onHabitDelete: (id: string) => void;
}

export function HabitList({ habits, onHabitComplete, onHabitUpdate, onHabitDelete }: HabitListProps) {
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'weekly':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'monthly':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const handleUpdate = (habit: Habit) => (data: Partial<Habit>) => {
    onHabitUpdate(habit.id, data);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => (
        <Card key={habit.id} className={`relative ${habit.completed ? 'bg-muted/50' : ''}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="line-clamp-1">{habit.title}</CardTitle>
                <CardDescription className="mt-1">
                  {habit.description}
                </CardDescription>
              </div>
              <Badge 
                variant="secondary"
                className={`${getFrequencyColor(habit.frequency)} capitalize`}
              >
                {habit.frequency}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>{habit.streak} day streak</span>
              </div>
              {habit.timeOfDay && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{habit.timeOfDay}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant={habit.completed ? "ghost" : "default"}
                size="sm"
                onClick={() => onHabitComplete(habit.id)}
              >
                <Check className={`h-4 w-4 ${habit.completed ? 'text-primary' : 'text-white'}`} />
              </Button>
              <HabitForm
                initialData={habit}
                onSubmit={handleUpdate(habit)}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHabitDelete(habit.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}