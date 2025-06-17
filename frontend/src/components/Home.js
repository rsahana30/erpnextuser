import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';


function Home() {
  return (
    <div className="d-flex">
      
      <div className="flex-grow-1">
      
       <Navbar/>
       <Sidebar/>
       
      
        
      </div>
    </div>
  );
}
export default Home;