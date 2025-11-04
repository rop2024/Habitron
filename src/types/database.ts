export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goal_count: number;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCheckin {
  id: number;
  habit_id: number;
  checkin_date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 1 | 2 | 3;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOperations {
  // Habit operations
  getAllHabits: () => Promise<Habit[]>;
  getHabitById: (id: number) => Promise<Habit | undefined>;
  createHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => Promise<Habit>;
  updateHabit: (id: number, updates: Partial<Habit>) => Promise<Habit>;
  deleteHabit: (id: number) => Promise<void>;
  
  // Habit checkin operations
  getHabitCheckins: (habitId: number, startDate?: string, endDate?: string) => Promise<HabitCheckin[]>;
  addHabitCheckin: (checkin: Omit<HabitCheckin, 'id' | 'created_at'>) => Promise<HabitCheckin>;
  updateHabitCheckin: (id: number, updates: Partial<HabitCheckin>) => Promise<HabitCheckin>;
  getTodaysCheckins: () => Promise<HabitCheckin[]>;
  getHabitStreak: (habitId: number) => Promise<number>;
  
  // Task operations
  getAllTasks: () => Promise<Task[]>;
  getTaskById: (id: number) => Promise<Task | undefined>;
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  
  // User operations
  getUserByUsername: (username: string) => Promise<User | undefined>;
  
  // Settings operations
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
}