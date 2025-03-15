"use client"

import { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/layout/container';
import { StreakGraph } from '@/components/habits/streak-graph';
import { AuthService } from '@/lib/services/auth';
import { HabitsService } from '@/lib/services/habits';
import { User } from '@/lib/types/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Award, Calendar, LogOut } from 'lucide-react';

interface StreakData {
  date: string;
  count: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [streakData, setStreakData] = useState<StreakData[]>([]);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const token = AuthService.getToken();
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchStreakData = async () => {
      const data = await generateStreakData();
      setStreakData(data);
    };

    fetchStreakData();
  }, []);

  const generateStreakData = async (): Promise<StreakData[]> => {
    try {
      const habits = await HabitsService.getHabits();
      const data: StreakData[] = [];
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      oneYearAgo.setDate(1);
      oneYearAgo.setMonth(0);
  
      const dailyCompletionMap = new Map<string, { completed: number; total: number }>();
  
      // Initialize the map with dates for the past year
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyCompletionMap.set(dateStr, { completed: 0, total: 0 });
      }
  
      // Track habit completion across days
      habits.forEach(habit => {
        // Skip archived habits for activity tracking
        if (habit.is_archived) return;

        const habitCreatedDate = new Date(habit.created_at);
        const startDate = new Date(Math.max(habitCreatedDate.getTime(), oneYearAgo.getTime()));
        
        // If this habit has a last_completed date, use it for activity tracking
        if (habit.last_completed) {
          const completionDate = new Date(habit.last_completed);
          const dateStr = completionDate.toISOString().split('T')[0];
          const dayData = dailyCompletionMap.get(dateStr) || { completed: 0, total: 0 };
          
          if (habit.completed) {
            dayData.completed += 1;
          }
          dayData.total += 1;
          dailyCompletionMap.set(dateStr, dayData);
        }
        
        // Count each habit for each day since it was created
        for (let currentDate = new Date(startDate); currentDate <= today; currentDate.setDate(currentDate.getDate() + 1)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const dayData = dailyCompletionMap.get(dateStr) || { completed: 0, total: 0 };
          
          // Only increment total if we haven't counted this habit specifically for this day
          if (!habit.last_completed || new Date(habit.last_completed).toISOString().split('T')[0] !== dateStr) {
            dayData.total += 1;
          }
          
          dailyCompletionMap.set(dateStr, dayData);
        }
      });
  
      // Calculate completion percentage per day
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayData = dailyCompletionMap.get(dateStr) || { completed: 0, total: 0 };
        
        // Calculate completion percentage (0 to 1 range)
        const completionRate = dayData.total > 0 ? dayData.completed / dayData.total : 0;
  
        data.push({
          date: dateStr,
          count: completionRate
        });
      }
      return data;
    } catch (error) {
      console.error('Error generating streak data:', error);
      return [];
    }
  };

  const stats = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalActiveDays = 0;

    // Create a copy of the array to reverse
    const reversedData = [...streakData].reverse();
    
    reversedData.forEach(day => {
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

  const handleLogout = () => {
    AuthService.removeToken();
    localStorage.removeItem('user');
    router.push('/login');
  };

  const joinDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      <Container>
        <div className="py-8 space-y-8">
          {/* Profile Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                      <UserIcon size={32} className="text-violet-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail size={16} />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Award size={16} className="text-violet-500" />
                      <span>Current Streak: {stats.currentStreak} days</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Award size={16} className="text-violet-600" />
                      <span>Best Streak: {stats.maxStreak} days</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar size={16} className="text-violet-500" />
                      <span>Joined {joinDate}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="mt-4 md:mt-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          {/* Streak Graph */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <StreakGraph
              data={streakData}
              totalActiveDays={stats.totalActiveDays}
              maxStreak={stats.maxStreak}
            />
          </Card>
        </div>
      </Container>
    </div>
  );
}