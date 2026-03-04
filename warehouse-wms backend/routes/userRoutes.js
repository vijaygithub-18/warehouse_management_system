const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("./authRoutes");

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

// Get all users (Admin only)
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, phone, department, location, created_at, last_login FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Get current user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, phone, department, location, created_at, last_login FROM users WHERE id = $1",
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// Update current user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { username, email, phone, department, location } = req.body;

    // Validation
    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, phone = $3, department = $4, location = $5 
       WHERE id = $6 
       RETURNING id, username, email, role, phone, department, location, created_at, last_login`,
      [username, email, phone, department, location, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating profile" });
  }
});

// Change password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    // Get current password
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify old password
    const validPassword = await bcrypt.compare(oldPassword, userResult.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error changing password" });
  }
});

// Add user (Admin only)
router.post("/add", verifyToken, isAdmin, async (req, res) => {
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
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (!role || !["admin", "staff", "manager"].includes(role)) {
      return res.status(400).json({ error: "Valid role is required" });
    }

    // Check if exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, phone, department, location, created_at`,
      [username, email, hashedPassword, role]
    );

    res.json({
      message: "User added successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding user" });
  }
});

// Update user (Admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (!role || !["admin", "staff", "manager"].includes(role)) {
      return res.status(400).json({ error: "Valid role is required" });
    }

    let query, params;

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET username = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, username, email, role, phone, department, location, created_at, last_login`;
      params = [username, email, hashedPassword, role, id];
    } else {
      query = `UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role, phone, department, location, created_at, last_login`;
      params = [username, email, role, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
});

// Delete user (Admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

// Admin reset user password
router.post("/:id/reset-password", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const crypto = require("crypto");
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, id]
    );

    res.json({ 
      message: "Password reset successfully",
      tempPassword: tempPassword,
      note: "User must change password on next login"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error resetting password" });
  }
});

module.exports = router;
