import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h4>Saved Products</h4>
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th>Product Code</th>
            <th>Description</th>
            <th>UOM</th>
            <th>Unit Price</th>
            <th>Group</th>
            <th>Brand</th>
            <th>Category</th>
            <th>HSN Code</th>
            <th>Profit Centre</th>
            <th>Controller</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.productCode}</td>
              <td>{prod.description}</td>
              <td>{prod.uom}</td>
              <td>{prod.unitPrice}</td>
              <td>{prod.productGroup}</td>
              <td>{prod.brand}</td>
              <td>{prod.category}</td>
              <td>{prod.hsnCode}</td>
              <td>{prod.profitCentre}</td>
              <td>{prod.controller}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
