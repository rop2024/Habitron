export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 1 | 2 | 3; // 1: high, 2: medium, 3: low
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