const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      // Determine database path
      const userDataPath = app.getPath('userData');
      const dbFolder = path.join(userDataPath, 'Consist');
      const dbPath = path.join(dbFolder, 'consist.db');

      console.log('User data path:', userDataPath);
      console.log('Database folder path:', dbFolder);
      console.log('Database file path:', dbPath);
      
      // Ensure database directory exists
      if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder, { recursive: true });
        console.log('Created Consist folder.');
      }
      
      // Initialize database connection
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          throw err;
        }
        console.log('Database initialized successfully.');
        this.createSchema();
      });
      
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  createSchema() {
    this.db.serialize(() => {
      this.db.run(`
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
      `, (err) => {
        if (err) {
          console.error('Error creating tasks table:', err);
        } else {
          this.db.run(`
            CREATE TABLE IF NOT EXISTS settings (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              key TEXT UNIQUE NOT NULL,
              value TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              console.error('Error creating settings table:', err);
            } else {
              console.log('Database schema created successfully');
            }
          });
        }
      });
    });
  }

  // Task operations
  getAllTasks() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM tasks 
        ORDER BY 
          CASE priority 
            WHEN 1 THEN 1 
            WHEN 2 THEN 2 
            WHEN 3 THEN 3 
            ELSE 4 
          END,
          due_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  createTask(task) {
    return new Promise((resolve, reject) => {
      const { title, description, status = 'pending', priority = 2, due_date = null } = task;
      
      this.db.run(`
        INSERT INTO tasks (title, description, status, priority, due_date) 
        VALUES (?, ?, ?, ?, ?)
      `, [title, description, status, priority, due_date], function(err) {
        if (err) reject(err);
        else {
          this.db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      }.bind(this));
    });
  }

  updateTask(id, updates) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['title', 'description', 'status', 'priority', 'due_date'];
      const setClause = [];
      const values = [];
      
      allowedFields.forEach(field => {
        if (updates.hasOwnProperty(field)) {
          setClause.push(`${field} = ?`);
          values.push(updates[field]);
        }
      });
      
      if (setClause.length === 0) {
        reject(new Error('No valid fields to update'));
        return;
      }
      
      setClause.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      this.db.run(
        `UPDATE tasks SET ${setClause.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          else {
            this.getTaskById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  deleteTask(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ id, changes: this.changes });
      });
    });
  }

  getTaskById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Settings operations
  getSetting(key) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.value : null);
      });
    });
  }

  setSetting(key, value) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT OR REPLACE INTO settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [key, value], function(err) {
        if (err) reject(err);
        else resolve({ key, value });
      });
    });
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) console.error('Error closing database:', err);
        else console.log('Database connection closed');
      });
    }
  }
}

// Create and export a singleton instance
module.exports = new DatabaseManager();