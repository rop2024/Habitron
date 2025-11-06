import React from 'react';
import { Habit } from '../types/database';

interface StatsOverviewProps {
  habits: (Habit & { 
    today_completed?: boolean; 
    stats?: any 
  })[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ habits }) => {
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.today_completed).length;
  
  const totalStreak = habits.reduce((sum, habit) => sum + (habit.stats?.streak || 0), 0);
  const averageCompletion = habits.length > 0 
    ? habits.reduce((sum, habit) => sum + (habit.stats?.completion_rate || 0), 0) / habits.length 
    : 0;

  const stats = [
    {
      label: 'Total Habits',
      value: totalHabits,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📊'
    },
    {
      label: 'Completed Today',
      value: `${completedToday}/${totalHabits}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅'
    },
    {
      label: 'Total Streak',
      value: totalStreak,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '🔥'
    },
    {
      label: 'Avg Completion',
      value: `${Math.round(averageCompletion)}%`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '📈'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center text-xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;