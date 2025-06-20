import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductMaster = () => {
  const [formData, setFormData] = useState({
    productCode: "",
    description: "",
    uom: "",
    unitPrice: "",
    current: "",
    productGroup: "",
    brand: "",
    category: "",
    hsnCode: "",
    profitCentre: "",
    controller: "",
  });

  const [dropdownData, setDropdownData] = useState({
    uoms: [],
    productGroups: [],
    brands: [],
    categories: [],
    hsnCodes: [],
    profitCentres: [],
    controllers: [],
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const types = [
          "UOM",
          "ProductGroup",
          "Brand",
          "Category",
          "HSNCode",
          "ProfitCentre",
          "Controller",
        ];

        const fetches = await Promise.all(
          types.map((type) => axios.get(`http://localhost:5000/api/config/${type}`))
        );

        setDropdownData({
          uoms: fetches[0].data,
          productGroups: fetches[1].data,
          brands: fetches[2].data,
          categories: fetches[3].data,
          hsnCodes: fetches[4].data,
          profitCentres: fetches[5].data,
          controllers: fetches[6].data,
        });
      } catch (err) {
        console.error("Dropdown load error", err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (selectedOption, name) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption?.value || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/products", formData);
      alert("✅ Product Saved!");
      setFormData({
        productCode: "",
        description: "",
        uom: "",
        unitPrice: "",
        current: "",
        productGroup: "",
        brand: "",
        category: "",
        hsnCode: "",
        profitCentre: "",
        controller: "",
      });
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const renderSelect = (label, name, options) => (
    <div className="mb-3 col-md-6">
      <label className="form-label fw-semibold text-secondary">{label}</label>
      <Select
        options={options.map((opt) => ({ label: opt, value: opt }))}
        value={formData[name] ? { label: formData[name], value: formData[name] } : null}
        onChange={(selectedOption) => handleSelectChange(selectedOption, name)}
        isClearable
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            borderColor: "#ced4da",
            fontSize: "0.95rem",
          }),
        }}
      />
    </div>
  );

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <div className="container">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white border-bottom-0 rounded-top-4 pb-2">
            <h4 className="text-primary mb-1 fw-bold">Product Master</h4>
            <small className="text-muted">Fill in the product information below</small>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="mb-3 col-md-6">
                  <label className="form-label fw-semibold text-secondary">Product Code</label>
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    required
                  />
                </div>

                <div className="mb-3 col-md-6">
                  <label className="form-label fw-semibold text-secondary">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control rounded-3"
                  />
                </div>

                <div className="mb-3 col-md-6">
                  <label className="form-label fw-semibold text-secondary">UOM</label>
                  <select
                    className="form-select rounded-3"
                    name="uom"
                    value={formData.uom}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select UOM</option>
                    {dropdownData.uoms.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3 col-md-6">
                  <label className="form-label fw-semibold text-secondary">Unit Price</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    required
                  />
                </div>

                <div className="mb-3 col-md-6">
                  <label className="form-label fw-semibold text-secondary">Current</label>
                  <input
                    type="number"
                    name="current"
                    value={formData.current}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    required
                  />
                </div>

                {renderSelect("Product Group", "productGroup", dropdownData.productGroups)}
                {renderSelect("Brand", "brand", dropdownData.brands)}
                {renderSelect("Category", "category", dropdownData.categories)}
                {renderSelect("HSN Code", "hsnCode", dropdownData.hsnCodes)}
                {renderSelect("Profit Centre", "profitCentre", dropdownData.profitCentres)}
                {renderSelect("Controller", "controller", dropdownData.controllers)}
              </div>

              <div className="text-end mt-4">
                <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 shadow-sm">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMaster;
