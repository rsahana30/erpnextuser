import React from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assests/logo.png';
function Navbar() {
  return (
    <div
      className="d-flex align-items-center justify-content-between px-3"
      style={{
        height: '60px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#fff',
      }}
    >
      {/* Left Section: Logo */}
      <div className="d-flex align-items-center">
        <img
          src={logo}
          alt="ERPNext Logo"
          style={{
            width: '100px',
            height: '40px',
            borderRadius: '6px',
            // objectFit: 'cover',
          }}
        />
      </div>

      {/* Center Section: Search Bar */}
      <div className="d-flex flex-grow-1 justify-content-center" style={{ marginLeft: '100px' }}>
        <div
          className="d-flex align-items-center px-2 py-1"
          style={{
            backgroundColor: '#f1f1f1',
            borderRadius: '8px',
            minWidth: '320px',
          }}
        >
          <FaSearch className="text-muted me-2" />
          <input
            type="text"
            placeholder="Search or type a command (Ctrl + G)"
            className="form-control border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Right Section: Icons and Profile */}
      <div className="d-flex align-items-center gap-3">
        <FaBell style={{ cursor: 'pointer' }} />
        <span className="text-muted" style={{ cursor: 'pointer' }}>
          Help <span style={{ fontSize: '0.6rem' }}>▼</span>
        </span>
        <div
          className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center"
          style={{ width: '30px', height: '30px', fontWeight: 'bold' }}
        >
          JD
        </div>
      </div>
    </div>
  );
}

export default Navbar;
