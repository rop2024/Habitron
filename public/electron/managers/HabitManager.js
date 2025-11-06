const database = require('../db/database');

class HabitManager {
  constructor() {
    // We'll use the database functions directly instead of the db instance
  }

  // Helper function to run database queries
  _runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      database.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  _getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      database.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  _allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      database.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Habit CRUD Operations
  getAllHabits() {
    return this._allQuery(`
      SELECT * FROM habits
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);
  }

  getHabitById(id) {
    return this._getQuery('SELECT * FROM habits WHERE id = ?', [id]);
  }

  addHabit(habitData) {
    return new Promise((resolve, reject) => {
      const {
        name,
        description = '',
        frequency = 'daily',
        goal_count = 1,
        color = '#3B82F6',
        icon = '📝',
        is_active = true
      } = habitData;

      if (!name || name.trim() === '') {
        reject(new Error('Habit name is required'));
        return;
      }

      this._runQuery(`
        INSERT INTO habits (name, description, frequency, goal_count, color, icon, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [name.trim(), description, frequency, goal_count, color, icon, is_active])
        .then(result => {
          // Get the created habit
          return this._getQuery('SELECT * FROM habits WHERE id = ?', [result.lastID]);
        })
        .then(habit => resolve(habit))
        .catch(reject);
    });
  }

  updateHabit(id, updates) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['name', 'description', 'frequency', 'goal_count', 'color', 'icon', 'is_active'];
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

      this._runQuery(
        `UPDATE habits SET ${setClause.join(', ')} WHERE id = ?`,
        values
      )
        .then(() => {
          // Return the updated habit
          return this._getQuery('SELECT * FROM habits WHERE id = ?', [id]);
        })
        .then(habit => resolve(habit))
        .catch(reject);
    });
  }

  deleteHabit(id) {
    return this._runQuery('UPDATE habits SET is_active = FALSE WHERE id = ?', [id]);
  }

  // Habit Checkin Operations
  getHabitCheckins(habitId, startDate = null, endDate = null) {
    let sql = `
      SELECT hc.*, h.name as habit_name
      FROM habit_checkins hc
      JOIN habits h ON hc.habit_id = h.id
      WHERE hc.habit_id = ?
    `;
    const params = [habitId];

    if (startDate) {
      sql += ' AND hc.checkin_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND hc.checkin_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY hc.checkin_date DESC';

    return this._allQuery(sql, params);
  }

  addHabitCheckin(checkinData) {
    return new Promise((resolve, reject) => {
      const {
        habit_id,
        checkin_date = new Date().toISOString().split('T')[0],
        completed = false,
        notes = ''
      } = checkinData;

      if (!habit_id) {
        reject(new Error('Habit ID is required'));
        return;
      }

      // Check if checkin already exists for this date
      this._getQuery(
        'SELECT * FROM habit_checkins WHERE habit_id = ? AND checkin_date = ?',
        [habit_id, checkin_date]
      )
        .then(existingCheckin => {
          if (existingCheckin) {
            // Update existing checkin
            return this._runQuery(`
              UPDATE habit_checkins
              SET completed = ?, notes = ?, created_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, [completed, notes, existingCheckin.id])
              .then(() => this._getQuery('SELECT * FROM habit_checkins WHERE id = ?', [existingCheckin.id]));
          } else {
            // Create new checkin
            return this._runQuery(`
              INSERT INTO habit_checkins (habit_id, checkin_date, completed, notes)
              VALUES (?, ?, ?, ?)
            `, [habit_id, checkin_date, completed, notes])
              .then(result => this._getQuery('SELECT * FROM habit_checkins WHERE id = ?', [result.lastID]));
          }
        })
        .then(checkin => resolve(checkin))
        .catch(reject);
    });
  }

  updateHabitCheckin(id, updates) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['completed', 'notes'];
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

      values.push(id);

      this._runQuery(
        `UPDATE habit_checkins SET ${setClause.join(', ')} WHERE id = ?`,
        values
      )
        .then(() => {
          // Return the updated checkin
          return this._getQuery('SELECT * FROM habit_checkins WHERE id = ?', [id]);
        })
        .then(checkin => resolve(checkin))
        .catch(reject);
    });
  }

  getTodaysCheckins() {
    const today = new Date().toISOString().split('T')[0];

    return this._allQuery(`
      SELECT hc.*, h.name as habit_name, h.color, h.icon
      FROM habit_checkins hc
      JOIN habits h ON hc.habit_id = h.id
      WHERE hc.checkin_date = ?
      ORDER BY h.created_at
    `, [today]);
  }

  getHabitStreak(habitId) {
    try {
      // More accurate streak calculation that considers consecutive days
      return this._getQuery(`
        WITH dates AS (
          SELECT date('now', '-' || (seq - 1) || ' days') as checkin_date
          FROM (SELECT ROW_NUMBER() OVER () as seq FROM habit_checkins LIMIT 365)
        ),
        checkins AS (
          SELECT d.checkin_date,
                 CASE WHEN hc.completed = 1 THEN 1 ELSE 0 END as completed
          FROM dates d
          LEFT JOIN habit_checkins hc ON d.checkin_date = hc.checkin_date AND hc.habit_id = ?
          ORDER BY d.checkin_date DESC
        ),
        streaks AS (
          SELECT checkin_date, completed,
                 (SELECT COUNT(*)
                  FROM checkins c2
                  WHERE c2.checkin_date >= c1.checkin_date
                  AND c2.completed = 0) as gap_group
          FROM checkins c1
        )
        SELECT COUNT(*) as streak
        FROM streaks
        WHERE completed = 1 AND gap_group = 0
        ORDER BY checkin_date DESC
        LIMIT 1
      `, [habitId])
        .then(result => result ? result.streak : 0)
        .catch(error => {
          console.error('Error calculating habit streak:', error);
          return 0;
        });
    } catch (error) {
      console.error('Error calculating habit streak:', error);
      return 0;
    }
  }

  getHabitStats(habitId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    return Promise.all([
      this._getQuery(`
        SELECT
          COUNT(*) as total_days,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_days,
          ROUND(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as completion_rate
        FROM habit_checkins
        WHERE habit_id = ? AND checkin_date >= ?
      `, [habitId, startDateStr]),
      this.getHabitStreak(habitId),
      this.getHabitById(habitId)
    ])
      .then(([stats, streak, habit]) => ({
        ...stats,
        streak: streak,
        goal_count: (habit || {}).goal_count || 1
      }));
  }

  // Get habits with their today's checkin status
  getHabitsWithTodayStatus() {
    const today = new Date().toISOString().split('T')[0];

    return this._allQuery(`
      SELECT h.*,
             hc.completed as today_completed,
             hc.id as today_checkin_id,
             hc.notes as today_notes
      FROM habits h
      LEFT JOIN habit_checkins hc ON h.id = hc.habit_id AND hc.checkin_date = ?
      WHERE h.is_active = TRUE
      ORDER BY h.created_at DESC
    `, [today])
      .then(habits => {
        // Add stats to each habit
        return Promise.all(habits.map(habit =>
          this.getHabitStats(habit.id).then(stats => ({
            ...habit,
            stats: stats
          }))
        ));
      });
  }
}

module.exports = new HabitManager();