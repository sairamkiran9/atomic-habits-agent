"use client"

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Habit, HabitFrequency } from '@/lib/types/habit';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';

interface HabitFormProps {
  initialData?: Habit;
  onSubmit: (data: Partial<Habit>) => void;
  trigger?: React.ReactNode;
}

export function HabitForm({ initialData, onSubmit, trigger }: HabitFormProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<Habit>>({
    defaultValues: initialData
  });

  const onFormSubmit = (data: Partial<Habit>) => {
    onSubmit(data);
    setOpen(false);
  };

  const handleFrequencyChange = (value: HabitFrequency) => {
    setValue('frequency', value);
  };

  const handleCategoryChange = (value: string) => {
    setValue('category', value);
  };

  const categories = [
    'Mindfulness',
    'Learning',
    'Productivity',
    'Health',
    'Fitness',
    'Other'
  ];

  const content = (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Habit Title
        </label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="Enter habit title"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter habit description"
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Frequency
          </label>
          <Select 
            onValueChange={handleFrequencyChange}
            defaultValue={initialData?.frequency}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Category
          </label>
          <Select 
            onValueChange={handleCategoryChange}
            defaultValue={initialData?.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="timeOfDay" className="text-sm font-medium">
            Time of Day
          </label>
          <Input
            id="timeOfDay"
            type="time"
            {...register("timeOfDay")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reminderTime" className="text-sm font-medium">
            Reminder Time
          </label>
          <Input
            id="reminderTime"
            type="time"
            {...register("reminderTime")}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? 'Update Habit' : 'Create Habit'}
      </Button>
    </form>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{initialData ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
            <DialogDescription>
              {initialData 
                ? 'Edit your habit details below.' 
                : 'Fill in the details to create a new habit.'}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}