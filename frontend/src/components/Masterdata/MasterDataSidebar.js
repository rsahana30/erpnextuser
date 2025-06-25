// components/MasterDataSidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function MasterDataSidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { label: 'Product Master', to: '/productmaster' },
    { label: 'Category Hierarchy', to: '/master/category' },
    { label: 'Brand & Company', to: '/master/brand' },
    { label: 'Store Master', to: '/master/store' },
    { label: 'Vendor Master', to: '/master/vendor' },
    { label: 'Vendor Product', to: '/master/vendor-product' },
    { label: 'Tax Rules', to: '/master/tax' },
    { label: 'Workflow', to: '/master/workflow' },
    { label: 'API Sync', to: '/master/api' },
    { label: 'Product List', to: '/productlist' },
  ];

  return (
    <div style={{ width: '250px', height: '100%', overflowY: 'auto' }}>
      
       <h6><u>User Data Management</u></h6>
      <div
        className="d-flex justify-content-between align-items-center p-3 bg-light"
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
       
        <strong>Master Data</strong>
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

export default MasterDataSidebar;
