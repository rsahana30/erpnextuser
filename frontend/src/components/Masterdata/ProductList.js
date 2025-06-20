import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/product");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 70px)", // Adjust for fixed navbar height
        overflowY: "auto",
        padding: "1rem",
      }}
    >
      <h4 className="mb-4" style={{ fontWeight: 600 }}>Saved Products</h4>

      <div className="row">
        {products.map((prod) => (
          <div className="col-md-4 mb-4" key={prod.id}>
            <div
              className="card h-100 shadow-sm"
              style={{
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                backgroundColor: "#ffffff"
              }}
            >
              <div
                className="card-header"
                style={{
                  backgroundColor: "#f1f6fb",
                  color: "#004085",
                  fontWeight: "600",
                  borderBottom: "1px solid #d0d7de",
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px"
                }}
              >
                {prod.productCode} - {prod.description}
              </div>

              <div className="card-body" style={{ fontSize: "0.9rem" }}>
                <p><strong>UOM:</strong> {prod.uom}</p>
                <p><strong>Unit Price:</strong> ₹{prod.unitPrice}</p>
                <p><strong>Group:</strong> {prod.productGroup}</p>
                <p><strong>Brand:</strong> {prod.brand}</p>
                <p><strong>Category:</strong> {prod.category}</p>
                <p><strong>HSN Code:</strong> {prod.hsnCode}</p>
                <p><strong>Profit Centre:</strong> {prod.profitCentre}</p>
                <p><strong>Controller:</strong> {prod.controller}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
