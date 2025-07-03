import React, { useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import PurchaseSidebar from "./PurchaseSidebar";

const PurchaseRequisition = () => {
  const [header, setHeader] = useState({
    vendor: "",
    paymentTerms1: "",
    paymentTerms2: "",
    location: "",
    approvers: "",
    status: "",
    prStatus: "",
    currency: "",
  });

  const [items, setItems] = useState([
    {
      productCode: "",
      productDescription: "",
      uom: "",
      qty: "",
      price: "",
      deliveryDate: "",
      hsnCode: "",
      taxCode: "",
      discount: "",
      netPrice: "",
      deliveryCost: "",
      actualPrice: "",
    },
  ]);

  const handleHeaderChange = (e) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };

  const handleItemChange = async (index, e) => {
    const { name, value } = e.target;
    const updated = [...items];
    updated[index][name] = value;

    if (name === "hsnCode") {
      try {
        const res = await axios.get(`http://localhost:5000/api/tax-code/${value}`);
        updated[index].taxCode = res.data.taxCode;
      } catch {
        updated[index].taxCode = "";
      }
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, {
      productCode: "",
      productDescription: "",
      uom: "",
      qty: "",
      price: "",
      deliveryDate: "",
      hsnCode: "",
      taxCode: "",
      discount: "",
      netPrice: "",
      deliveryCost: "",
      actualPrice: "",
    }]);
  };

  const submitPR = async () => {
    try {
      await axios.post("http://localhost:5000/api/purchase-requisition", {
        header,
        items,
      });
      alert("Requisition Created");

      setHeader({
        vendor: "",
        paymentTerms1: "",
        paymentTerms2: "",
        location: "",
        approvers: "",
        status: "",
        prStatus: "",
        currency: "",
      });
      setItems([{
        productCode: "",
        productDescription: "",
        uom: "",
        qty: "",
        price: "",
        deliveryDate: "",
        hsnCode: "",
        taxCode: "",
        discount: "",
        netPrice: "",
        deliveryCost: "",
        actualPrice: "",
      }]);
    } catch {
      alert("Save Failed");
    }
  };

  return (
    <div>
    <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "70px",
          zIndex: 1000,
          backgroundColor: "#fff",
         
        }}
      >
        <Navbar/>
      </div>

      <div
        className="position-fixed border-end"
        style={{ top: "70px", bottom: 0, left: 0, width: "250px", background: "#f8f9fa" }}
      >
        <PurchaseSidebar/>
      </div>
    <div className="container" style={{ marginLeft: "270px", paddingTop: "100px", maxWidth: "1250px" }}>
      <h3>Purchase Requisition</h3>
      <div className="row mb-2">
        {["vendor", "paymentTerms1", "paymentTerms2", "location", "approvers", "status", "prStatus", "currency"].map((field, i) => (
          <div className="col-md-3 mb-2" key={i}>
            <input
              className="form-control"
              placeholder={field.replace(/([A-Z])/g, " $1")}
              name={field}
              value={header[field]}
              onChange={handleHeaderChange}
            />
          </div>
        ))}
      </div>

      <h5>Items</h5>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            {["productCode", "productDescription", "uom", "qty", "price", "deliveryDate", "hsnCode", "taxCode", "discount", "netPrice", "deliveryCost", "actualPrice"].map((col, i) => (
              <th key={i}>{col.replace(/([A-Z])/g, " $1")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              {Object.entries(item).map(([key, val]) => (
                <td key={key}>
                  <input
                    type={key === "deliveryDate" ? "date" : "text"}
                    name={key}
                    value={val}
                    className="form-control"
                    disabled={key === "taxCode"}
                    onChange={(e) => handleItemChange(idx, e)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" onClick={addItem}>➕ Add Item</button>
        <button className="btn btn-primary" onClick={submitPR}>✅ Create</button>
      </div>
    </div>
    </div>
  );
};

export default PurchaseRequisition;
