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



// GET all locations
router.get("/getlocation", (req, res) => {
  const sql = "SELECT * FROM location";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching locations:", err);
      return res.status(500).json({ error: "Failed to fetch locations" });
    }
    res.json(results);
  });
});

// POST save new location
router.post("/saveLocation", (req, res) => {
  const {
    locationCode,
    locationName,
    plantType,
    address,
    state,
    pinCode,
    country,
    gstcode,
  } = req.body;

  const sql = `
    INSERT INTO location
    (locationCode, locationName, plantType, address, state, pinCode, country, gstcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [locationCode, locationName, plantType, address, state, pinCode, country, gstcode],
    (err, result) => {
      if (err) {
        console.error("Error inserting location:", err);
        return res.status(500).json({ error: "Failed to save location" });
      }
      res.status(201).json({ message: "Location saved successfully" });
    }
  );
});




// GET all vendors
router.get("/getvendor", (req, res) => {
  connection.query("SELECT * FROM vendor", (err, results) => {
    if (err) {
      console.error("Error fetching vendors:", err);
      return res.status(500).json({ error: "Failed to fetch vendors" });
    }
    res.json(results);
  });
});

// SAVE new vendor
router.post("/savevendor", (req, res) => {
  const {
    vendorCode,
    vendorName,
    vendorType,
    address,
    country,
    state,
    gstcode,
  } = req.body;

  const sql = `
    INSERT INTO vendor
    (vendorCode, vendorName, vendorType, address, country, state, gstcode)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [vendorCode, vendorName, vendorType, address, country, state, gstcode],
    (err, result) => {
      if (err) {
        console.error("Error inserting vendor:", err);
        return res.status(500).json({ error: "Failed to save vendor" });
      }
      res.status(201).json({ message: "Vendor saved successfully" });
    }
  );
});


// POST /api/savePurchase
router.post("/savePurchase", (req, res) => {
  const { referenceId, selectedProducts, vendors, locations, total } = req.body;

  const purchaseQuery = `
    INSERT INTO purchases (referenceId, productCode, description, uom, unitPrice, quantity, total, vendors, locations, grandTotal)
    VALUES ?
  `;

  const values = selectedProducts.map(p => [
    referenceId,
    p.productCode,
    p.description,
    p.uom,
    p.unitPrice,
    p.quantity,
    p.total,
    vendors.map(v => v.vendorName).join(", "),
    locations.map(l => l.locationName).join(", "),
    total
  ]);

  connection.query(purchaseQuery, [values], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Purchase saved successfully" });
  });
});


// GET /api/getPurchases
router.get("/getPurchases", (req, res) => {
  connection.query("SELECT * FROM purchases ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});








module.exports = router;
