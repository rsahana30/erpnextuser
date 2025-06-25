const express = require("express");
const router = express.Router();
const connection = require("../db");

// Save new product (basic)
router.post("/products", (req, res) => {
  const {
    productCode, productType, description, uom, unitPrice,
    productGroup, brand, category, hsnCode, profitCentre, controller,
  } = req.body;

  const insertQuery = `
    INSERT INTO products 
    (productCode, productType, description, uom, unitPrice, productGroup, brand, category, hsnCode, profitCentre, controller)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(insertQuery,
    [productCode, productType, description, uom, unitPrice, productGroup, brand, category, hsnCode, profitCentre, controller],
    (err) => {
      if (err) {
        console.error("❌ Error saving product:", err);
        return res.status(500).json({ message: "Error saving product" });
      }
      res.json({ message: "✅ Product saved successfully" });
    }
  );
});

// Fetch all products
router.get("/products", (req, res) => {
  const query = "SELECT * FROM products";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching products:", err);
      return res.status(500).json({ message: "Error fetching products" });
    }
    res.json(results);
  });
});

// Get configuration values
router.get("/config/:type", (req, res) => {
  const { type } = req.params;
  const sql = "SELECT value FROM configuration WHERE type = ?";
  connection.query(sql, [type], (err, results) => {
    if (err) {
      console.error("❌ Error fetching configuration data:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    const values = results.map((row) => row.value);
    res.json(values);
  });
});

// Get product configuration (filtered fields)
router.get("/productconfig", (req, res) => {
  const query = `
    SELECT productCode, productType, productGroup, brand, category 
    FROM ProductConfig
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("SQL Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Save product detail
router.post("/saveProductDetails", (req, res) => {
  const {
    productCode, productType, productGroup, brand, category,
    description, uom, unitPrice, hsnCode, profitCentre, controller
  } = req.body;

  const sql = `
    INSERT INTO ProductDetails
    (productCode, productType, productGroup, brand, category,
     description, uom, unitPrice, hsnCode, profitCentre, controller)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(sql, [
    productCode, productType, productGroup, brand, category,
    description, uom, unitPrice, hsnCode, profitCentre, controller
  ], (err, result) => {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Saved successfully' });
  });
});

// Get product details
router.get("/getProductDetails", (req, res) => {
  connection.query("SELECT * FROM productdetails", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Fetch HSN codes
router.get("/api/hsncodes", (req, res) => {
  connection.query("SELECT code FROM hsn_codes", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Profit Centres
router.get("/api/profitcentres", (req, res) => {
  connection.query("SELECT name FROM profit_centres", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Controllers
router.get("/api/controllers", (req, res) => {
  connection.query("SELECT name FROM controllers", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Currencies
router.get("/api/currencies", (req, res) => {
  connection.query("SELECT code FROM currencies", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});


module.exports = router;
