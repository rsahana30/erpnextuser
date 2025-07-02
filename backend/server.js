const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const protectedRoutes = require("./routes/protectedRoutes"); // ✅ Make sure this file exists and is exported properly

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);         // e.g., /api/login
app.use("/api", productRoutes);      // e.g., /api/products
app.use("/api", protectedRoutes);    // e.g., /api/admin-data

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
