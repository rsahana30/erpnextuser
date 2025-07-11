// components/PurchaseSidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function PurchaseSidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { label: 'Request for Quotation', to: '/rfq' },
    { label: 'Vendor View Response', to: '/vendor-view' },
     { label: 'Vendor Quotation', to: '/vendorquot' },
    //  { label: 'Vendor Response', to: '/vendor-response' },
     
      { label: 'Approved Matrix', to: '/approve' },
      { label: 'Payment Terms', to: '/payment' },
    //  { label: 'Purchase Requisition', to: '/purchasereq' },
    { label: 'Purchase Request', to: '/purchase/request' },
    
    { label: 'Purchase Order', to: '/purchaseorder' },
    { label: 'Goods Receipt', to: '/goods' },
    { label: 'Invoice Receipt', to: '/invoice' },
    
    // { label: 'Vendor Billing', to: '/purchase/billing' },
    // { label: 'PO Creation', to: '/purchase/po' },
    // { label: 'Approval Hierarchy', to: '/purchase/approval' },
    // { label: 'GRN & Receipts', to: '/purchase/grn' },
    // { label: 'Bill Matching', to: '/purchase/bill' },
    // { label: 'Pricing History', to: '/purchase/pricing' },
    // { label: 'Landed Cost', to: '/purchase/landed' }
   
  ];

  return (
    <div style={{ width: '290px', height: '100%', overflowY: 'auto' }}>
      <h6><b>User Data Management</b></h6>
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
