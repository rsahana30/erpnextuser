import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "bootstrap/js/dist/modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    productCode: "",
    product: "",
    productGroup: "",
    brand: "",
    category: "",
    productType: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formInputs, setFormInputs] = useState({
    description: "",
    uom: "",
    unitPrice: "",
    hsnCode: "",
    profitCentre: "",
    controller: "",
    productType: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    productCodes: [],
    products: [],
    productGroups: [],
    brands: [],
    categories: [],
    productTypes: ["Raw material", "Semi finished", "Finished", "Traded"],
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/productconfig")
      .then((res) => {
        const extractUnique = (key) => [
          ...new Set(
            res.data.map((p) => p[key]?.toString().trim()).filter((v) => v)
          ),
        ];

        const dropdowns = {
          productCodes: extractUnique("productCode"),
          products: extractUnique("product"),
          productGroups: extractUnique("productGroup"),
          brands: extractUnique("brand"),
          categories: extractUnique("category"),
          productTypes: ["Raw material", "Semi finished", "Finished", "Traded"],
        };

        setProducts(res.data);
        setDropdownOptions(dropdowns);
      })
      .catch((err) => console.error("Error fetching product config:", err));
  }, []);

  const dropdownMap = {
    productCode: "productCodes",
    product: "products",
    productGroup: "productGroups",
    brand: "brands",
    category: "categories",
    productType: "productTypes",
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleInputChange = (e) => {
    setFormInputs({ ...formInputs, [e.target.name]: e.target.value });
  };

  const filteredProducts = products.filter((p) => {
    return (
      (!filters.productCode || p.productCode === filters.productCode) &&
      (!filters.product || p.product === filters.product) &&
      (!filters.productGroup || p.productGroup === filters.productGroup) &&
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.category || p.category === filters.category) &&
      (!filters.productType || p.productType === filters.productType)
    );
  });

  const handleCreateClick = () => {
    const selected = products.find(
      (p) =>
        (!filters.productCode || p.productCode === filters.productCode) &&
        (!filters.product || p.product === filters.product) &&
        (!filters.productGroup || p.productGroup === filters.productGroup) &&
        (!filters.brand || p.brand === filters.brand) &&
        (!filters.category || p.category === filters.category) &&
        (!filters.productType || p.productType === filters.productType)
    );
    if (selected) {
      setSelectedProduct(selected);
      setFormInputs({
        description: "",
        uom: "",
        unitPrice: "",
        hsnCode: "",
        profitCentre: "",
        controller: "",
        productType: "",
      });
      new Modal(document.getElementById("createProductModal")).show();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...selectedProduct, ...formInputs };
    axios
      .post("http://localhost:5000/api/saveProductDetails", finalData)
      .then(() => {
        alert("Product detail created!");
        document.getElementById("closeModalBtn").click();
      });
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Product Filters</h4>
        <button className="btn btn-success" onClick={handleCreateClick}>
          Create Product
        </button>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-4">
        {Object.keys(filters).map((field) => (
          <div key={field}>
            <label className="form-label">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <select
              className="form-select"
              name={field}
              value={filters[field]}
              onChange={handleFilterChange}
            >
              <option value="">Select</option>
              {dropdownOptions[dropdownMap[field]]?.map((item, idx) => (
                <option key={idx} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Product Code</th>
            <th>Product</th>
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
              <td>{p.product}</td>
              <td>{p.productGroup}</td>
              <td>{p.brand}</td>
              <td>{p.category}</td>
              <td>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() =>
                    navigate("/view-product", {
                      state: { productCode: p.productCode },
                    })
                  }
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <div
        className="modal fade"
        id="createProductModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Create Product Details</h5>
              <button
                type="button"
                id="closeModalBtn"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              {selectedProduct && (
                <div className="row g-3 mb-3">
                  {Object.entries(selectedProduct).map(([key, value]) => (
                    <div className="col-md-4" key={key}>
                      <label className="form-label">{key}</label>
                      <input className="form-control" value={value} disabled />
                    </div>
                  ))}
                  <div className="col-md-4">
                    <label className="form-label">Description</label>
                    <input
                      name="description"
                      className="form-control"
                      value={formInputs.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">UOM</label>
                    <select
                      name="uom"
                      className="form-select"
                      value={formInputs.uom}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Unit Price</label>
                    <input
                      name="unitPrice"
                      type="number"
                      className="form-control"
                      value={formInputs.unitPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">HSN Code</label>
                    <input
                      name="hsnCode"
                      className="form-control"
                      value={formInputs.hsnCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Profit Centre</label>
                    <input
                      name="profitCentre"
                      className="form-control"
                      value={formInputs.profitCentre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Controller</label>
                    <input
                      name="controller"
                      className="form-control"
                      value={formInputs.controller}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Product Type</label>
                    <select
                      name="productType"
                      className="form-select"
                      value={formInputs.productType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Raw material">Raw material</option>
                      <option value="Semi finished">Semi finished</option>
                      <option value="Finished">Finished</option>
                      <option value="Traded">Traded</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                Submit
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Product;
