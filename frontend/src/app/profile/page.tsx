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
      oneYearAgo.setMonth(0)
  
      const dailyStreakMap = new Map<string, number[]>();
  
      // Initialize the map with dates for the past year
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyStreakMap.set(dateStr, []);
      }
  
      // Populate the map with habit streaks
      habits.forEach(habit => {
        const habitCreatedDate = new Date(habit.created_at);
        let currentDate = new Date(Math.max(habitCreatedDate.getTime(), oneYearAgo.getTime()));
  
        while (currentDate <= today) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const streaksForDay = dailyStreakMap.get(dateStr) || [];
          streaksForDay.push(habit.streak || 0);
          dailyStreakMap.set(dateStr, streaksForDay);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
  
      // Calculate total streaks per day and format data
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const streaksForDay = dailyStreakMap.get(dateStr) || [];
        
        // Sum up all streaks for the day
        const totalStreak = streaksForDay.reduce(
          (sum: number, streak: number): number => sum + streak, 
          0
        );

        const avgStreak = streaksForDay.length > 0 ? totalStreak / streaksForDay.length : 0;
  
        data.push({
          date: dateStr,
          count: avgStreak
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