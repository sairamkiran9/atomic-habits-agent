"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteHabitDialogProps {
  habitId: number;
  habitTitle: string;
  onDelete: (id: number) => void;
}

export function DeleteHabitDialog({ habitId, habitTitle, onDelete }: DeleteHabitDialogProps) {
  // Use a unique ID for each dialog instance
  const dialogId = `delete-habit-${habitId}`;
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDelete(habitId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-full"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gradient-to-br from-red-50/95 to-white dark:from-red-950/30 dark:to-gray-900/95 border-red-200/50 dark:border-red-900/30">
        <DialogHeader className="border-b border-red-200/30 dark:border-red-800/30 pb-4 mb-4">
          <DialogTitle className="text-red-800 dark:text-red-300">Delete Habit</DialogTitle>
          <DialogDescription className="text-red-700/70 dark:text-red-400/70">
            This will permanently delete the habit &quot;{habitTitle}&quot;. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-red-200 text-red-700 hover:text-red-800 hover:bg-red-50 dark:border-red-800/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
