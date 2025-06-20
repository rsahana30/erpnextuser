import React from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import ProductList from './ProductList';
import Product from './Product';

function MasterData() {
  return (
    <div>
      {/* Fixed Navbar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "70px",
          zIndex: 1000,
          backgroundColor: "#fff"
        }}
      >
        <Navbar />
      </div>

      {/* Fixed Sidebar */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          left: 0,
          bottom: 0,
          width: "250px",
          backgroundColor: "#fff",
          borderRight: "1px solid #ddd"
        }}
      >
        <Sidebar />
      </div>

      {/* Scrollable main content */}
      <div
        style={{
          marginTop: "70px",
          marginLeft: "270px",
          height: "calc(100vh - 70px)",
          overflowY: "auto",
          padding: "1rem",
          backgroundColor: "#f9f9f9"
        }}
      >
        <Product/>
        
      </div>
    </div>
  );
}

export default MasterData;
