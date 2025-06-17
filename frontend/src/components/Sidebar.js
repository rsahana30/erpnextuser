import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function Sidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const selectedModule = localStorage.getItem("selectedModule");

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleDropdownToggle = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const menuItems = [
    {
      icon: '•', label: 'Master Data', dropdown: [
        { label: 'Product Master', to: '/master/product' },
        { label: 'Category Hierarchy', to: '/master/category' },
        { label: 'Brand & Company', to: '/master/brand' },
        { label: 'Store Master', to: '/master/store' },
        { label: 'Vendor Master', to: '/master/vendor' },
        { label: 'Vendor Product', to: '/master/vendor-product' },
        { label: 'Tax Rules', to: '/master/tax' },
        { label: 'Workflow', to: '/master/workflow' },
        { label: 'API Sync', to: '/master/api' }
      ]
    },
    {
      icon: '•', label: 'Order Management', dropdown: [
        { label: 'Lead', to: '/order/lead' },
        { label: 'Quotation', to: '/order/quotation' },
        { label: 'Order', to: '/order/order' },
        { label: 'Billing', to: '/order/billing' },
        { label: 'Delivery Tracking', to: '/order/delivery' },
      ]
    },
    {
      icon: '•', label: 'Logistics Execution', dropdown: [
        { label: 'Inbound Delivery', to: '/logistics/inbound' },
        { label: 'Goods Receipt', to: '/logistics/receipt' },
        { label: 'Put Away', to: '/logistics/putaway' },
        { label: 'Outbound Delivery', to: '/logistics/outbound' },
        { label: 'Picking', to: '/logistics/picking' },
        { label: 'Goods Issue', to: '/logistics/issue' },
      ]
    },
    {
      icon: '•', label: 'Purchase', dropdown: [
        { label: 'Purchase Request', to: '/purchase/request' },
        { label: 'Purchase Order', to: '/purchase/order' },
        { label: 'Vendor Billing', to: '/purchase/billing' },
        { label: 'PO Creation', to: '/purchase/po' },
        { label: 'Approval Hierarchy', to: '/purchase/approval' },
        { label: 'GRN & Receipts', to: '/purchase/grn' },
        { label: 'Bill Matching', to: '/purchase/bill' },
        { label: 'Pricing History', to: '/purchase/pricing' },
        { label: 'Landed Cost', to: '/purchase/landed' }
      ]
    },
    {
      icon: '•', label: 'Inventory', dropdown: [
        { label: 'Multi-site Stock', to: '/inventory/multisite' },
        { label: 'Stock Moves', to: '/inventory/moves' },
        { label: 'FIFO', to: '/inventory/fifo' },
        { label: 'UOM Conversion', to: '/inventory/uom' },
        { label: 'Pricing History', to: '/inventory/pricing' },
        { label: 'Realtime Sync', to: '/inventory/realtime' }
      ]
    },
    {
      icon: '•', label: 'Stock Transfer', dropdown: [
        { label: 'Branch Transfer', to: '/transfer/branch' },
        { label: 'Auto Planning', to: '/transfer/plan' },
        { label: 'Transfer Orders', to: '/transfer/orders' },
        { label: 'Stock Visibility', to: '/transfer/visibility' },
        { label: 'Receipt Confirm', to: '/transfer/confirm' },
        { label: 'Shortage/Damage', to: '/transfer/issues' },
        { label: 'API Sync', to: '/transfer/api' }
      ]
    },
    {
      icon: '•', label: 'Finance', dropdown: [
        { label: 'Chart of Accounts', to: '/finance/chart' },
        { label: 'AR/AP & Tax', to: '/finance/tax' },
        { label: 'Expense Track', to: '/finance/expenses' },
        { label: 'Manual Journals', to: '/finance/journals' },
        { label: 'Bank Reco', to: '/finance/bank-reco' },
        { label: 'Store Finance', to: '/finance/store' },
        { label: 'Bank Payments', to: '/finance/payments' }
      ]
    },
    {
      icon: '•', label: 'Assets', dropdown: [
        { label: 'Asset Manager', to: '/assets/manager' },
        { label: 'Tagging', to: '/assets/tagging' },
        { label: 'Depreciation', to: '/assets/depreciation' },
        { label: 'Transfer/Disposal', to: '/assets/transfer' },
        { label: 'Maintenance Logs', to: '/assets/logs' },
        { label: 'Lifecycle Track', to: '/assets/lifecycle' }
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => item.label === selectedModule);

  if (!selectedModule) {
    return <div className="p-3">No module selected. Please login.</div>;
  }

  return (
    <div style={{ marginLeft: '12px' }}>
      <div className={`d-flex flex-column ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          width: sidebarCollapsed ? '60px' : '280px',
          height: '100vh',
          position: 'relative',
          transition: '0.3s',
          backgroundColor: '#fff'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: sidebarCollapsed ? '10px' : '15px',
            cursor: 'pointer',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={toggleSidebar}
        >
          <FaBars title="Toggle Sidebar" />
          {!sidebarCollapsed && <span>Home</span>}
        </div>

        <div className="pt-5 px-3">
          {!sidebarCollapsed && (
            <div className="mt-3">
              <div
                className="d-flex align-items-center justify-content-between px-3 py-2"
                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                onClick={() => setModulesOpen(!modulesOpen)}
              >
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.5rem' }}></span>
                  <span>User Data Management</span>
                </div>
                {modulesOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {modulesOpen && (
                <div>
                  {filteredMenuItems.map((item, index) => (
                    <div key={index}>
                      <div
                        className="d-flex align-items-center justify-content-between px-3 py-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDropdownToggle(item.label)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {openDropdowns[item.label] ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                      {openDropdowns[item.label] && (
                        <div className="ms-4">
                          {item.dropdown.map((subItem, i) => (
                            <Link
                              to={subItem.to}
                              key={i}
                              className="d-block my-2 px-2 text-decoration-none text-dark"
                              style={{ fontSize: '0.95rem' }}
                            >
                              • {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
