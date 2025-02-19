import { reverse } from 'dns';
import React, { useMemo, useState } from 'react';

interface StreakData {
  date: string;
  count: number;
}

interface StreakGraphProps {
  data: StreakData[];
  totalActiveDays: number;
  maxStreak: number;
}

export const StreakGraph: React.FC<StreakGraphProps> = ({ data, totalActiveDays, maxStreak }) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create a date map for O(1) lookups
  const dateMap = useMemo(() => {
    return data.reduce((acc, item) => {
      acc[item.date] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  // Generate timeline data organized by years
  const { yearsData, availableYears, defaultYear } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    startDate.setFullYear(endDate.getFullYear() - 1);
    startDate.setDate(1);
    startDate.setMonth(0);

    const years: { year: number; months: { month: string; weeks: Date[][] }[] }[] = [];
    const months: { month: string; weeks: Date[][] }[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthKey = currentDate.toLocaleString('default', { month: 'short' });
      let currentYear = years.find(y => y.year === currentDate.getFullYear());
      if (!currentYear) {
        currentYear = { year: currentDate.getFullYear(), months: [] };
        years.push(currentYear)
      }

      let currentMonth = currentYear.months.find(m => m ? m.month == monthKey: undefined);

      if (!currentMonth) {
        currentMonth = { month: monthKey, weeks: [] };
        months.push(currentMonth);
      }

      // Find or create the current week
      let currentWeek = currentMonth.weeks[currentMonth.weeks.length - 1];

      if (!currentWeek || currentWeek.length === 7) {
        currentWeek = [];
        currentMonth.weeks.push(currentWeek);
        currentYear.months[currentDate.getMonth()] = currentMonth;
      }

      currentWeek[currentDate.getDay()] = new Date(currentDate);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const yearsList = years.map(item => item.year).sort((a,b) => b-a);

    return {
      yearsData: years,
      availableYears: yearsList,
      defaultYear: yearsList[0]
    };
  }, []);

  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Get color based on activity count
  const getColor = (count: number) => {
    if (count === - 1) return '';
    if (count === 0) return 'bg-gray-200';
    if (count <= 3) return 'bg-green-200';
    if (count <= 6) return 'bg-green-400';
    return 'bg-green-600';
  };

  // Get activity count for a date
  const getActivityCount = (date: Date | null) => {
    if (!date) return -1;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return dateMap[dateStr] || 0;
  };

  const timelineData = yearsData.find(y => y.year == selectedYear)?.months;

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Activity Overview</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Select Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid">
        {/* Month Headers */}
        <div className="grid grid-cols-[auto,1fr] gap-4">
          <div className="w-12" />
          <div className="grid grid-cols-12 gap-4">
            {timelineData && timelineData.map((month, index) => (
              <div key={index} className="text-sm text-gray-600 font-medium">
                {month.month}
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-[auto,1fr] gap-4 mt-2">
          {/* Weekday Labels */}
          <div className="flex flex-col gap-2">
            {weekDays.map((day, index) => (
              <div key={index} className="text-sm text-gray-600 h-6 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-12 gap-4">
          {timelineData && timelineData.map((month, monthIndex) => (
              <div key={monthIndex} className="flex flex-col gap-2">
                {weekDays.map((_, dayIndex) => (
                  <div key={dayIndex} className="flex gap-1">
                    {month.weeks.map((week, weekIndex) => {
                      const date = week[dayIndex];
                      
                      const count = getActivityCount(date);
                      return (
                        <div
                          key={weekIndex}
                          className={`
                            w-6 h-6
                            ${getColor(count)}
                            rounded-sm
                            transition-all duration-100
                            hover:ring-1 hover:ring-gray-400
                            group
                            relative
                          `}
                        >
                          {/* Tooltip */}
                          <div className="invisible group-hover:visible absolute z-20 px-2 py-1 text-xs 
                                      text-white bg-gray-900 rounded-md -top-8 left-1/2 transform -translate-x-1/2
                                      whitespace-nowrap shadow-lg">
                            {`${count} contributions on ${date ? date.toLocaleDateString() : 0}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end space-x-2 text-xs text-gray-600 mt-4">
          <span>Less</span>
          <div className="flex gap-2">
            <div className="w-[15px] h-[15px] bg-gray-200 rounded" />
            <div className="w-[15px] h-[15px] bg-green-200 rounded" />
            <div className="w-[15px] h-[15px] bg-green-400 rounded" />
            <div className="w-[15px] h-[15px] bg-green-600 rounded" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};