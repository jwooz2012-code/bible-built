import React from 'react';
import { motion } from 'framer-motion';

export default function ReadingHeatmap({ progressData, selectedYear }) {
  // Get all reading dates from progress data
  const readingDates = {};
  
  progressData.forEach(book => {
    if (book.chapter_read_dates) {
      Object.values(book.chapter_read_dates).forEach(dateStr => {
        const date = new Date(dateStr);
        if (date.getFullYear() === selectedYear) {
          const dateKey = date.toISOString().split('T')[0];
          readingDates[dateKey] = (readingDates[dateKey] || 0) + 1;
        }
      });
    }
  });

  // Generate calendar grid for the year
  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);
  const weeks = [];
  let currentWeek = [];
  
  // Start from the first day of the year
  const current = new Date(startDate);
  
  // Pad beginning of first week
  const startDay = startDate.getDay();
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }
  
  while (current <= endDate) {
    const dateKey = current.toISOString().split('T')[0];
    const count = readingDates[dateKey] || 0;
    
    currentWeek.push({
      date: new Date(current),
      count,
      dateKey
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  // Add remaining days to last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900';
    if (count <= 5) return 'bg-green-400 dark:bg-green-700';
    if (count <= 10) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-700 dark:bg-green-400';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span className="w-8"></span>
        {months.map((month, i) => (
          <span key={i} className="flex-1 text-center">{month}</span>
        ))}
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="h-3">Sun</div>
              <div className="h-3">Mon</div>
              <div className="h-3">Tue</div>
              <div className="h-3">Wed</div>
              <div className="h-3">Thu</div>
              <div className="h-3">Fri</div>
              <div className="h-3">Sat</div>
            </div>
            
            {/* Calendar grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <motion.div
                      key={dayIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                      className={`
                        w-3 h-3 rounded-sm
                        ${day ? getIntensityColor(day.count) : 'bg-transparent'}
                        ${day?.count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-green-500' : ''}
                      `}
                      title={day ? `${day.date.toLocaleDateString()}: ${day.count} chapter${day.count !== 1 ? 's' : ''}` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
        <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
        <div className="w-3 h-3 rounded-sm bg-green-700 dark:bg-green-400"></div>
        <span>More</span>
      </div>
    </div>
  );
}