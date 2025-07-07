const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const connection = require("../db");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

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






//rfq (request for quotation)
router.post("/rfq", upload.single("document"), (req, res) => {
  const {
    productCode, productDescription, uom, quantity,
    price, quotationDeadline, deliveryDate
  } = req.body;

  const documentPath = req.file ? req.file.filename : null;

  const today = new Date();
  const getPrefix = `PR${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  const countQuery = `
    SELECT COUNT(*) as count FROM rfq_master
    WHERE rfqNumber LIKE '${getPrefix}%'`;

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
        price, quotationDeadline, deliveryDate, document
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertQuery, [
      rfqNumber, productCode, productDescription, uom,
      quantity, price, quotationDeadline, deliveryDate, documentPath
    ], (err) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).send("Failed to create RFQ");
      }

      res.send({ message: "RFQ Created", rfqNumber });
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

// Delete RFQ
router.delete("/rfq/:id", (req, res) => {
  const id = req.params.id;
  connection.query("DELETE FROM rfq_master WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// Update RFQ// In routes/rfq.js or wherever you're defining your RFQ routes
router.put("/api/rfq/:id", (req, res) => {
  const id = req.params.id;
  const {
    productCode,
    productDescription,
    uom,
    quantity,
    price,
    quotationDeadline,
    deliveryDate
  } = req.body;

  const sql = `
    UPDATE rfq_master SET 
      productCode = ?, 
      productDescription = ?, 
      uom = ?, 
      quantity = ?, 
      price = ?, 
      quotationDeadline = ?, 
      deliveryDate = ? 
    WHERE id = ?
  `;

  const values = [
    productCode,
    productDescription,
    uom,
    quantity,
    price,
    quotationDeadline,
    deliveryDate,
    id
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("RFQ update error:", err);
      return res.status(500).json({ error: "Update failed" });
    }
    res.json({ message: "RFQ updated successfully" });
  });
});










//vendor quotation
router.get("/vendorquotations", (req, res) => {
  const sql = `SELECT * FROM vendor_quotation ORDER BY createdAt DESC`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching vendor quotations:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


// Update vendor quotation status (Accept/Reject)
router.put("/vendorquotation/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const sql = `UPDATE vendor_quotation SET status = ? WHERE id = ?`;

  connection.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating vendor quotation status:", err);
      return res.status(500).json({ error: "Update failed" });
    }
    res.json({ message: "Status updated successfully" });
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






router.get("/getApprovers", (req, res) => {
  const sql = "SELECT id, name FROM approvers";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching approvers:", err);
      return res.status(500).json({ error: "Failed to fetch approvers" });
    }
    res.json(results);
  });
});

// ✅ Save Approval Matrix
router.post("/saveApprovalMatrix", (req, res) => {
  const {
    productGroup, controller, location, department,
    rangeFrom, rangeTo, currency, approvalName
  } = req.body;

  const sql = `INSERT INTO approval_matrix 
    (productGroup, controller, location, department, rangeFrom, rangeTo, currency, approvalName)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [productGroup, controller, location, department, rangeFrom, rangeTo, currency, approvalName],
    (err, result) => {
      if (err) {
        console.error("Error inserting matrix:", err);
        return res.status(500).json({ error: "Failed to save matrix" });
      }
      res.json({ success: true, id: result.insertId });
    });
});

// ✅ Get Approval Matrix list
router.get("/getApprovalMatrix", (req, res) => {
  const sql = "SELECT * FROM approval_matrix";
  connection.query(sql, (err, rows) => {
    if (err) {
      console.error("Error fetching matrix:", err);
      return res.status(500).json({ error: "Failed to fetch matrix" });
    }
    res.json(rows);
  });
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
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
router.get("/getApprovalMatrix", (req, res) => {
  const query = `SELECT * FROM approval_matrix`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching matrix:", err);
      return res.status(500).json({ error: "Failed to fetch matrix" });
    }
    res.json(results);
  });
});



module.exports = router;
