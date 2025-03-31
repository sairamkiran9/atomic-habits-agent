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
        "relative z-10 border-r border-amber-200 bg-white transition-all duration-300 sidebar",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header - Fixed at the top */}
      <div className="p-4 flex justify-between items-center border-b border-amber-100 sticky top-0 bg-white z-10">
        {!isCollapsed && (
          <h2 className="font-medium text-amber-700">
            {showArchived ? "Archived Habits" : "Categories"}
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-600 hover:bg-amber-50 ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Scrollable content area */}
      <div className="sidebar-content">
        <ScrollArea className="h-full">
          <div className="space-y-2 py-3 px-3">
            {Object.entries(categoryIcons).map(([category, icon]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center",
                  // Dim the categories with 0 count
                  selectedCategory === category ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : 
                  "text-amber-700 hover:bg-amber-50",
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
                showArchived ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : 
                "text-amber-700 hover:bg-amber-50"
              )}
              onClick={onToggleArchived}
            >
              <Archive className={cn("h-4 w-4", showArchived && "text-amber-800")} />
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
    </div>
  );
}