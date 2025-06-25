// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import MasterData from './components/Masterdata/MasterData';
import ViewProduct from './components/Masterdata/ViewProduct';
import Purchase from './components/Purchase/Purchase';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/master" element={<MasterData/>} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
