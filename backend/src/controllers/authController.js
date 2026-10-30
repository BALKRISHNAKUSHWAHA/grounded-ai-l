import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { JWT_SECRET } from '../config/env.js';

/**
 * Helper to determine password column name in users table.
 */
async function getPasswordColumnName() {
  try {
    const res = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('password', 'password_hash')
    `);
    const cols = res.rows.map((r) => r.column_name);
    if (cols.includes('password_hash') && !cols.includes('password')) {
      return 'password_hash';
    }
  } catch (err) {
    console.warn('Could not inspect users column, defaulting to password:', err.message);
  }
  return 'password';
}

/**
 * Register a new user.
 */
export async function register(req, res) {
  try {
    const { email, password, full_name } = req.validatedBody;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const pwdColumn = await getPasswordColumnName();

    // Insert user
    const result = await query(
      `INSERT INTO users (email, ${pwdColumn}, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at, updated_at`,
      [email, hashedPassword, full_name]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      error: `Registration failed: ${err.message || 'Database error occurred.'}`,
    });
  }
}

/**
 * Login an existing user.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.validatedBody;
    const pwdColumn = await getPasswordColumnName();

    // Find user by email
    const result = await query(
      `SELECT id, email, ${pwdColumn} AS password, full_name, created_at, updated_at FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      error: `Login failed: ${err.message || 'Internal server error.'}`,
    });
  }
}

/**
 * Get current user profile.
 */
export async function getProfile(req, res) {
  try {
    const result = await query(
      'SELECT id, email, full_name, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error('GetProfile error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
