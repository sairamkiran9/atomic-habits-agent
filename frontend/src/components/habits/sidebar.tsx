"use client"

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart2,
  BookOpen,
  Brain,
  Archive,
  Grid,
  Heart,
  Menu,
  Star,
  Users,
  X,
  Dumbbell,
  Briefcase,
} from 'lucide-react';
import type { HabitCategory } from '@/lib/types/habit';

interface SidebarProps {
  selectedCategory: string | null;
  showArchived: boolean;
  onSelectCategory: (category: string | null) => void;
  onToggleArchived: () => void;
  categoryCount: Record<string, number>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  All: <Grid className="h-4 w-4" />,
  Mindfulness: <Brain className="h-4 w-4" />,
  Learning: <BookOpen className="h-4 w-4" />,
  Productivity: <BarChart2 className="h-4 w-4" />,
  Health: <Heart className="h-4 w-4" />,
  Fitness: <Dumbbell className="h-4 w-4" />,
  Career: <Briefcase className="h-4 w-4" />,
  Social: <Users className="h-4 w-4" />,
  Other: <Star className="h-4 w-4" />,
};

export function Sidebar({
  selectedCategory,
  showArchived,
  onSelectCategory,
  onToggleArchived,
  categoryCount,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-amber-200/30 bg-amber-50/90 dark:bg-amber-900/20 transition-all duration-300 backdrop-blur-sm",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && (
          <h2 className="font-semibold text-amber-900 dark:text-amber-200">
            {showArchived ? "Archived Habits" : "Categories"}
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {Object.entries(categoryIcons).map(([category, icon]) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center",
                // Dim the categories with 0 count
                selectedCategory === category ? "bg-amber-200/70 text-amber-900 hover:bg-amber-200/80 dark:bg-amber-700/50 dark:text-amber-100 dark:hover:bg-amber-700/70" : 
                "text-amber-900 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-800/50",
                categoryCount[category] === 0 && "opacity-50"
              )}
              onClick={() => onSelectCategory(category === 'All' ? null : category)}
              disabled={categoryCount[category] === 0}
            >
              {icon}
              {!isCollapsed && (
                <>
                  <span className="ml-2">{category}</span>
                  {categoryCount[category] > 0 && (
                    <span className="ml-auto text-xs font-medium">
                      {categoryCount[category]}
                    </span>
                  )}
                </>
              )}
            </Button>
          ))}
          <Button
            variant={showArchived ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              showArchived ? "bg-amber-200/70 text-amber-900 hover:bg-amber-200/80 dark:bg-amber-700/50 dark:text-amber-100 dark:hover:bg-amber-700/70" : 
              "text-amber-900 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-800/50"
            )}
            onClick={onToggleArchived}
          >
            <Archive className={cn("h-4 w-4", showArchived && "text-amber-900 dark:text-amber-300")} />
            {!isCollapsed && (
              <>
                <span className="ml-2">{showArchived ? "Back to Active" : "Archived"}</span>
                {categoryCount['Archived'] > 0 && (
                  <span className="ml-auto text-xs font-medium">
                    {categoryCount['Archived']}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}