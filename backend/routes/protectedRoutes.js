const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Admin-only route
router.get("/admin-data", verifyToken, requireRole("Admin"), (req, res) => {
  res.json({ message: "Hello Admin, here is your data!" });
});

// PurchaseOfficer or Approver route
router.get("/purchase-orders", verifyToken, requireRole("PurchaseOfficer", "Approver"), (req, res) => {
  res.json({ message: "Only accessible by Purchase Officer or Approver" });
});

module.exports = router;
