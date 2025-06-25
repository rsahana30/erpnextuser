import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "bootstrap/js/dist/modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    productType: "",
    productGroup: "",
    brand: "",
    category: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formInputs, setFormInputs] = useState({
    productCode: "",
    description: "",
    uom: "",
    unitPrice: "",
    hsnCode: "",
    profitCentre: "",
    controller: "",
    productType: "",
    currency: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    productGroups: [],
    brands: [],
    categories: [],
    productTypes: ["Raw material", "Semi finished", "Finished", "Traded"],
    profitCentres: ["P1001", "P1002", "P1003", "P1004"],
    controllers: ["John Doe", "Jane Smith", "Carlos Vega", "Priya Iyer"],
    currencies: ["INR", "USD", "EUR", "JPY"],
  });

  const navigate = useNavigate();

  const fetchProducts = () => {
    axios.get("http://localhost:5000/api/productconfig")
      .then((res) => {
        setProducts(res.data);

        const extractUnique = (key) => [
          ...new Set(res.data.map((p) => p[key]?.toString().trim()).filter(Boolean)),
        ];

        setDropdownOptions((prev) => ({
          ...prev,
          productGroups: extractUnique("productGroup"),
          brands: extractUnique("brand"),
          categories: extractUnique("category"),
        }));
      })
      .catch((err) => console.error("Error fetching product config:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const dropdownMap = {
    productType: "productTypes",
    productGroup: "productGroups",
    brand: "brands",
    category: "categories",
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleInputChange = (e) => {
    setFormInputs({ ...formInputs, [e.target.name]: e.target.value });
  };

  const filteredProducts = products.filter((p) => (
    (!filters.productType || p.productType === filters.productType) &&
    (!filters.productGroup || p.productGroup === filters.productGroup) &&
    (!filters.brand || p.brand === filters.brand) &&
    (!filters.category || p.category === filters.category)
  ));

  const handleCreateClick = () => {
    const selected = products.find((p) => (
      (!filters.productType || p.productType === filters.productType) &&
      (!filters.productGroup || p.productGroup === filters.productGroup) &&
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.category || p.category === filters.category)
    ));

    if (selected) {
      setSelectedProduct(selected);
      setFormInputs({
        productCode: "",
        description: "",
        uom: "",
        unitPrice: "",
        hsnCode: "",
        profitCentre: "",
        controller: "",
        productType: "",
        currency: "",
      });
      new Modal(document.getElementById("createProductModal")).show();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...selectedProduct, ...formInputs };
    axios.post("http://localhost:5000/api/saveProductDetails", finalData)
      .then(() => {
        alert("Product detail created!");
        document.getElementById("closeModalBtn").click();
        fetchProducts();
      });
  };

  const formatLabel = (key) =>
    key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-success" onClick={handleCreateClick}>
          Create Product
        </button>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-4">
        {Object.keys(filters).map((field) => (
          <div key={field}>
            <label className="form-label">{formatLabel(field)}</label>
            <select
              className="form-select"
              name={field}
              value={filters[field]}
              onChange={handleFilterChange}
            >
              <option value="">Select</option>
              {dropdownOptions[dropdownMap[field]]?.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Product Code</th>
            <th>Product Group</th>
            <th>Brand</th>
            <th>Category</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p, idx) => (
            <tr key={idx}>
              <td>{p.productCode}</td>
              <td>{p.productGroup}</td>
              <td>{p.brand}</td>
              <td>{p.category}</td>
              <td>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => navigate("/view-product", { state: { productCode: p.productCode } })}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal fade" id="createProductModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Create Product Master</h5>
              <button type="button" id="closeModalBtn" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedProduct && (
                <div className="row g-3 mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Product Code</label>
                    <input name="productCode" className="form-control" value={formInputs.productCode} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Description</label>
                    <input name="description" className="form-control" value={formInputs.description} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Product Type</label>
                    <select name="productType" className="form-select" value={formInputs.productType} onChange={handleInputChange} required>
                      <option value="">Select</option>
                      {dropdownOptions.productTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">UOM</label>
                    <select name="uom" className="form-select" value={formInputs.uom} onChange={handleInputChange} required>
                      <option value="">Select</option>
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="L">L</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Product Group</label>
                    <input className="form-control" value={selectedProduct.productGroup} disabled />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Brand</label>
                    <input className="form-control" value={selectedProduct.brand} disabled />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Category</label>
                    <input className="form-control" value={selectedProduct.category} disabled />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">HSN Code</label>
                    <input name="hsnCode" className="form-control" value={formInputs.hsnCode} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Profit Centre</label>
                    <select name="profitCentre" className="form-select" value={formInputs.profitCentre} onChange={handleInputChange} required>
                      <option value="">Select</option>
                      {dropdownOptions.profitCentres.map((item, idx) => (
                        <option key={idx} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Controller</label>
                    <select name="controller" className="form-select" value={formInputs.controller} onChange={handleInputChange} required>
                      <option value="">Select</option>
                      {dropdownOptions.controllers.map((item, idx) => (
                        <option key={idx} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Unit Price</label>
                    <input name="unitPrice" type="number" className="form-control" value={formInputs.unitPrice} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Currency</label>
                    <select name="currency" className="form-select" value={formInputs.currency} onChange={handleInputChange} required>
                      <option value="">--</option>
                      {dropdownOptions.currencies.map((cur, idx) => (
                        <option key={idx} value={cur}>{cur}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-success">Submit</button>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Product;