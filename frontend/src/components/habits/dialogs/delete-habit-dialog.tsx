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
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Habit</DialogTitle>
          <DialogDescription>
            This will permanently delete the habit &quot;{habitTitle}&quot;. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
