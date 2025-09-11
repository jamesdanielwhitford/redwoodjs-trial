import { query, transaction } from './connection.js';
import bcrypt from 'bcrypt';

// Database methods for users
export const userDb = {
  async create(username, password) {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      'SELECT id, username, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async verifyPassword(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async list(limit = 50, offset = 0) {
    const result = await query(
      'SELECT id, username, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },

  async count() {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }
};

// Database methods for tasks
export const taskDb = {
  async create(taskData) {
    const { title, description, status = 'todo', position = 0, userId } = taskData;
    
    const result = await query(
      `INSERT INTO tasks (title, description, status, position, user_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, title, description, status, position, user_id, created_at, updated_at`,
      [title, description, status, position, userId]
    );
    
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT t.*, u.username 
       FROM tasks t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findAll(options = {}) {
    const { userId, status, limit = 100, offset = 0 } = options;
    
    let queryText = `
      SELECT t.*, u.username 
      FROM tasks t 
      JOIN users u ON t.user_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (userId) {
      conditions.push(`t.user_id = $${paramIndex++}`);
      params.push(userId);
    }
    
    if (status) {
      conditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    queryText += ` ORDER BY t.position ASC, t.created_at DESC`;
    queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  },

  async update(id, updateData, userId = null) {
    const { title, description, status, position } = updateData;
    
    const setClauses = [];
    const params = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    
    if (status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    
    if (position !== undefined) {
      setClauses.push(`position = $${paramIndex++}`);
      params.push(position);
    }
    
    if (setClauses.length === 0) {
      throw new Error('No fields to update');
    }
    
    let queryText = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${paramIndex++}`;
    params.push(id);
    
    // Optional: restrict updates to task owner
    if (userId) {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(userId);
    }
    
    queryText += ` RETURNING id, title, description, status, position, user_id, created_at, updated_at`;
    
    const result = await query(queryText, params);
    return result.rows[0];
  },

  async delete(id, userId = null) {
    let queryText = 'DELETE FROM tasks WHERE id = $1';
    const params = [id];
    
    // Optional: restrict deletion to task owner
    if (userId) {
      queryText += ' AND user_id = $2';
      params.push(userId);
    }
    
    queryText += ' RETURNING *';
    
    const result = await query(queryText, params);
    return result.rows[0];
  },

  async reorderTasks(tasks) {
    // Update positions for multiple tasks in a transaction
    const queries = tasks.map(({ id, position }) => ({
      text: 'UPDATE tasks SET position = $2 WHERE id = $1',
      params: [id, position]
    }));
    
    await transaction(queries);
    return true;
  },

  async getTasksByStatus() {
    const result = await query(`
      SELECT 
        status, 
        COUNT(*) as count,
        json_agg(
          json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'position', t.position,
            'user_id', t.user_id,
            'username', u.username,
            'created_at', t.created_at,
            'updated_at', t.updated_at
          ) ORDER BY t.position ASC, t.created_at DESC
        ) as tasks
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      GROUP BY status
      ORDER BY 
        CASE status 
          WHEN 'todo' THEN 1
          WHEN 'in_progress' THEN 2  
          WHEN 'done' THEN 3
          ELSE 4
        END
    `);
    
    return result.rows;
  },

  async count(options = {}) {
    const { userId, status } = options;
    
    let queryText = 'SELECT COUNT(*) as count FROM tasks';
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(userId);
    }
    
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const result = await query(queryText, params);
    return parseInt(result.rows[0].count);
  }
};