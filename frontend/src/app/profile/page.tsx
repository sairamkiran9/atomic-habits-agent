"use client"

import { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/layout/container';
import { StreakGraph } from '@/components/habits/streak-graph';
import { auth, habits as habitsService } from '@/lib/services';
import { User } from '@/lib/types/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Award, Calendar, LogOut } from 'lucide-react';
import { useDemoMode } from '@/components/providers/demo-mode-provider';

interface StreakData {
  date: string;
  count: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [streakData, setStreakData] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDemoMode, disableDemoMode } = useDemoMode();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (!auth.isAuthenticated()) {
          router.push('/login');
          return;
        }
        
        // Try to get user from localStorage or direct service
        let userData = auth.getUser();
        
        // If no user data in local storage, try to fetch from API
        if (!userData) {
          try {
            userData = await auth.getCurrentUser();
          } catch (error) {
            console.error("Error fetching user data:", error);
            if (!isDemoMode) {
              // Only redirect non-demo users
              router.push('/login');
              return;
            }
          }
        }
        
        setUser(userData);
        await fetchStreakData();
      } catch (error) {
        console.error("Error in profile page:", error);
        if (!isDemoMode) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router, isDemoMode]);

  const fetchStreakData = async () => {
    try {
      const data = await generateStreakData();
      setStreakData(data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
      setStreakData([]);
    }
  };

  const generateStreakData = async (): Promise<StreakData[]> => {
    try {
      const habits = await habitsService.getHabits();
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
        
        // For the demo, we'll generate some activity data
        if (isDemoMode) {
          // Add random completions for demo data
          const daysToSimulate = Math.floor(Math.random() * 60) + 10; // 10-70 days
          const simulationStartDate = new Date(today);
          simulationStartDate.setDate(today.getDate() - daysToSimulate);
          
          for (let i = 0; i < daysToSimulate; i++) {
            // Simulate about 70% completion rate
            if (Math.random() < 0.7) {
              const simulationDate = new Date(simulationStartDate);
              simulationDate.setDate(simulationStartDate.getDate() + i);
              const dateStr = simulationDate.toISOString().split('T')[0];
              const dayData = dailyCompletionMap.get(dateStr) || { completed: 0, total: 0 };
              dayData.completed += 1;
              dayData.total += 1;
              dailyCompletionMap.set(dateStr, dayData);
            }
          }
        } else {
          // Normal logic for real data
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
    if (isDemoMode) {
      disableDemoMode();
    } else {
      auth.logout();
      router.push('/login');
    }
  };

  const joinDate = useMemo(() => {
    // For demo user, use a fixed date
    if (isDemoMode) {
      return "January 15, 2024";
    }
    
    // For real users, use their join date or fallback to current date
    if (user?.created_at) {
      return new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [user, isDemoMode]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.full_name}
                        {isDemoMode && <span className="ml-2 text-sm font-normal text-amber-600">(Demo User)</span>}
                      </h1>
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
                  {isDemoMode ? 'Exit Demo' : 'Logout'}
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
          
          {isDemoMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              <p className="font-medium">Demo Mode Information</p>
              <p className="text-sm mt-1">
                This is a demo profile with simulated activity data. In a real account, 
                your habit tracking activity would be displayed here, showing your streaks and progress over time.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}