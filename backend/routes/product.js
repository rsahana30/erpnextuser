const express = require("express");
const router = express.Router();
const connection = require("../db");

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
