
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const connection = require("../db");

// Storage setup for uploaded documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});

const upload = multer({ storage });






/////////////////////////////////////////////////////////////////////////
//this is from product config - fetching details from backend for type,group, brand, category
router.get("/product_types", (req, res) => {
  const sql = "SELECT * FROM product_types";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching product types:", err);
      return res.status(500).json({ error: "Failed to fetch product types" });
    }
    res.json(results);
  });
});

router.get("/product_groups", (req, res) => {
  const sql = "SELECT * FROM product_groups";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching product groups:", err);
      return res.status(500).json({ error: "Failed to fetch product groups" });
    }
    res.json(results);
  });
});

router.get("/brands", (req, res) => {
  const sql = "SELECT * FROM brands";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching brands:", err);
      return res.status(500).json({ error: "Failed to fetch brands" });
    }
    res.json(results);
  });
});

router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching category:", err);
      return res.status(500).json({ error: "Failed to fetch category" });
    }
    res.json(results);
  });
});




//post and get product details from the form 
router.post("/saveProductDetails", (req, res) => {
  const {
    productCode, description, uom, weight, weightUnit, unitPrice,
    valuationClass, profitCentre, hsnCode, currency, controller,
    productType, productGroup, brand, category
  } = req.body;

  const query = `
    INSERT INTO ProductDetails (
      productCode, description, uom, weight, weightUnit, unitPrice,
      valuationClass, profitCentre, hsnCode, currency, controller,
      productType, productGroup, brand, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    productCode, description, uom, weight, weightUnit, unitPrice,
    valuationClass, profitCentre, hsnCode, currency, controller,
    productType, productGroup, brand, category
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error saving product:", err.message);
      return res.status(500).json({ error: "Failed to save product" });
    }
    res.status(200).json({ message: "Product saved successfully" });
  });
});


router.get("/products", (req, res) => {
  connection.query("SELECT * FROM ProductDetails", (err, results) => {
    if (err) {
      console.error("Error fetching products:", err.message);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.json(results);
  });
});

router.put("/updateProduct/:productCode", (req, res) => {
  const { productCode } = req.params;
  const {
    description, uom, weight, weightUnit, unitPrice,
    valuationClass, profitCentre, hsnCode, currency, controller,
    productType, productGroup, brand, category
  } = req.body;

  const sql = `
    UPDATE ProductDetails SET
      description = ?, uom = ?, weight = ?, weightUnit = ?, unitPrice = ?,
      valuationClass = ?, profitCentre = ?, hsnCode = ?, currency = ?, controller = ?,
      productType = ?, productGroup = ?, brand = ?, category = ?
    WHERE productCode = ?
  `;

  connection.query(sql, [
    description, uom, weight, weightUnit, unitPrice,
    valuationClass, profitCentre, hsnCode, currency, controller,
    productType, productGroup, brand, category, productCode
  ], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).send("Failed to update product");
    }
    res.status(200).send("Product updated successfully");
  });
});

///////////////////////////////////////////////////////////////////////////////








//vendor master 
router.get("/vendors", (req, res) => {
  const sql = "SELECT * FROM vendors";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).send("DB error");
    res.json(results);
  });
});

// Create new vendor
router.post("/vendors", (req, res) => {
  const {
    supplierNumber,
    supplierName,
    country,
    address,
    postalCode,
    email,
    reconAccount,
  } = req.body;

  const sql = `
    INSERT INTO vendors 
    (supplierNumber, supplierName, country, address, postalCode, email, reconAccount)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    supplierNumber,
    supplierName,
    country,
    address,
    postalCode,
    email,
    reconAccount,
  ];

  connection.query(sql, values, (err) => {
    if (err) return res.status(500).send("Insert failed");
    res.sendStatus(200);
  });
});

// Update vendor
router.put("/vendors/:id", (req, res) => {
  const {
    supplierNumber,
    supplierName,
    country,
    address,
    postalCode,
    email,
    reconAccount,
  } = req.body;

  const sql = `
    UPDATE vendors SET 
    supplierNumber = ?, supplierName = ?, country = ?, address = ?, 
    postalCode = ?, email = ?, reconAccount = ?
    WHERE id = ?`;

  const values = [
    supplierNumber,
    supplierName,
    country,
    address,
    postalCode,
    email,
    reconAccount,
    req.params.id,
  ];

  connection.query(sql, values, (err) => {
    if (err) return res.status(500).send("Update failed");
    res.sendStatus(200);
  });
});

