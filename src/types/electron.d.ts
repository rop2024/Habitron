import { Habit, HabitCheckin } from './database';

export interface HabitsAPI {
  getAll: () => Promise<Habit[]>;
  getWithTodayStatus: () => Promise<(Habit & { today_completed: boolean; today_checkin_id?: number; stats: any })[]>;
  getById: (id: number) => Promise<Habit | undefined>;
  create: (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => Promise<Habit>;
  update: (id: number, updates: Partial<Habit>) => Promise<Habit>;
  delete: (id: number) => Promise<void>;
  checkin: (checkinData: Omit<HabitCheckin, 'id' | 'created_at'>) => Promise<HabitCheckin>;
  getCheckins: (habitId: number, startDate?: string, endDate?: string) => Promise<HabitCheckin[]>;
  getTodaysCheckins: () => Promise<HabitCheckin[]>;
  getStats: (habitId: number, days?: number) => Promise<any>;
  getStreak: (habitId: number) => Promise<number>;
}

export interface DatabaseAPI {
  getAllTasks: () => Promise<any[]>;
  createTask: (task: any) => Promise<any>;
  updateTask: (id: number, updates: any) => Promise<any>;
  deleteTask: (id: number) => Promise<void>;
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
}

export interface ElectronAPI {
  habits: HabitsAPI;
  database: DatabaseAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}