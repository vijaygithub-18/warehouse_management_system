const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logActivity } = require("../utils/activityLogger");

const JWT_SECRET = "your-secret-key-change-in-production";

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }
    if (!role || !["admin", "staff", "manager"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Valid role is required (admin/staff/manager)" });
    }

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email],
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, created_at`,
      [username, email, hashedPassword, role],
    );

    res.json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ error: "Password is required" });
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Update last_login
    await pool.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    // Log activity
    await logActivity(
      user.id,
      user.username,
      "LOGIN",
      "AUTH",
      user.id,
      `User logged in successfully`,
      null,
    );

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const userRes = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email],
    );

    if (userRes.rows.length === 0) {
      // respond generically to avoid email enumeration
      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const user = userRes.rows[0];
    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [token, expires, user.id],
    );

    // send email link
    const settingsRes = await pool.query(
      "SELECT * FROM email_settings LIMIT 1",
    );
    const settings = settingsRes.rows[0];
    
    if (!settings || !settings.enabled) {
      return res.status(500).json({ 
        error: "Email service not configured. Please contact administrator." 
      });
    }
    
    try {
      const EmailService = require("../utils/emailService");
      const emailService = new EmailService(settings);
      const resetLink = `http://localhost:5173/reset-password?token=${token}`;
      const html = `<p>Click <a href=\"${resetLink}\">here</a> to reset your password. Link expires in 1 hour.</p>`;
      await emailService.sendEmail(
        user.email,
        "Password Reset - Warehouse WMS",
        html,
      );
      res.json({ message: "Password reset link has been sent to your email" });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return res.status(500).json({ 
        error: "Failed to send reset email. Please try again later." 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Token and password (min 6 chars) are required" });
    }

    const userRes = await pool.query(
      "SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [token],
    );
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = userRes.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [hashedPassword, user.id],
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error resetting password" });
  }
});

// Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user" });
  }
});

module.exports = { router, verifyToken };