// Get countries
router.get("/countries", (req, res) => {
  connection.query("SELECT * FROM countries", (err, results) => {
    if (err) return res.status(500).send("Failed to load countries");
    res.json(results);
  });
});

// Get recon accounts
router.get("/reconAccounts", (req, res) => {
  connection.query("SELECT * FROM recon_accounts", (err, results) => {
    if (err) return res.status(500).send("Failed to load recon accounts");
    res.json(results);
  });
});


////////////////////////////////////////////////////////////////////////






































///////////////////////////////////////////////////////////////////////
//rfq (request for quotation)
router.post("/rfq", upload.single("document"), (req, res) => {
  const { quotationDeadline, deliveryDate } = req.body;

  let products = [];
  let vendors = [];
  try {
    products = JSON.parse(req.body.products || "[]");
    vendors = JSON.parse(req.body.vendors || "[]");
  } catch (err) {
    return res.status(400).send("Invalid product/vendor data");
  }

  if (!quotationDeadline || !deliveryDate || products.length === 0 || vendors.length === 0) {
    return res.status(400).send("Missing required fields");
  }

  const documentPath = req.file ? req.file.filename : null;

  const today = new Date();
  const getPrefix = `RFQ${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  const countQuery = `SELECT COUNT(*) as count FROM rfq_master WHERE rfqNumber LIKE '${getPrefix}%'`;

  connection.query(countQuery, (err, result) => {
    if (err) {
      console.error("Count query error:", err);
      return res.status(500).send("Internal Server Error");
    }

    const count = result[0].count + 1;
    const serial = String(count).padStart(4, '0');
    const rfqNumber = `${getPrefix}${serial}`;

    const insertQuery = `
      INSERT INTO rfq_master (
        rfqNumber, productCode, productDescription, uom, quantity,
        price, quotationDeadline, deliveryDate, vendorCode, vendorName, document
      ) VALUES ?
    `;

    const values = [];

    products.forEach(product => {
      vendors.forEach(vendor => {
        values.push([
          rfqNumber,
          product.productCode,
          product.productDescription,
          product.uom,
          product.quantity,
          product.price,
          quotationDeadline,
          deliveryDate,
          vendor.vendorCode,
          vendor.vendorName,
          documentPath
        ]);
      });
    });

    connection.query(insertQuery, [values], (err2, result2) => {
      if (err2) {
        console.error("Insert error:", err2);
        return res.status(500).send("Failed to save RFQ");
      }

      // Fetch saved entries for confirmation
      connection.query(
        "SELECT * FROM rfq_master WHERE rfqNumber = ?",
        [rfqNumber],
        (fetchErr, savedRfqs) => {
          if (fetchErr) return res.status(500).send("Saved but failed to fetch");
          res.json({ message: "RFQ Created", rfqNumber, savedRfqs });
        }
      );
    });
  });
});

router.get("/product/:code", (req, res) => {
  const code = req.params.code;
  const query = "SELECT * FROM productdetails WHERE productCode = ?";
  connection.query(query, [code], (err, result) => {
    if (err) return res.status(500).json({ error: "Query error" });
    if (result.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result[0]);
  });
});


// Get all RFQs
router.get("/rfqs", (req, res) => {
  connection.query("SELECT * FROM rfq_master", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


// Update RFQ// In routes/rfq.js or wherever you're defining your RFQ routes
router.put("/rfq/:id", upload.single("document"), (req, res) => {
  const id = req.params.id;
  const { quotationDeadline, deliveryDate } = req.body;
  const document = req.file ? req.file.filename : null;
  const updatedAt = new Date();

  let sql = "UPDATE rfq_master SET quotationDeadline=?, deliveryDate=?, updatedAt=?";
  const params = [quotationDeadline, deliveryDate, updatedAt];

  if (document) {
    sql += ", document=?";
    params.push(document);
  }

  sql += " WHERE id=?";
  params.push(id);

  connection.query(sql, params, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "RFQ updated successfully" });
  });
});



/////////////////////////////////////////////////////////////////////////
//vendor response code 
router.get("/rfq/vendor/:vendorCode", (req, res) => {
  const { vendorCode } = req.params;

  const query = "SELECT * FROM rfq_master WHERE vendorCode = ?";
  connection.query(query, [vendorCode], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});
router.get("/rfq-by-vendor", (req, res) => {
  const { vendorCode } = req.query;
  if (!vendorCode) return res.status(400).send("Vendor code is required");

  const sql = `
    SELECT 
      rm.id,
      rm.rfqNumber,
      rm.productCode,
      rm.productDescription,
      rm.uom,
      rm.quantity,
      rm.price,
      rm.deliveryDate,
      rm.quotationDeadline,
      rm.vendorCode,
      rm.vendorName,
      rm.document AS rfqDocument,
      rvr.status AS responseStatus,
      rvr.document AS responseDocument
    FROM rfq_master rm
    LEFT JOIN rfq_vendor_response rvr 
      ON rm.id = rvr.rfqId AND rvr.vendorCode = ?
    WHERE rm.vendorCode = ?
    ORDER BY rm.quotationDeadline ASC
  `;

  connection.query(sql, [vendorCode, vendorCode], (err, results) => {
    if (err) {
      console.error("Error fetching RFQs:", err);
      return res.status(500).send("Failed to fetch RFQs");
    }
    res.json(results);
  });
});

router.get("/rfq-by-vendor", (req, res) => {
  const vendorCode = req.query.vendorCode;
  connection.query(
    "SELECT * FROM rfq_master WHERE vendorCode = ?",
    [vendorCode],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      res.json(results);
    }
  );
});

//vendor response
router.post("/rfq-response", upload.single("document"), (req, res) => {
  const { rfqId, vendorCode, status } = req.body;
  const document = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO rfq_vendor_response (rfqId, vendorCode, status, document, responseDate)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      document = VALUES(document),
      responseDate = CURRENT_TIMESTAMP
  `;

  connection.query(sql, [rfqId, vendorCode, status, document], (err) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.status(500).send("Failed to save response");
    }
    res.send("Response saved");
  });
});
router.get("/api/rfq-by-vendor", (req, res) => {
  const { vendorCode } = req.query;
  if (!vendorCode) return res.status(400).send("Vendor code is required");

  const sql = `
    SELECT 
      rm.id,
      rm.rfqNumber,
      rm.productCode,
      rm.productDescription,
      rm.uom,
      rm.quantity,
      rm.price,
      rm.deliveryDate,
      rm.quotationDeadline,
      rvr.status AS responseStatus,
      rvr.document AS responseDocument
    FROM rfq_master rm
    JOIN rfq_vendor_map rvm ON rm.id = rvm.rfqId
    LEFT JOIN rfq_vendor_response rvr ON rm.id = rvr.rfqId AND rvr.vendorCode = ?
    WHERE rvm.vendorCode = ?
  `;

  connection.query(sql, [vendorCode, vendorCode], (err, results) => {
    if (err) {
      console.error("Error fetching RFQs:", err);
      return res.status(500).send("Failed to fetch RFQs");
    }
    res.json(results);
  });
});



