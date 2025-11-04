const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Get the user data directory for storing the database
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'habitron.db');

// Initialize the database
let db;

function initDatabase() {
  if (!db) {
    db = new Database(dbPath);

    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 2,
        due_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// Task operations
function getAllTasks() {
  const database = initDatabase();
  const stmt = database.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
  return stmt.all();
}

function createTask(task) {
  const database = initDatabase();
  const stmt = database.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(task.title, task.description || '', task.status || 'pending', task.priority || 2, task.due_date || null);
  return { id: result.lastInsertRowid, ...task, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

function updateTask(id, updates) {
  const database = initDatabase();
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
    const stmt = database.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`);
    values.push(id);
    stmt.run(...values);
  }

  // Return the updated task
  const selectStmt = database.prepare('SELECT * FROM tasks WHERE id = ?');
  return selectStmt.get(id);
}

function deleteTask(id) {
  const database = initDatabase();
  const stmt = database.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);
  return { id };
}

// Settings operations
function getSetting(key) {
  const database = initDatabase();
  const stmt = database.prepare('SELECT value FROM settings WHERE key = ?');
  const row = stmt.get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  const database = initDatabase();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);
  stmt.run(key, value);
  return { key, value };
}

// Close the database connection
function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getSetting,
  setSetting,
  close
};