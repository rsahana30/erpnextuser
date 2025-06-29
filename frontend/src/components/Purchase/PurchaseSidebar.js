// components/PurchaseSidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function PurchaseSidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { label: 'Purchase Request', to: '/purchase/request' },
    { label: 'Purchase Order', to: '/purchase/order' },
    { label: 'Vendor Billing', to: '/purchase/billing' },
    { label: 'PO Creation', to: '/purchase/po' },
    { label: 'Approval Hierarchy', to: '/purchase/approval' },
    { label: 'GRN & Receipts', to: '/purchase/grn' },
    { label: 'Bill Matching', to: '/purchase/bill' },
    { label: 'Pricing History', to: '/purchase/pricing' },
    { label: 'Landed Cost', to: '/purchase/landed' }
  ];

  return (
    <div style={{ width: '250px', height: '100%', overflowY: 'auto' }}>
      <h6><u>User Data Management</u></h6>
      <div
        className="d-flex justify-content-between align-items-center p-3 bg-light"
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <strong>Purchase Management</strong>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {open && (
        <div className="px-3">
          {menu.map((item, i) => (
            <Link
              key={i}
              to={item.to}
              className="d-block my-2 text-decoration-none text-dark"
              style={{ fontSize: '0.95rem' }}
            >
              • {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PurchaseSidebar;
