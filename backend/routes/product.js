const express = require("express");
const router = express.Router();
const connection = require("../db");


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

// Save product detail from the form
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

// Get product details which was filled in the form
router.get("/getProductDetails", (req, res) => {
  connection.query("SELECT * FROM productdetails", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});





module.exports = router;
