import React from 'react';
import Navbar from '../Navbar';
import Product from './Product';
import MasterDataSidebar from './MasterDataSidebar'; // <-- use the module-specific sidebar

function MasterData() {
  return (
    <div>
      {/* Fixed Navbar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          zIndex: 1000,
          backgroundColor: '#fff',
        }}
      >
        <Navbar />
      </div>

      {/* Master Data Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          bottom: 0,
          width: '250px',
          backgroundColor: '#fff',
         
          marginLeft:'15px'
        }}
      >
        <MasterDataSidebar />
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          marginTop: '70px',
          marginLeft: '270px',
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Product />
      </div>
    </div>
  );
}

export default MasterData;
