// roleAccessConfig.js

const roleAccess = {
  Admin: {
    modules: [
      "Master Data",
      "Order Management",
      "Logistics Execution",
      "Purchase Management",
      "Inventory Management",
      "Stock Transfer",
      "Finance Management",
      "Assets Management"
    ],
    permissions: "full"
  },

  PurchaseOfficer: {
    modules: [
      "Master Data",
      "Order Management",
      "Purchase Management",
      "Inventory Management",
      "Stock Transfer"
    ],
    permissions: {
      "Master Data": ["Products", "Vendors"],
      "Order Management": ["View PO"],
      "Purchase Management": ["Create", "Edit", "Approve"],
      "Inventory Management": ["View"],
      "Stock Transfer": ["View"]
    }
  },

  Requestor: {
    modules: ["Purchase Management"],
    permissions: {
      "Purchase Management": ["Raise PR"]
    }
  },

  DepartmentHead: {
    modules: ["Master Data", "Order Management", "Purchase Management", "Inventory Management"],
    permissions: {
      "Purchase Management": ["Approve PR", "Approve PO"],
      "Master Data": ["View"],
      "Order Management": ["View"],
      "Inventory Management": ["View"]
    }
  },

  InventoryManager: {
    modules: ["Master Data", "Order Management", "Logistics Execution", "Inventory Management", "Stock Transfer"],
    permissions: {
      "Logistics Execution": ["GRN Handling"],
      "Inventory Management": ["Full"],
      "Stock Transfer": ["Full"],
      "Master Data": ["View"],
      "Order Management": ["View"]
    }
  },

  FinanceExecutive: {
    modules: ["Master Data", "Order Management", "Purchase Management", "Inventory Management", "Finance Management", "Assets Management"],
    permissions: {
      "Purchase Management": ["Invoice Verification"],
      "Finance Management": ["Full"],
      "Assets Management": ["View"],
      "Master Data": ["View"],
      "Order Management": ["View"],
      "Inventory Management": ["View"]
    }
  },

  Controller: {
    modules: [
      "Master Data",
      "Order Management",
      "Logistics Execution",
      "Purchase Management",
      "Inventory Management",
      "Stock Transfer",
      "Finance Management",
      "Assets Management"
    ],
    permissions: {
      "Purchase Management": ["Approve High-Value"],
      "Finance Management": ["Full"],
      "Assets Management": ["Full"],
      "Master Data": ["View"],
      "Order Management": ["View"],
      "Inventory Management": ["View"],
      "Stock Transfer": ["View"],
      "Logistics Execution": ["View"]
    }
  },

  Storekeeper: {
    modules: ["Logistics Execution", "Inventory Management", "Stock Transfer"],
    permissions: {
      "Logistics Execution": ["Goods Receipt"],
      "Inventory Management": ["Stock Entry"],
      "Stock Transfer": ["Transfers"]
    }
  },

  Vendor: {
    modules: ["Order Management", "Logistics Execution", "Purchase Management"],
    permissions: {
      "Order Management": ["PO View"],
      "Logistics Execution": ["Dispatch Status"],
      "Purchase Management": ["Upload Invoice"]
    }
  }
};

export default roleAccess;