/////////////////////////////////////////////
//vendor response view 
router.get("/vendor-response-view", (req, res) => {
  const query = `
    SELECT
      rv.id AS id,
      r.rfqNumber,
      r.productCode,
      rv.vendorCode,
      rv.status AS responseStatus,
      rv.document AS responseDocument,
      rv.responseDate
    FROM
      rfq_master r
    INNER JOIN
      rfq_vendor_response rv ON r.id = rv.rfqId
    ORDER BY
      rv.responseDate DESC;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching vendor responses" });
    }

    res.json(results);
  });
});




/////////////////////////////////////////////////////////////////////

//vendor quotation
// GET /api/vendor-quotation
// GET /api/vendor-quotation
router.get("/vendor-quotation", (req, res) => {
  const query = `
    SELECT
      rv.id AS responseId,
      r.rfqNumber,
      r.productCode,
      r.productDescription,
      r.uom,
      r.quantity,
      r.price,
      r.quotationDeadline,
      r.deliveryDate,
      r.vendorName,
      r.document AS rfqDocument,
      r.createdAt,
      r.updatedAt,
      rv.vendorCode,
      rv.status AS responseStatus,
      rv.document AS responseDocument,
      rv.responseDate,
      rv.customerDecision,
      rv.customerDecisionDate
    FROM
      rfq_master r
    JOIN
      rfq_vendor_response rv ON r.id = rv.rfqId
    WHERE
      rv.status = 'Accepted'
    ORDER BY
      r.quotationDeadline ASC;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching quotations" });
    }

    console.log("Sending quotations:", results); // 👈 add this for confirmation
    res.json(results);
  });
});


