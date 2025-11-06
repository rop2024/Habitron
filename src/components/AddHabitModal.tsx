import React, { useState } from 'react';
import { Habit } from '../types/database';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => void;
  editingHabit?: Habit | null;
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const defaultIcons = [
  '🧘', '💪', '📚', '🌱', '💧', '🍎', '🚶', '🎯', '🎨', '🎵',
  '🧠', '❤️', '☀️', '🌙', '⭐', '🏃', '🚭', '💤', '📝', '🎓'
];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingHabit 
}) => {
  const [formData, setFormData] = useState({
    name: editingHabit?.name || '',
    description: editingHabit?.description || '',
    frequency: editingHabit?.frequency || 'daily',
    goal_count: editingHabit?.goal_count || 1,
    color: editingHabit?.color || defaultColors[0],
    icon: editingHabit?.icon || defaultIcons[0],
    is_active: editingHabit?.is_active ?? true
  });

  const [selectedIcon, setSelectedIcon] = useState(editingHabit?.icon || defaultIcons[0]);
  const [selectedColor, setSelectedColor] = useState(editingHabit?.color || defaultColors[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      color: selectedColor,
      icon: selectedIcon
    });

    // Reset form if not editing
    if (!editingHabit) {
      setFormData({
        name: '',
        description: '',
        frequency: 'daily',
        goal_count: 1,
        color: defaultColors[0],
        icon: defaultIcons[0],
        is_active: true
      });
      setSelectedIcon(defaultIcons[0]);
      setSelectedColor(defaultColors[0]);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    if (editingHabit) {
      setFormData({
        name: editingHabit.name,
        description: editingHabit.description || '',
        frequency: editingHabit.frequency,
        goal_count: editingHabit.goal_count,
        color: editingHabit.color,
        icon: editingHabit.icon,
        is_active: editingHabit.is_active
      });
      setSelectedIcon(editingHabit.icon);
      setSelectedColor(editingHabit.color);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingHabit ? 'Edit Habit' : 'Add New Habit'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Icon
              </label>
              <div className="grid grid-cols-10 gap-2">
                {defaultIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      setSelectedIcon(icon);
                      setFormData(prev => ({ ...prev, icon }));
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      selectedIcon === icon 
                        ? 'ring-2 ring-offset-2 ring-blue-500 transform scale-105'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color
              </label>
              <div className="grid grid-cols-10 gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setFormData(prev => ({ ...prev, color }));
                    }}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === color 
                        ? 'ring-2 ring-offset-2 ring-gray-400 transform scale-110'
                        : 'hover:opacity-80'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Morning Meditation"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Describe your habit..."
              />
            </div>

            {/* Frequency and Goal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal_count" className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Count
                </label>
                <input
                  type="number"
                  id="goal_count"
                  min="1"
                  max="10"
                  value={formData.goal_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal_count: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;