// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';

import ProductMaster from './components/Masterdata/ProductMaster';
import ProductList from './components/Masterdata/ProductList';
import MasterData from './components/Masterdata/MasterData';
import ViewProduct from './components/Masterdata/ViewProduct';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/master" element={<MasterData/>} />
        <Route path="/order" element={'/'} />
        <Route path="/logistics" element={'/'} />
        <Route path="/purchase" element={'/'} />
        <Route path="/inventory" element={'/'} />
        <Route path="/stock" element={'/'} />
        <Route path="/finance" element={'/'} />
        <Route path="/assets" element={'/'} />
        <Route path="/" element={<Signup />} />
        <Route path="/home" element={<Home />} />
    <Route path="/productmaster" element={<ProductMaster/>} />
    <Route path="/productlist" element={<ProductList/>} />
     <Route path="/view-product" element={<ViewProduct/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
