"use client"

import { useMemo } from 'react';
import { Container } from '@/components/layout/container';
import { StreakGraph } from '@/components/habits/streak-graph';

export default function ProfilePage() {
  const generateMockData = () => {
    const data = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      // Generate more realistic data patterns
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseCount = isWeekend ? Math.random() > 0.7 ? 1 : 0 : Math.random() > 0.3 ? 2 : 1;
      const randomVariation = Math.floor(Math.random() * 3);
      const count = Math.max(0, baseCount + randomVariation - (Math.random() > 0.8 ? 3 : 0));
      
      data.push({
        date: d.toISOString().split('T')[0],
        count
      });
    }
    return data;
  };

  const streakData = useMemo(() => generateMockData(), []);

  // Calculate stats
  const stats = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalActiveDays = 0;

    [...streakData].reverse().forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        totalActiveDays++;
        maxStreak = Math.max(maxStreak, tempStreak);
        if (currentStreak === 0) currentStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    return {
      currentStreak,
      maxStreak,
      totalActiveDays
    };
  }, [streakData]);

  return (
    <div className="min-h-screen">
      <Container>
        <div className="py-8">
          <StreakGraph
            data={streakData}
            totalActiveDays={stats.totalActiveDays}
            maxStreak={stats.maxStreak}
          />
        </div>
      </Container>
    </div>
  );
}