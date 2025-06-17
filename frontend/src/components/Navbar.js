import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assests/logo.png';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const helpRef = useRef();
  const profileRef = useRef();
  const navigate = useNavigate();

  // Close dropdowns when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelpDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = localStorage.getItem("userName")?.slice(0, 2).toUpperCase() || "JD";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
 


  return (
    <div
      className="d-flex align-items-center justify-content-between px-3"
      style={{ height: '60px', borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}
    >
      {/* Left Section: Logo */}
      <div className="d-flex align-items-center">
        <img
          src={logo}
          alt="ERPNext Logo"
          style={{ width: '100px', height: '40px', borderRadius: '6px' }}
        />
      </div>

      {/* Center Section: Search Bar */}
      <div className="d-flex flex-grow-1 justify-content-center" style={{ marginLeft: '100px' }}>
        <div
          className="d-flex align-items-center px-2 py-1"
          style={{ backgroundColor: '#f1f1f1', borderRadius: '8px', minWidth: '320px' }}
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

        {/* Help Dropdown */}
        <div className="position-relative" ref={helpRef}>
          <span className="text-muted" style={{ cursor: 'pointer' }} onClick={() => setShowHelpDropdown(prev => !prev)}>
            Help <span style={{ fontSize: '0.6rem' }}>▼</span>
          </span>
          {showHelpDropdown && (
            <div
              className="position-absolute bg-white border rounded shadow-sm"
              style={{ top: '110%', right: 0, minWidth: '140px', zIndex: 1000 }}
            >
              <div
                className="px-3 py-2 border-bottom"
                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                onClick={() => {
                  alert('About clicked');
                  setShowHelpDropdown(false);
                }}
              >
                About
              </div>
              <div
                className="px-3 py-2"
                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                onClick={() => {
                  alert('Support clicked');
                  setShowHelpDropdown(false);
                }}
              >
                Support
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="position-relative" ref={profileRef}>
          <div
            className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center"
            style={{ width: '30px', height: '30px', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => setShowProfileDropdown(prev => !prev)}
          >
            {initials}
          </div>

          {showProfileDropdown && (
            <div
              className="position-absolute bg-white border rounded shadow-sm"
              style={{ right: 0, top: '120%', minWidth: '150px', zIndex: 999 }}
            >
              <div
                className="px-3 py-2 border-bottom"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  navigate('');
                  setShowProfileDropdown(false);
                }}
              >
                User Settings
              </div>
              <div
                className="px-3 py-2"
                style={{ cursor: 'pointer' }}
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
