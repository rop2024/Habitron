import React, { useState } from 'react';
import { Habit } from '../types/database';

interface HabitCardProps {
  habit: Habit & {
    today_completed?: boolean;
    today_checkin_id?: number;
    today_notes?: string;
    stats?: {
      streak: number;
      completion_rate: number;
      completed_days: number;
      total_days: number;
    };
  };
  onCheckin: (habitId: number, completed: boolean, notes?: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
  onViewProgress: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onCheckin,
  onEdit,
  onDelete,
  onViewProgress
}) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [notes, setNotes] = useState(habit.today_notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600 bg-green-50';
    if (streak >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCheckin = async (completed: boolean) => {
    setIsLoading(true);
    try {
      await onCheckin(habit.id, completed, isAddingNote ? notes : '');
      if (completed && !isAddingNote) {
        setIsAddingNote(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    setIsAddingNote(true);
    if (!habit.today_completed) {
      handleCheckin(true);
    }
  };

  const handleSaveNote = () => {
    if (habit.today_completed) {
      handleCheckin(true);
    }
    setIsAddingNote(false);
  };

  const handleCancelNote = () => {
    setIsAddingNote(false);
    setNotes(habit.today_notes || '');
  };

  const getCheckinButtonText = () => {
    if (isLoading) return 'Updating...';
    return habit.today_completed ? 'Completed' : 'Mark Done';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 group">
      {/* Header with color accent */}
      <div
        className="h-2 group-hover:h-3 transition-all duration-200"
        style={{ backgroundColor: habit.color }}
      ></div>

      <div className="p-6">
        {/* Habit Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              {habit.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {habit.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">
                  {getFrequencyLabel(habit.frequency)}
                </span>
                {habit.stats?.streak && habit.stats.streak > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStreakColor(habit.stats.streak)}`}>
                    🔥 {habit.stats.streak} day{habit.stats.streak !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
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
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className={`text-lg font-bold ${getCompletionRateColor(habit.stats.completion_rate)}`}>
                {habit.stats.completion_rate}%
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                Rate
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-lg font-bold text-blue-600">
                {habit.stats.completed_days}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                Done
              </div>
            </div>
            <div
              className="bg-gray-50 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onViewProgress(habit)}
              title="View progress details"
            >
              <div className="text-lg font-bold text-purple-600">
                {habit.stats.total_days}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                Total
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {(isAddingNote || (habit.today_completed && notes)) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Today's Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              placeholder="Add notes about today's completion..."
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancelNote}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Main Check-in Button */}
          <button
            onClick={() => handleCheckin(!habit.today_completed)}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              habit.today_completed
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : habit.today_completed ? (
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
                <span>Mark Done</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <div className="flex space-x-1">
            {!isAddingNote && (
              <button
                onClick={handleAddNote}
                className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                title="Add notes"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onViewProgress(habit)}
              className="p-3 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0"
              title="View progress"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(habit)}
              className="p-3 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
              title="Edit habit"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="Delete habit"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Last Check-in Info */}
        {habit.today_completed && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 font-medium">
                ✅ Completed today
              </span>
              <span className="text-gray-500">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;