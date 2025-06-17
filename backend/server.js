const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (result.length > 0)
      return res.status(400).json({ message: "User already exists" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUser = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      connection.query(insertUser, [name, email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: "Error creating user" });
        res.json({ message: "Signup successful" });
      });
    } catch (err) {
      res.status(500).json({ message: "Password hashing failed" });
    }
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
