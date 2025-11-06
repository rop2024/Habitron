import React, { useEffect, useState } from 'react';
import { Habit, HabitCheckin } from '../types/database';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, habit }) => {
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (isOpen && habit) {
      loadCheckins();
    }
  }, [isOpen, habit, selectedPeriod]);

  const loadCheckins = async () => {
    if (!habit || !window.electronAPI) return;

    setLoading(true);
    try {
      let startDate: string | undefined;
      const endDate = new Date().toISOString().split('T')[0];

      if (selectedPeriod === 'week') {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        startDate = date.toISOString().split('T')[0];
      } else if (selectedPeriod === 'month') {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        startDate = date.toISOString().split('T')[0];
      }

      const checkinsData = await window.electronAPI.habits.getCheckins(
        habit.id,
        startDate,
        endDate
      );
      setCheckins(checkinsData);
    } catch (error) {
      console.error('Error loading checkins:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (checkins.length === 0) return 0;
    const completed = checkins.filter(c => c.completed).length;
    return Math.round((completed / checkins.length) * 100);
  };

  const getCurrentStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const checkin = checkins.find(c => c.checkin_date === dateStr);
      if (checkin?.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    
    if (selectedPeriod === 'week') {
      startDate.setDate(today.getDate() - 6);
    } else {
      startDate.setDate(today.getDate() - 29);
    }

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days.reverse();
  };

  if (!isOpen || !habit) return null;

  const completionRate = getCompletionRate();
  const currentStreak = getCurrentStreak();
  const calendarDays = getCalendarDays();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${habit.color}20` }}
              >
                {habit.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {habit.name} Progress
                </h2>
                <p className="text-gray-500 text-sm">
                  Track your consistency and improvements
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {completionRate}%
                </div>
                <div className="text-sm text-blue-800 font-medium mt-1">
                  Completion Rate
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentStreak}
                </div>
                <div className="text-sm text-green-800 font-medium mt-1">
                  Current Streak
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {checkins.filter(c => c.completed).length}
                </div>
                <div className="text-sm text-purple-800 font-medium mt-1">
                  Total Completed
                </div>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex space-x-2 mb-6">
              {(['week', 'month', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* Calendar View */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Progress Calendar
              </h3>
              <div className={`grid gap-2 ${
                selectedPeriod === 'week' ? 'grid-cols-7' : 'grid-cols-10'
              }`}>
                {calendarDays.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const checkin = checkins.find(c => c.checkin_date === dateStr);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div
                      key={dateStr}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${
                        checkin?.completed
                          ? 'bg-green-500 text-white'
                          : isToday
                          ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={`${date.toLocaleDateString()}: ${
                        checkin?.completed ? 'Completed' : 'Not completed'
                      }`}
                    >
                      {date.getDate()}
                      {checkin?.notes && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Check-ins */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Check-ins
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading check-ins...</p>
                </div>
              ) : checkins.length > 0 ? (
                <div className="space-y-3">
                  {checkins.slice(0, 10).map((checkin) => (
                    <div
                      key={checkin.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            checkin.completed ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></div>
                        <span className="text-gray-700">
                          {new Date(checkin.checkin_date).toLocaleDateString()}
                        </span>
                        {checkin.notes && (
                          <span className="text-sm text-gray-500 truncate max-w-xs">
                            - {checkin.notes}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {checkin.completed ? '✅ Completed' : '❌ Missed'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No check-in data available for the selected period.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;