import React from 'react';
import { Habit } from '../types/database';

interface HabitCardProps {
  habit: Habit & {
    today_completed?: boolean;
    today_checkin_id?: number;
    stats?: {
      streak: number;
      completion_rate: number;
      completed_days: number;
      total_days: number;
    };
  };
  onCheckin: (habitId: number, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  onCheckin, 
  onEdit, 
  onDelete 
}) => {
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
      {/* Header */}
      <div 
        className="h-2"
        style={{ backgroundColor: habit.color }}
      ></div>
      
      <div className="p-6">
        {/* Habit Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              {habit.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {habit.name}
              </h3>
              <p className="text-sm text-gray-500">
                {getFrequencyLabel(habit.frequency)}
              </p>
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Toggle menu would go here
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {habit.description}
          </p>
        )}

        {/* Stats */}
        {habit.stats && (
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${getStreakColor(habit.stats.streak)}`}>
                {habit.stats.streak}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Day Streak
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getCompletionRateColor(habit.stats.completion_rate)}`}>
                {habit.stats.completion_rate}%
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Completed
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {habit.stats.completed_days}/{habit.stats.total_days}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Total
              </div>
            </div>
          </div>
        )}

        {/* Check-in Button */}
        <div className="flex space-x-3">
          <button
            onClick={() => onCheckin(habit.id, !habit.today_completed)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              habit.today_completed
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {habit.today_completed ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mark Complete</span>
                </>
              )}
            </div>
          </button>
          
          {/* Quick Actions */}
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(habit)}
              className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit habit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete habit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;