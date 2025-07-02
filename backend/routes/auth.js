// ✅ auth.js (Authentication & JWT)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../db");
require("dotenv").config();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, selectedModule, role } = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (result.length > 0) return res.status(400).json({ message: "User already exists" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertUser = "INSERT INTO users (name, email, password, selected_module, role) VALUES (?, ?, ?, ?, ?)";
      connection.query(insertUser, [name, email, hashedPassword, selectedModule, role], (err) => {
        if (err) return res.status(500).json({ message: "Error creating user" });
        res.json({ message: "Signup successful" });
      });
    } catch (err) {
      res.status(500).json({ message: "Password hashing failed" });
    }
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        selectedModule: user.selected_module,
        role: user.role,
      },
    });
  });
});

module.exports = router;
