// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import MasterData from './components/Masterdata/MasterData';
import ViewProduct from './components/Masterdata/ViewProduct';
import Purchase from './components/Purchase/Purchase';
import Product from './components/Masterdata/Product';
import Location from './components/Masterdata/Location';
import Vendor from './components/Masterdata/Vendor';
import ApprovalMatrix from './components/Purchase/Approvematrix';
import Purchaseorder from './components/Purchase/Purchaseorder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
       
        <Route path="/order" element={'/'} />
        <Route path="/logistics" element={'/'} />
        <Route path="/purchase" element={<Purchase/>} />
        <Route path="/inventory" element={'/'} />
        <Route path="/stock" element={'/'} />
        <Route path="/finance" element={'/'} />
        <Route path="/assets" element={'/'} />
        <Route path="/" element={<Signup />} />
        <Route path="/home" element={<Home />} />
     <Route path="/view-product" element={<ViewProduct/>} />



     {/* Master data Management */}
      <Route path="/master" element={<MasterData/>} />
     <Route path='/location' element={<Location/>}/>
     <Route path='/vendor' element={<Vendor/>}/>
     <Route path='/approve' element={<ApprovalMatrix/>}/>
     <Route path='/purchaseorder' element={<Purchaseorder/>}/>



      </Routes>
    </BrowserRouter>
  );
}

export default App;
