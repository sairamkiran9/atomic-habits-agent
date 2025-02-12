"use client"

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StreakData {
  date: string;
  count: number;
}

interface StreakGraphProps {
  data: StreakData[];
  totalActiveDays: number;
  maxStreak: number;
}

export function StreakGraph({ data, totalActiveDays, maxStreak }: StreakGraphProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get last 12 months of data
  const last12Months = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const monthsData = [];
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const month = d.getMonth();
      const dateStr = d.toISOString().split('T')[0];
      monthsData.push({
        date: dateStr,
        count: data.find(item => item.date === dateStr)?.count || 0,
        month: months[month]
      });
    }
    return monthsData;
  }, [data]);

  const totalSubmissions = useMemo(() => 
    data.reduce((sum, day) => sum + day.count, 0),
    [data]
  );

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-[#e6e6e6]';
    if (count <= 2) return 'bg-[#9be9a8]';
    if (count <= 4) return 'bg-[#40c463]';
    if (count <= 6) return 'bg-[#30a14e]';
    return 'bg-[#216e39]';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-700">{totalSubmissions}</span>
          <span className="text-gray-600">submissions in the past one year</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total active days:</span>
            <span className="font-bold text-gray-700">{totalActiveDays}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Max streak:</span>
            <span className="font-bold text-gray-700">{maxStreak}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">
              Current
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Last Year</DropdownMenuItem>
              <DropdownMenuItem>Current Year</DropdownMenuItem>
              <DropdownMenuItem>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative">
        {/* Months */}
        <div className="flex text-xs text-gray-500 mb-2 pl-8">
          {Array.from(new Set(last12Months.map(d => d.month))).map((month, i) => (
            <div key={`${month}-${i}`} className="w-[29px]">{month}</div>
          ))}
        </div>

        {/* Graph */}
        <div className="flex">
          {/* Days */}
          <div className="flex flex-col justify-between h-[130px] mr-2 text-xs text-gray-500">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Squares */}
          <div className="grid grid-flow-col gap-[3px] auto-cols-[18px]">
            {Array.from({ length: 52 }).map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dataIndex = weekIndex * 7 + dayIndex;
                  const dayData = last12Months[dataIndex];
                  return dayData ? (
                    <Tooltip
                      key={dayIndex}
                      content={
                        <div className="text-xs">
                          <div>{dayData.count} submissions on</div>
                          <div>{formatDate(dayData.date)}</div>
                        </div>
                      }
                    >
                      <div
                        className={`w-[18px] h-[18px] rounded-sm ${getIntensityClass(dayData.count)}`}
                      />
                    </Tooltip>
                  ) : (
                    <div
                      key={dayIndex}
                      className="w-[18px] h-[18px] rounded-sm bg-[#e6e6e6]"
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 justify-end">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[18px] h-[18px] rounded-sm bg-[#e6e6e6]" />
            <div className="w-[18px] h-[18px] rounded-sm bg-[#9be9a8]" />
            <div className="w-[18px] h-[18px] rounded-sm bg-[#40c463]" />
            <div className="w-[18px] h-[18px] rounded-sm bg-[#30a14e]" />
            <div className="w-[18px] h-[18px] rounded-sm bg-[#216e39]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}