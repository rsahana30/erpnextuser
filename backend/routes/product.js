
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
router.post("/approval-matrix", (req, res) => {
  const {
    productCode, productDescription, uom, currency,
    approver1, approver1From, approver1To,
    approver2, approver2From, approver2To,
    approver3, approver3From, approver3To,
    useDefault // New field
  } = req.body;

  const parseOrNull = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const sql = `INSERT INTO approval_matrix (
    productCode, productDescription, uom, currency,
    approver1, approver1From, approver1To,
    approver2, approver2From, approver2To,
    approver3, approver3From, approver3To,
    useDefault
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    productCode, productDescription, uom, currency,
    approver1, parseOrNull(approver1From), parseOrNull(approver1To),
    approver2, parseOrNull(approver2From), parseOrNull(approver2To),
    approver3, parseOrNull(approver3From), parseOrNull(approver3To),
    useDefault ? 1 : 0
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err.message);
      return res.status(500).send("Failed to save approval matrix");
    }
    res.send("Approval matrix saved successfully");
  });
});



// Fetch Approval Matrix
router.get("/approval-matrix", (req, res) => {
  connection.query("SELECT * FROM approval_matrix", (err, result) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).send("Failed to fetch matrix");
    }
    res.json(result);
  });
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






// router.get("/getApprovers", (req, res) => {
//   const sql = "SELECT id, name FROM approvers";
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error("Error fetching approvers:", err);
//       return res.status(500).json({ error: "Failed to fetch approvers" });
//     }
//     res.json(results);
//   });
// });

// // ✅ Save Approval Matrix
// router.post("/saveApprovalMatrix", (req, res) => {
//   const {
//     productGroup, controller, location, department,
//     rangeFrom, rangeTo, currency, approvalName
//   } = req.body;

//   const sql = `INSERT INTO approval_matrix 
//     (productGroup, controller, location, department, rangeFrom, rangeTo, currency, approvalName)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//   connection.query(sql, [productGroup, controller, location, department, rangeFrom, rangeTo, currency, approvalName],
//     (err, result) => {
//       if (err) {
//         console.error("Error inserting matrix:", err);
//         return res.status(500).json({ error: "Failed to save matrix" });
//       }
//       res.json({ success: true, id: result.insertId });
//     });
// });

// // ✅ Get Approval Matrix list
// router.get("/getApprovalMatrix", (req, res) => {
//   const sql = "SELECT * FROM approval_matrix";
//   connection.query(sql, (err, rows) => {
//     if (err) {
//       console.error("Error fetching matrix:", err);
//       return res.status(500).json({ error: "Failed to fetch matrix" });
//     }
//     res.json(rows);
//   });
// });

// const verifyToken = (req, res, next) => {
//   const token = req.headers["authorization"];
//   if (!token) return res.status(403).json({ message: "Token required" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // attach user info to request
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };
// router.get("/getAssignedOrders", verifyToken, (req, res) => {
//   const approverName = req.user.name;

//   const query = `
//     SELECT p.*
//     FROM purchases p
//     JOIN approval_matrix a
//     ON p.productGroup = a.productGroup
//        AND p.controller = a.controller
//        AND p.location = a.location
//        AND p.currency = a.currency
//     WHERE FIND_IN_SET(?, a.approvalName)
//   `;

//   connection.query(query, [approverName], (err, results) => {
//     if (err) return res.status(500).json({ message: "Failed to fetch orders" });
//     res.json(results);
//   });
// });

// // ✅ Approve or Reject Order
// router.post("/approvePurchaseOrder", verifyToken, (req, res) => {
//   const { orderId, action } = req.body;
//   const approver = req.user.name;

//   const updateQuery = `UPDATE purchases SET approvalStatus = ?, approvedBy = ? WHERE id = ?`;

//   connection.query(updateQuery, [action, approver, orderId], (err, result) => {
//     if (err) return res.status(500).json({ message: "Approval failed" });
//     res.json({ message: `Order ${action}` });
//   });
// });
// router.get("/assigned-orders", (req, res) => {
//   const user = req.query.username;

//   const query = `
//     SELECT * FROM PurchaseOrders
//     WHERE approver1 = ? OR approver2 = ? OR approver3 = ?
//   `;
//   connection.query(query, [user, user, user], (err, results) => {
//     if (err) {
//       console.error("Error fetching assigned orders:", err);
//       return res.status(500).json({ error: "Server error" });
//     }
//     res.json(results);
//   });
// });

// router.post("/approve", (req, res) => {
//   const { id, status, approver } = req.body;

//   const query = `UPDATE PurchaseOrders SET status = ?, approvedBy = ? WHERE id = ?`;
//   connection.query(query, [status, approver, id], (err) => {
//     if (err) {
//       console.error("Approval update failed:", err);
//       return res.status(500).json({ error: "Approval failed" });
//     }
//     res.json({ message: "Purchase Order status updated" });
//   });
// });
// router.get("/getApprovalMatrix", (req, res) => {
//   const query = `SELECT * FROM approval_matrix`;

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching matrix:", err);
//       return res.status(500).json({ error: "Failed to fetch matrix" });
//     }
//     res.json(results);
//   });
// });



module.exports = router;
