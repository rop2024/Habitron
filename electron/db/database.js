const Database = require('better-sqlite3');
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
      const dbDir = path.join(userDataPath, 'database');
      
      // Ensure database directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const dbPath = path.join(dbDir, 'app.db');
      
      // Initialize database connection
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      
      console.log('Database connected at:', dbPath);
      
      // Create schema
      this.createSchema();
      
      // Insert default data
      this.insertDefaultData();
      
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  createSchema() {
    try {
      // Read and execute schema SQL
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
      
      this.db.exec('BEGIN TRANSACTION');
      statements.forEach(statement => {
        if (statement.trim()) {
          this.db.prepare(statement).run();
        }
      });
      this.db.exec('COMMIT');
      
      console.log('Database schema created successfully');
    } catch (error) {
      this.db.exec('ROLLBACK');
      console.error('Schema creation error:', error);
      throw error;
    }
  }

  insertDefaultData() {
    try {
      // Check if we already have default data
      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
      if (userCount.count === 0) {
        // Default data is already in schema.sql, but we can add more here if needed
        console.log('Default data inserted');
      }
    } catch (error) {
      console.error('Default data insertion error:', error);
    }
  }

  // Generic query methods
  get(sql, params = []) {
    try {
      return this.db.prepare(sql).get(...params);
    } catch (error) {
      console.error('Query error (get):', error);
      throw error;
    }
  }

  all(sql, params = []) {
    try {
      return this.db.prepare(sql).all(...params);
    } catch (error) {
      console.error('Query error (all):', error);
      throw error;
    }
  }

  run(sql, params = []) {
    try {
      return this.db.prepare(sql).run(...params);
    } catch (error) {
      console.error('Query error (run):', error);
      throw error;
    }
  }

  // Specific business logic methods
  getAllTasks() {
    return this.all(`
      SELECT * FROM tasks 
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
          ELSE 4 
        END,
        due_date ASC
    `);
  }

  createTask(task) {
    const { title, description, status = 'pending', priority = 1, due_date = null } = task;
    
    const result = this.run(`
      INSERT INTO tasks (title, description, status, priority, due_date) 
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, status, priority, due_date]);
    
    return this.getTaskById(result.lastInsertRowid);
  }

  getTaskById(id) {
    return this.get('SELECT * FROM tasks WHERE id = ?', [id]);
  }

  updateTask(id, updates) {
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
      throw new Error('No valid fields to update');
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    this.run(
      `UPDATE tasks SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.getTaskById(id);
  }

  deleteTask(id) {
    return this.run('DELETE FROM tasks WHERE id = ?', [id]);
  }

  // User management methods
  getUserByUsername(username) {
    return this.get('SELECT * FROM users WHERE username = ?', [username]);
  }

  // Settings management
  getSetting(key) {
    const result = this.get('SELECT value FROM settings WHERE key = ?', [key]);
    return result ? result.value : null;
  }

  setSetting(key, value) {
    this.run(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [key, value]);
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
  }
}

// Create and export a singleton instance
module.exports = new DatabaseManager();