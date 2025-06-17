// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';

import ProductMaster from './components/ProductMaster';
import ProductList from './components/ProductList';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Signup />} />
        <Route path="/home" element={<Home />} />
    <Route path="/productmaster" element={<ProductMaster/>} />
    <Route path="/productlist" element={<ProductList/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
