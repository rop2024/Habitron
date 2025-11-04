-- Initial database schema for the Electron app

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT DEFAULT 'daily',
    goal_count INTEGER DEFAULT 1,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT '📝',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Habit checkins table
CREATE TABLE IF NOT EXISTS habit_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    checkin_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
    UNIQUE(habit_id, checkin_date)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('app_theme', 'light'),
    ('language', 'en'),
    ('auto_save', 'true');

-- Insert a demo user
INSERT OR IGNORE INTO users (username, email) VALUES 
    ('demo', 'demo@example.com');

-- Insert sample habits
INSERT OR IGNORE INTO habits (name, description, frequency, goal_count, color, icon) VALUES 
    ('Morning Meditation', '10 minutes of mindfulness meditation', 'daily', 1, '#10B981', '🧘'),
    ('Exercise', '30 minutes of physical activity', 'daily', 1, '#EF4444', '💪'),
    ('Read Book', 'Read for at least 20 minutes', 'daily', 1, '#8B5CF6', '📚'),
    ('Water Plants', 'Check and water all plants', 'weekly', 1, '#06B6D4', '🌱');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_date ON habit_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_habit_date ON habit_checkins(habit_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);