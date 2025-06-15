const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");

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
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  const checkUser = "SELECT * FROM users WHERE email = ?";
  connection.query(checkUser, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (result.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const insertUser = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    connection.query(insertUser, [name, email, password], (err) => {
      if (err) return res.status(500).json({ message: "Error creating user" });
      res.json({ message: "Signup successful" });
    });
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  connection.query(query, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (result.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = result[0];
    res.json({ message: "Login successful", user });
  });
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