// POST /api/customer-decision
// POST /api/customer-decision
// POST /api/customer-decision

router.post("/customer-decision", (req, res) => {
  console.log("Raw body received:", req.body); // <-- Debug

  const { id, vendorCode, customerDecision } = req.body;

  if (!id || !vendorCode || !customerDecision) {
    console.log("Missing fields", { id, vendorCode, customerDecision }); // <-- Debug
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    UPDATE rfq_vendor_response
    SET customerDecision = ?, customerDecisionDate = NOW()
    WHERE id = ? AND vendorCode = ?
  `;

  connection.query(query, [customerDecision, id, vendorCode], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No matching record found" });
    }

    res.json({ message: "Customer decision updated successfully" });
  });
});




///////////////////////////////////////////////////////////////////////////////////////////////
//approval matrix
router.post('/approval-matrix', async (req, res) => {
  const { department, currency, levels } = req.body;

  if (!department || !currency || !levels || !Array.isArray(levels)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    // Insert into approval_matrix
    const [matrixResult] = await connection.promise().query(
      'INSERT INTO approval_matrix (department, currency) VALUES (?, ?)',
      [department, currency]
    );

    const matrixId = matrixResult.insertId;

    // Insert each level and its approvers
    for (const level of levels) {
      const { level: levelNumber, rangeFrom, rangeTo, approvers } = level;

      for (const approverName of approvers) {
        await connection.promise().query(
          `INSERT INTO approval_matrix_levels 
           (matrixId, level, rangeFrom, rangeTo, approverName)
           VALUES (?, ?, ?, ?, ?)`,
          [matrixId, levelNumber, rangeFrom, rangeTo, approverName]
        );
      }
    }

    res.status(200).json({ message: "Approval matrix saved successfully" });
  } catch (err) {
    console.error("Error saving approval matrix:", err);
    console.error("💥 Error in POST /api/approval-matrix:", err);
res.status(500).json({ message: "Server error", error: err.message });

  }
});

// Fetch approval matrix with levels
router.get("/approval-matrix", async (req, res) => {
  try {
    const [rows] = await connection.promise().query(`
      SELECT 
        m.id AS matrixId,
        m.department,
        m.currency,
        l.level,
        l.rangeFrom,
        l.rangeTo,
        l.approverName
      FROM approval_matrix m
      JOIN approval_matrix_levels l ON m.id = l.matrixId
      ORDER BY m.id, l.level
    `);

    const matrixMap = {};

    for (const row of rows) {
      if (!matrixMap[row.matrixId]) {
        matrixMap[row.matrixId] = {
          matrixId: row.matrixId,
          department: row.department,
          currency: row.currency,
          levels: [],
        };
      }

      const matrix = matrixMap[row.matrixId];
      let levelEntry = matrix.levels.find((l) => l.level === row.level);

      if (!levelEntry) {
        levelEntry = {
          level: row.level,
          rangeFrom: row.rangeFrom,
          rangeTo: row.rangeTo,
          approvers: [],
        };
        matrix.levels.push(levelEntry);
      }

      if (row.approverName) {
        levelEntry.approvers.push(row.approverName);
      }
    }

    res.json(Object.values(matrixMap));
  } catch (err) {
    console.error("Error in /api/approval-matrix:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/approval-matrix/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await connection.promise().query("DELETE FROM approval_matrix WHERE id = ?", [id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Hardcoded Users
router.get("/users", (req, res) => {
  const users = [
    { id: 1, username: "Rahul" },
    { id: 2, username: "Glenna" },
    { id: 3, username: "Sakshi" },
    { id: 4, username: "Sampath" },
    { id: 5, username: "Nikitha" },
    { id: 6, username: "Riya" }
  ];
  res.json(users);
});






/////////////////////////////////////////////////////////////////////////////////////////
//payment-terms
router.get("/productfetched", (req, res) => {
  const sql = "SELECT productCode, description FROM productdetails";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Product fetch error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// Get all payment terms
router.get("/payment-terms", (req, res) => {
  const sql = "SELECT * FROM paymentterms ORDER BY id DESC";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Payment terms fetch error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// Save payment term
router.post("/payment-terms", (req, res) => {
  const {
    productCode,
    productDescription,
    payment1Days,
    payment1Percent,
    payment2Days,
    payment2Percent,
    netDays,
  } = req.body;

  const sql = `
    INSERT INTO paymentterms (
      productCode, productDescription, payment1Days, payment1Percent,
      payment2Days, payment2Percent, netDays
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    productCode,
    productDescription,
    payment1Days,
    payment1Percent,
    payment2Days,
    payment2Percent,
    netDays,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ message: "Insert failed" });
    }
    res.json({ message: "Payment term saved", id: result.insertId });
  });
});




























