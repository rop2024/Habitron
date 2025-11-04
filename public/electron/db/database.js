const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const dbFolder = path.join(app.getPath("userData"), "Consist");
const dbPath = path.join(dbFolder, "consist.db");

console.log("User data path:", app.getPath("userData"));
console.log("Database folder path:", dbFolder);
console.log("Database file path:", dbPath);

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
  console.log("Created Consist folder.");
}

const db = new sqlite3.Database(dbPath);
console.log("Database initialized successfully.");

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority INTEGER DEFAULT 2,
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Habit tables
  db.run(`
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
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS habit_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      checkin_date DATE NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habit_id, checkin_date)
    )
  `);
});

// Task operations
function getAllTasks() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function createTask(task) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO tasks (title, description, status, priority, due_date)
      VALUES (?, ?, ?, ?, ?)
    `, [task.title, task.description || '', task.status || 'pending', task.priority || 2, task.due_date || null], function(err) {
      if (err) reject(err);
      else {
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  });
}

function updateTask(id, updates) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.due_date);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      db.run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else {
          db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      });
    } else {
      reject(new Error('No fields to update'));
    }
  });
}

function deleteTask(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ id, changes: this.changes });
    });
  });
}

// Settings operations
function getSetting(key) {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.value : null);
    });
  });
}

function setSetting(key, value) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [key, value], function(err) {
      if (err) reject(err);
      else resolve({ key, value });
    });
  });
}

// Close the database connection
function close() {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    else console.log('Database connection closed');
  });
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getSetting,
  setSetting,
  close,
  db // Export the database instance for HabitManager
};