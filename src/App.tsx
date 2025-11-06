import React, { useEffect, useState } from 'react';
import { Habit } from './types/database';
import HabitCard from './components/HabitCard';
import AddHabitModal from './components/AddHabitModal';
import StatsOverview from './components/StatsOverview';
import ProgressModal from './components/ProgressModal';

interface AppHabit extends Habit {
  today_completed?: boolean;
  today_checkin_id?: number;
  today_notes?: string;
  stats?: any;
}

const App: React.FC = () => {
  const [habits, setHabits] = useState<AppHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const habitsData = await window.electronAPI.habits.getWithTodayStatus();
        setHabits(habitsData);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (window.electronAPI) {
        if (editingHabit) {
          await window.electronAPI.habits.update(editingHabit.id, habitData);
        } else {
          await window.electronAPI.habits.create(habitData);
        }
        await loadHabits();
        setIsAddModalOpen(false);
        setEditingHabit(null);
      }
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const handleCheckin = async (habitId: number, completed: boolean, notes?: string) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.habits.checkin({
          habit_id: habitId,
          completed,
          notes: notes || '',
          checkin_date: new Date().toISOString().split('T')[0]
        });
        await loadHabits();
      }
    } catch (error) {
      console.error('Error updating checkin:', error);
      throw error; // Re-throw to handle in component
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (window.confirm('Are you sure you want to delete this habit? This will also remove all check-in history.')) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.habits.delete(habitId);
          await loadHabits();
        }
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const handleViewProgress = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsProgressModalOpen(true);
  };

  const openAddHabitModal = () => {
    setEditingHabit(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingHabit(null);
  };

  const closeProgressModal = () => {
    setIsProgressModalOpen(false);
    setSelectedHabit(null);
  };

  // Calculate today's completion rate
  const completedToday = habits.filter(h => h.today_completed).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Habit Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build better habits one day at a time. {completedToday > 0 && 
              <span className="font-semibold text-green-600">
                Great job! You've completed {completedToday} habit{completedToday !== 1 ? 's' : ''} today.
              </span>
            }
          </p>
          
          {/* Today's Progress Bar */}
          {habits.length > 0 && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Today's Progress</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <StatsOverview habits={habits} />

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Your Habits
            </h2>
            <p className="text-gray-600">
              {habits.length} habit{habits.length !== 1 ? 's' : ''} • {completedToday} completed today
            </p>
          </div>
          <button
            onClick={openAddHabitModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Habit</span>
          </button>
        </div>

        {/* Habits Grid */}
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onCheckin={handleCheckin}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
                onViewProgress={handleViewProgress}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No habits yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start building your routine by adding your first habit. Track your progress and build streaks!
            </p>
            <button
              onClick={openAddHabitModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Your First Habit</span>
            </button>
          </div>
        )}

        {/* Add/Edit Habit Modal */}
        <AddHabitModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onSave={handleCreateHabit}
          editingHabit={editingHabit}
        />

        {/* Progress Modal */}
        <ProgressModal
          isOpen={isProgressModalOpen}
          onClose={closeProgressModal}
          habit={selectedHabit}
        />
      </div>
    </div>
  );
};

export default App;