//purchase requisition
router.post("/api/purchase-requisition", (req, res) => {
  const { header, items } = req.body;

  const sqlHeader = `
    INSERT INTO purchase_requisition_header 
    (vendor, payment_terms1, payment_terms2, location, approvers, status, pr_status, currency) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sqlHeader, [
    header.vendor,
    header.paymentTerms1,
    header.paymentTerms2,
    header.location,
    header.approvers,
    header.status,
    header.prStatus,
    header.currency,
  ], (err, result) => {
    if (err) return res.status(500).send("Header Save Failed");

    const requisitionId = result.insertId;
    const values = items.map(item => [
      requisitionId,
      item.productCode,
      item.productDescription,
      item.uom,
      item.qty,
      item.price,
      item.deliveryDate,
      item.hsnCode,
      item.taxCode,
      item.discount,
      item.netPrice,
      item.deliveryCost,
      item.actualPrice
    ]);

    const sqlItems = `
      INSERT INTO purchase_requisition_items 
      (requisition_id, product_code, product_description, uom, qty, price, delivery_date,
       hsn_code, tax_code, discount, net_price, delivery_cost, actual_price) 
      VALUES ?`;

    connection.query(sqlItems, [values], (err2) => {
      if (err2) return res.status(500).send("Items Save Failed");
      res.send("Purchase Requisition Saved Successfully ✅");
    });
  });
});

// Get Tax Code by HSN
router.get("/api/tax-code/:hsnCode", (req, res) => {
  const { hsnCode } = req.params;
  connection.query("SELECT tax_code FROM hsn_tax_mapping WHERE hsn_code = ?", [hsnCode], (err, result) => {
    if (err) return res.status(500).send("DB Error");
    if (result.length === 0) return res.status(404).send("HSN Not Found");
    res.json({ taxCode: result[0].tax_code });
  });
});










































// Save product detail from the form




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
////////////////////////////////////////////////////////////////////////////////////
//purchase request

// GET /api/getPurchases
router.get("/getPurchases", (req, res) => {
  connection.query("SELECT * FROM purchases ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// Assuming you use Express and have body-parser middleware


router.post("/savePurchaseSummary", async (req, res) => {
  const { referenceId, total, discount, netPrice, delivery, actualPrice } = req.body;

  try {
    await connection.promise().query(
      "INSERT INTO purchase_summary (referenceId, total, discount, netPrice, delivery, actualPrice) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total = ?, discount = ?, netPrice = ?, delivery = ?, actualPrice = ?",
      [referenceId, total, discount, netPrice, delivery, actualPrice, total, discount, netPrice, delivery, actualPrice]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in /savePurchaseSummary:", err); // ✅ shows real problem
    res.status(500).json({ error: "Failed to save purchase summary" });
  }
});



router.get("/getSavedSummaries", async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT referenceId FROM purchase_summary");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in /getSavedSummaries:", err.message);
    res.status(500).json({ error: "Failed to fetch saved summaries" });
  }
});


router.post("/savePurchase", async (req, res) => {
  const { referenceId, selectedProducts, vendors, locations, total } = req.body;

  try {
    for (const product of selectedProducts) {
      for (const vendor of vendors) {
        for (const location of locations) {
          await connection.promise().query(
            `INSERT INTO purchases (
              referenceId, productCode, description, uom, unitPrice, quantity, total, grandTotal,
              vendorCode, vendorName, vendorCountry, vendorGST,
              locationCode, locationName, locationCountry, locationGST
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              referenceId,
              product.productCode,
              product.description,
              product.uom,
              product.unitPrice,
              product.quantity,
              product.total || 0,
              total,
              vendor.vendorCode,
              vendor.vendorName,
              vendor.country,
              vendor.gstcode,
              location.locationCode,
              location.locationName,
              location.country,
              location.gstcode
            ]
          );
        }
      }
    }

    res.json({ success: true, message: "✅ Purchase saved successfully" });
  } catch (error) {
    console.error("❌ Error saving purchase:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/purchase-orders", (req, res) => {
  const query = `
    SELECT 
      referenceId, 
      REPLACE(referenceId, 'PR', 'PO') AS poNumber 
    FROM purchase_summary 
    ORDER BY savedAt DESC
  `;

  console.log("🔍 Hitting /purchase-orders route");
  console.log("🧠 Running Query: ", query);

  connection.query(query, (err, results) => {
    if (err) {
      console.error("❌ Query Failed:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("✅ Query Result: ", results);
    res.json(results);
  });
});

// 🚀 GET PO Details by PO Number
router.get("/purchase-orders/:poNumber", (req, res) => {
  const { poNumber } = req.params;
  const referenceId = poNumber.replace("PO", "PR");

  connection.query(
    "SELECT * FROM purchase_summary WHERE referenceId = ?",
    [referenceId],
    (err, summaryResults) => {
      if (err) {
        console.error("❌ Error in purchase_summary:", err);
        return res.status(500).json({ error: "Internal Server Error in summary" });
      }

      if (summaryResults.length === 0) {
        return res.status(404).json({ error: "Purchase Order not found" });
      }

      connection.query(
        "SELECT * FROM purchases WHERE referenceId = ?",
        [referenceId],
        (err2, itemResults) => {
          if (err2) {
            console.error("❌ Error in purchases:", err2);
            return res.status(500).json({ error: "Internal Server Error in items" });
          }

          // Compose detailed PO document
          const document = {
            poNumber,
            referenceId,
            summary: summaryResults[0],
            items: itemResults.map((item, idx) => ({
              itemNo: idx + 1,
              productCode: item.productCode,
              description: item.description,
              uom: item.uom,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              discount: item.discount,
              netPrice: item.netPrice,
              actualPrice: item.actualPrice,
              deliveryDate: item.deliveryDate,
              taxCode: item.taxCode,
              deliveryCost: item.deliveryCost,
              vendor: {
                vendorCode: item.vendorCode,
                vendorName: item.vendorName,
                vendorType: item.vendorType,
                vendorAddress: item.vendorAddress,
                vendorCountry: item.vendorCountry,
                vendorState: item.vendorState,
                vendorPostalCode: item.vendorPostalCode,
                vendorEmail: item.vendorEmail,
                vendorGST: item.vendorGST,
                vendorRecon: item.vendorRecon
              },
              location: {
                locationCode: item.locationCode,
                locationName: item.locationName,
                locationType: item.locationType,
                locationAddress: item.locationAddress,
                locationCountry: item.locationCountry,
                locationState: item.locationState,
                locationPin: item.locationPin,
                locationEmail: item.locationEmail,
                locationGST: item.locationGST
              }
            }))
          };

          res.json(document);
        }
      );
    }
  );
});
// 🚀 Save Purchase Summary (no await)
router.post("/savePurchaseSummary", (req, res) => {
  const { referenceId, total, discount, netPrice, delivery, actualPrice } = req.body;

  const query = `
    INSERT INTO purchase_summary (referenceId, total, discount, netPrice, delivery, actualPrice)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      total = VALUES(total),
      discount = VALUES(discount),
      netPrice = VALUES(netPrice),
      delivery = VALUES(delivery),
      actualPrice = VALUES(actualPrice)
  `;

  connection.query(
    query,
    [referenceId, total, discount, netPrice, delivery, actualPrice],
    (err, result) => {
      if (err) {
        console.error("❌ Error in /savePurchaseSummary:", err);
        return res.status(500).json({ error: "Failed to save purchase summary" });
      }
      res.json({ success: true });
    }
  );
});

// 🚀 Get Saved Summaries
router.get("/getSavedSummaries", (req, res) => {
  connection.query("SELECT referenceId FROM purchase_summary", (err, rows) => {
    if (err) {
      console.error("❌ Error in /getSavedSummaries:", err.message);
      return res.status(500).json({ error: "Failed to fetch saved summaries" });
    }
    res.json(rows);
  });
});

// 🚀 Save Purchase Items
router.post("/savePurchase", (req, res) => {
  const { referenceId, selectedProducts, vendors, locations, total } = req.body;

  const tasks = [];
  selectedProducts.forEach((product) => {
    vendors.forEach((vendor) => {
      locations.forEach((location) => {
        tasks.push([
          referenceId,
          product.productCode,
          product.description,
          product.uom,
          product.unitPrice,
          product.quantity,
          product.total || 0,
          total,
          vendor.vendorCode,
          vendor.vendorName,
          vendor.country,
          vendor.gstcode,
          location.locationCode,
          location.locationName,
          location.country,
          location.gstcode,
        ]);
      });
    });
  });

  const query = `
    INSERT INTO purchases (
      referenceId, productCode, description, uom, unitPrice, quantity, total, grandTotal,
      vendorCode, vendorName, vendorCountry, vendorGST,
      locationCode, locationName, locationCountry, locationGST
    ) VALUES ?
  `;

  connection.query(query, [tasks], (err, result) => {
    if (err) {
      console.error("❌ Error saving purchase:", err);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    res.json({ success: true, message: "✅ Purchase saved successfully" });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////

router.get("/getPurchases/:poNumber", (req, res) => {
  const poNumber = req.params.poNumber;

  const query = `
    SELECT 
      p.referenceId AS poNumber,
      p.productCode,
      p.description,
      p.quantity,
      p.unitPrice,
      p.uom,
      p.vendor,
      p.location
    FROM purchases p
    WHERE p.referenceId = ?
  `;

  connection.query(query, [poNumber], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Save Goods Receipt
router.get("/get-goods-receipt/:referenceId", (req, res) => {
  const { referenceId } = req.params;

  const purchaseQuery = `
    SELECT * FROM purchases WHERE referenceId = ?
  `;
  const summaryQuery = `
    SELECT * FROM purchase_summary WHERE referenceId = ?
  `;

  connection.query(purchaseQuery, [referenceId], (err, purchaseResults) => {
    if (err) return res.status(500).send(err);
    if (purchaseResults.length === 0) return res.status(404).send("No purchases found.");

    connection.query(summaryQuery, [referenceId], (err, summaryResults) => {
      if (err) return res.status(500).send(err);

      const summary = summaryResults[0] || {};
      const items = purchaseResults;
      const vendor = {
        vendorCode: items[0].vendorCode,
        vendorName: items[0].vendorName,
        vendorAddress: items[0].vendorAddress,
        vendorCountry: items[0].vendorCountry,
        vendorState: items[0].vendorState,
        vendorEmail: items[0].vendorEmail,
        vendorGST: items[0].vendorGST,
        vendorRecon: items[0].vendorRecon,
      };

      const location = {
        locationCode: items[0].locationCode,
        locationName: items[0].locationName,
        locationType: items[0].locationType,
        locationAddress: items[0].locationAddress,
        locationCountry: items[0].locationCountry,
        locationState: items[0].locationState,
        locationEmail: items[0].locationEmail,
        locationGST: items[0].locationGST,
      };

      res.send({ items, summary, vendor, location });
    });
  });
});

router.post("/post-grn", (req, res) => {
  const grns = req.body;
  const currentYear = new Date().getFullYear();

  const getSequence = `
    INSERT INTO grn_sequence (year, count)
    VALUES (?, 1)
    ON DUPLICATE KEY UPDATE count = count + 1
  `;

  connection.query(getSequence, [currentYear], (err) => {
    if (err) return res.status(500).send(err);

    connection.query("SELECT count FROM grn_sequence WHERE year = ?", [currentYear], (err2, result2) => {
      if (err2) return res.status(500).send(err2);

      const count = result2[0].count;
      const grnNumber = `GRN-${currentYear}-${String(count).padStart(4, "0")}`;

      const values = grns.map(g => [
        grnNumber,
        g.referenceId,
        g.postingDate,
        g.productCode,
        g.grnQuantity,
        g.unitPrice,
        g.totalPrice
      ]);

      const insertQuery = `
        INSERT INTO goods_receipt
        (grnNumber, referenceId, postingDate, productCode, grnQuantity, unitPrice, totalPrice)
        VALUES ?
      `;

      connection.query(insertQuery, [values], (err3, result3) => {
        if (err3) return res.status(500).send(err3);
        res.send({ message: "GRN posted", grnNumber, inserted: result3.affectedRows });
      });
    });
  });
});

router.get("/grn-list", (req, res) => {
  const query = `
    SELECT * FROM goods_receipt ORDER BY grnNumber DESC, id ASC
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

////////////////////////////////////////////////////////////////////////
//invoice receipt
router.get("/get-po-details/:poNumber", (req, res) => {
  const poNumber = req.params.poNumber;
  const sql = `SELECT * FROM purchases WHERE referenceId = ?`;
  connection.query(sql, [poNumber], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send("PO not found");

    const items = results.map((row) => ({
      productCode: row.productCode,
      description: row.description,
      uom: row.uom,
      poQty: row.quantity,
      grQty: row.quantity, // assuming full GRN for demo
      actualPrice: row.total,
    }));

    const vendorDetails = {
      vendorName: results[0].vendorName,
      vendorCode: results[0].vendorCode,
    };

    const invoiceSummary = {
      invoiceValue: results.reduce((acc, row) => acc + parseFloat(row.total || 0), 0),
      balance: results.reduce((acc, row) => acc + parseFloat(row.total || 0), 0),
    };

    res.json({ items, vendorDetails, invoiceSummary });
  });
});

// Route to post invoice receipt
router.post("/post-invoice", (req, res) => {
  const {
    poNumber,
    invoiceDate,
    invoiceValue,
    balance,
    vendor,
    taxCode,
    taxValue,
    items
  } = req.body;

  console.log("Received invoice data:", req.body);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send("No items provided");
  }

  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceVal = parseFloat(invoiceValue || 0);
  const balanceVal = parseFloat(balance || 0);
  const taxVal = parseFloat(taxValue || 0);

  const insertInvoiceSql = `
    INSERT INTO invoice_receipt
    (invoiceNumber, poNumber, invoiceDate, invoiceValue, balance, vendorName, taxCode, taxValue)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    insertInvoiceSql,
    [invoiceNumber, poNumber, invoiceDate, invoiceVal, balanceVal, vendor, taxCode, taxVal],
    (err) => {
      if (err) {
        console.error("Invoice receipt insert error:", err);
        return res.status(500).send(err);
      }

      const itemInserts = items.map((item) => [
        invoiceNumber,
        item.productCode,
        item.description,
        item.uom,
        parseInt(item.poQty) || 0,
        parseInt(item.grQty) || 0,
        parseFloat(item.actualPrice) || 0
      ]);

      const itemSql = `
        INSERT INTO invoice_items
        (invoiceNumber, productCode, description, uom, poQty, grQty, actualPrice)
        VALUES ?
      `;

      connection.query(itemSql, [itemInserts], (err2) => {
        if (err2) {
          console.error("Invoice items insert error:", err2);
          return res.status(500).send(err2);
        }

        res.json({ message: "Invoice saved", invoiceNumber });
      });
    }
  );
});

router.get("/invoice-po-list", (req, res) => {
  connection.query(
    "SELECT DISTINCT referenceId FROM goods_receipt ORDER BY referenceId DESC",
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results.map(row => row.referenceId));
    }
  );
});
router.get("/invoice-data/:poNumber", (req, res) => {
  const poNumber = req.params.poNumber;

  const grnQuery = "SELECT * FROM goods_receipt WHERE referenceId = ?";
  const vendorQuery = "SELECT * FROM purchases WHERE referenceId = ? LIMIT 1";

  connection.query(grnQuery, [poNumber], (err, grnRows) => {
    if (err) return res.status(500).send(err);

    connection.query(vendorQuery, [poNumber], (err2, vendorRow) => {
      if (err2) return res.status(500).send(err2);

      const vendor = vendorRow.length ? {
        vendorCode: vendorRow[0].vendorCode,
        vendorName: vendorRow[0].vendorName,
      } : {};

      res.json({ items: grnRows, vendor });
    });
  });
});


module.exports = router;
