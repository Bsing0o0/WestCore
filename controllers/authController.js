/**
 * Authentication Controller
 * Handles login, logout, and session management
 */

const bcrypt = require('bcrypt');
const db = require('../config/database');

/**
 * Login handler
 * Validates credentials and creates session
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find user in database
    const sql = 'SELECT id, username, password_hash, role, is_active FROM users WHERE username = ? LIMIT 1';
    const users = await db.query(sql, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Update last login timestamp
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.isAuthenticated = true;
    
    // Save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: 'Login failed'
        });
      }
      
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          username: user.username,
          role: user.role
        }
      });
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
}

/**
 * Logout handler
 * Destroys session and clears cookies
 */
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
}

/**
 * Check authentication status
 * Returns current user info if authenticated
 */
function checkAuth(req, res) {
  if (req.session && req.session.isAuthenticated) {
    res.json({
      success: true,
      isAuthenticated: true,
      user: {
        username: req.session.username,
        role: req.session.role
      }
    });
  } else {
    res.json({
      success: true,
      isAuthenticated: false
    });
  }
}

/**
 * Change password
 * Allows authenticated users to update their password
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }
    
    // Get current password hash
    const sql = 'SELECT password_hash FROM users WHERE id = ?';
    const users = await db.query(sql, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password'
    });
  }
}

module.exports = {
  login,
  logout,
  checkAuth,
  changePassword
};