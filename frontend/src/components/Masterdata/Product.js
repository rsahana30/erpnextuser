import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "bootstrap/js/dist/modal";
import "bootstrap/dist/css/bootstrap.min.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    productType: "",
    productGroup: "",
    brand: "",
    category: "",
  });

  const [formInputs, setFormInputs] = useState({
    productCode: "",
    description: "",
    uom: "",
    weight: "",
    weightUnit: "",
    unitPrice: "",
    valuationClass: "",
    profitCentre: "",
    hsnCode: "",
    currency: "",
    controller: "",
    productType: "",
    productGroup: "",
    brand: "",
    category: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    productGroups: [],
    brands: [],
    categories: [],
    productTypes: [],
    profitCentres: ["P1001", "P1002", "P1003", "P1004"],
    controllers: ["John Doe", "Jane Smith", "Carlos Vega", "Priya Iyer"],
    currencies: ["INR", "USD", "EUR", "JPY"],
    uoms: ["PCS", "KG", "L"],
    weightUnits: ["KG", "G", "MG"],
    valuationClasses: ["V100", "V200", "V300"],
  });

  const navigate = useNavigate();

  const fetchDropdowns = async () => {
    try {
      const [types, groups, brands, categories] = await Promise.all([
        axios.get("http://localhost:5000/api/product_types"),
        axios.get("http://localhost:5000/api/product_groups"),
        axios.get("http://localhost:5000/api/brands"),
        axios.get("http://localhost:5000/api/category"),
      ]);
      setDropdownOptions((prev) => ({
        ...prev,
        productTypes: types.data.map((item) => item.name || item.productType),
        productGroups: groups.data.map((item) => item.name || item.productGroup),
        brands: brands.data.map((item) => item.name || item.brand),
        categories: categories.data.map((item) => item.name || item.category),
      }));
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
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

  const handleCreateClick = () => {
    const { productType, productGroup, brand, category } = filters;
    setFormInputs({
      productCode: "",
      description: "",
      uom: "",
      weight: "",
      weightUnit: "",
      unitPrice: "",
      valuationClass: "",
      profitCentre: "",
      hsnCode: "",
      currency: "",
      controller: "",
      productType,
      productGroup,
      brand,
      category,
    });
    new Modal(document.getElementById("createProductModal")).show();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const existing = products.find(p => p.productCode === formInputs.productCode);
      if (existing) {
        await axios.put(`http://localhost:5000/api/updateProduct/${formInputs.productCode}`, formInputs);
        alert("Product updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/saveProductDetails", formInputs);
        alert("Product created successfully!");
      }
      fetchProducts();
      document.getElementById("closeModalBtn").click();
    } catch (err) {
      console.error("Save/Update failed:", err);
    }
  };

  const formatLabel = (key) =>
    key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase());

  const filteredProducts = products.filter((p) =>
    (!filters.productType || p.productType === filters.productType) &&
    (!filters.productGroup || p.productGroup === filters.productGroup) &&
    (!filters.brand || p.brand === filters.brand) &&
    (!filters.category || p.category === filters.category)
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>Product Master</h4>
        <button className="btn btn-dark" onClick={handleCreateClick}>
          Create Product
        </button>
      </div>

      <div className="row g-3 mb-4">
        {Object.keys(filters).map((field) => (
          <div className="col-md-3" key={field}>
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
            <th>Description</th>
            <th>Product Group</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Unit Price</th>
            <th>UOM</th>
            <th>View</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((prod, idx) => (
            <tr key={idx}>
              <td>{prod.productCode}</td>
              <td>{prod.description}</td>
              <td>{prod.productGroup}</td>
              <td>{prod.brand}</td>
              <td>{prod.category}</td>
              <td>{prod.unitPrice}</td>
              <td>{prod.uom}</td>
              <td>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/view-product", { state: prod })}
                >
                  View
                </button>
              </td>
              <td>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setFormInputs(prod);
                    new Modal(document.getElementById("createProductModal")).show();
                  }}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal fade" id="createProductModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header bg-secondary text-white">
              <h5 className="modal-title">
                {products.some(p => p.productCode === formInputs.productCode) ? "Update Product" : "Create Product"}
              </h5>
              <button type="button" id="closeModalBtn" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                {Object.entries(formInputs).map(([key, value]) => {
                  const isDropdown = [
                    "productGroup", "brand", "category", "productType", "uom",
                    "weightUnit", "valuationClass", "currency", "profitCentre", "controller"
                  ].includes(key);

                  const isDisabled = ["productType", "productGroup", "brand", "category"].includes(key);

                  const dropdownKey =
                    key === "uom" ? "uoms" :
                      key === "weightUnit" ? "weightUnits" :
                        key === "valuationClass" ? "valuationClasses" :
                          key === "profitCentre" ? "profitCentres" :
                            key === "controller" ? "controllers" :
                              key === "currency" ? "currencies" :
                                key === "category" ? "categories" :
                                  key + "s";

                  return (
                    <div className="col-md-4" key={key}>
                      <label className="form-label">{formatLabel(key)}</label>
                      {isDropdown ? (
                        <select
                          className="form-select"
                          name={key}
                          value={value}
                          onChange={handleInputChange}
                          required
                          disabled={isDisabled}  // 👈 DISABLE here for prefilled fields
                        >
                          <option value="">Select</option>
                          {dropdownOptions[dropdownKey]?.map((item, idx) => (
                            <option key={idx} value={item}>{item}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={(key === "unitPrice" || key === "weight") ? "number" : "text"}
                          className="form-control"
                          name={key}
                          value={value}
                          onChange={handleInputChange}
                          required
                        />
                      )}
                    </div>
                  );
                })}

              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-dark">Save</button>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Product;
