import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const ViewProduct = () => {
  const location = useLocation();
  const productCode = location.state?.productCode;
  const [productDetails, setProductDetails] = useState([]);

  useEffect(() => {
    if (!productCode) return;

    axios.get("http://localhost:5000/api/getProductDetails") // Replace with your real endpoint
      .then((res) => {
        console.log(res);
        
        const filtered = res.data.filter((p) => p.productCode === productCode);
        setProductDetails(filtered);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [productCode]);

  return (
    <div className="container mt-4">
      <h4 className="mb-4">Products with Product Code: {productCode}</h4>
      <div className="row">
        {productDetails.length > 0 ? (
          productDetails.map((p, idx) => (
            <div className="col-md-4 mb-4" key={idx}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title text-primary">{p.productCode} - {p.product}</h6>
                  <p><strong>Description:</strong> {p.description}</p>
                  <p><strong>UOM:</strong> {p.uom}</p>
                  <p><strong>Unit Price:</strong> ₹{p.unitPrice}</p>
                  <p><strong>Product Type</strong> {p.productType}</p>
                  <p><strong>Group:</strong> {p.productGroup}</p>
                  <p><strong>Brand:</strong> {p.brand}</p>
                  <p><strong>Category:</strong> {p.category}</p>
                  <p><strong>HSN Code:</strong> {p.hsnCode}</p>
                  <p><strong>Profit Centre:</strong> {p.profitCentre}</p>
                  <p><strong>Controller:</strong> {p.controller}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No entries found for this product code.</p>
        )}
      </div>
    </div>
  );
};

export default ViewProduct;
