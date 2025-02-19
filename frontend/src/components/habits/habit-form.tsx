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
import type { Habit, HabitFrequency, HabitCategory, CreateHabitData } from '@/lib/types/habit';
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
  onSubmit: (data: CreateHabitData) => void;
  trigger?: React.ReactNode;
}

export function HabitForm({ initialData, onSubmit, trigger }: HabitFormProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateHabitData>({
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      frequency: initialData.frequency,
      time_of_day: initialData.time_of_day,
      category: initialData.category,
      reminder_time: initialData.reminder_time,
    } : undefined
  });

  const onFormSubmit = (data: CreateHabitData) => {
    onSubmit(data);
    setOpen(false);
  };

  const handleFrequencyChange = (value: HabitFrequency) => {
    setValue('frequency', value);
  };

  const handleCategoryChange = (value: HabitCategory) => {
    setValue('category', value);
  };

  const categories: HabitCategory[] = [
    'Mindfulness',
    'Learning',
    'Productivity',
    'Health',
    'Fitness',
    'Career',
    'Social',
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
          {...register("description", { required: "Description is required" })}
          placeholder="Enter habit description"
          className="min-h-[100px]"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
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
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="time_of_day" className="text-sm font-medium">
            Time of Day
          </label>
          <Input
            id="time_of_day"
            type="time"
            {...register("time_of_day")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reminder_time" className="text-sm font-medium">
            Reminder Time
          </label>
          <Input
            id="reminder_time"
            type="time"
            {...register("reminder_time")}
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