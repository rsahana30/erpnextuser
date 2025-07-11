// ✅ auth.js (Authentication & JWT)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../db");
require("dotenv").config();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role, vendorCode } = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0) return res.status(400).json({ message: "User already exists" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      let insertQuery;
      let queryParams;

      if (role === "Vendor") {
        insertQuery = `
          INSERT INTO users (name, email, password, role, vendorCode)
          VALUES (?, ?, ?, ?, ?)
        `;
        queryParams = [name, email, hashedPassword, role, vendorCode];
      } else {
        insertQuery = `
          INSERT INTO users (name, email, password, role)
          VALUES (?, ?, ?, ?)
        `;
        queryParams = [name, email, hashedPassword, role];
      }

      connection.query(insertQuery, queryParams, (err2) => {
        if (err2) return res.status(500).json({ message: "Error creating user" });
        res.json({ message: "Signup successful" });
      });
    } catch (error) {
      res.status(500).json({ message: "Password encryption failed" });
    }
  });
});


// ✅ Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret_key", // fallback in dev
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
});


router.post("/vendor-login", (req, res) => {
  const { vendorCode, password } = req.body;

  if (!vendorCode || !password) {
    return res.status(400).json({ message: "Vendor code and password are required" });
  }

  connection.query(
    "SELECT * FROM users WHERE vendorCode = ? AND role = 'Vendor'",
    [vendorCode],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(401).json({ message: "Vendor not found" });

      const vendor = results[0];
      const isMatch = await bcrypt.compare(password, vendor.password);

      if (!isMatch) return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: vendor.id, role: vendor.role, vendorCode: vendor.vendorCode },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "1d" }
      );

      res.json({ token, user: vendor });
    }
  );
});

module.exports = router;
