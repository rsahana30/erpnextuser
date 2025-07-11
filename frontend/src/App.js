// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import MasterData from './components/Masterdata/MasterData';
import ViewProduct from './components/Masterdata/ViewProduct';
import Purchase from './components/Purchase/Purchase';

import Location from './components/Masterdata/Location';
import Vendor from './components/Masterdata/Vendor';
import ApprovalMatrix from './components/Purchase/Approvematrix';
import Purchaseorder from './components/Purchase/Purchaseorder';

import RFQ from './components/Purchase/RFQ';
import VendorQuotation from './components/Purchase/VendorQuotation';
import PurchaseRequisition from './components/Purchase/PurchaseRequisition';
import VendorResponse from './components/Purchase/VendorResponse';
import Vendorlogin from './components/Vendorlogin';
import VendorResponseView from './components/Purchase/VendorResponseView';
import PaymentTerms from './components/Purchase/PaymentTerms';
import PurchaseData from './components/Purchase/PurchaseData';
import PurchaseOrderView from './components/Purchase/PurchaseOrderView';
import GoodsReceipt from './components/Purchase/GoodsReceipt';
import InvoiceReceipt from './components/Purchase/InvoiceReceipt';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/order" element={'/'} />
        <Route path="/logistics" element={'/'} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/inventory" element={'/'} />
        <Route path="/stock" element={'/'} />
        <Route path="/finance" element={'/'} />
        <Route path="/assets" element={'/'} />
        <Route path="/" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/view-product" element={<ViewProduct />} />
        <Route path="/payment" element={<PaymentTerms/>} />
       <Route path="/vendor-response" element={<VendorResponse/>} />
       <Route path="/vendor-login" element={<Vendorlogin/>} />
        <Route path="/vendor-view" element={<VendorResponseView/>} />




        {/* Master data Management */}
        <Route path="/master" element={<MasterData />} />
        <Route path='/location' element={<Location />} />
        <Route path='/vendor' element={<Vendor />} />
        <Route path='/approve' element={<ApprovalMatrix />} />
        <Route path='/purchaseorder' element={<Purchaseorder />} />
        <Route path='/rfq' element={<RFQ />} />
        <Route path='/vendorquot' element={<VendorQuotation/>} />
        <Route path='/purchasereq' element={<PurchaseRequisition/>} />
        <Route path='/purchase/request' element={<PurchaseData/>}/>
        <Route path="/order/:poNumber" element={<PurchaseOrderView/>} />
        <Route path="/goods" element={<GoodsReceipt/>} />
        <Route path="/invoice" element={<InvoiceReceipt/>} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;
