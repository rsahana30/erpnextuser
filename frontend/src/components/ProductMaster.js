import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductMaster = () => {
  const [formData, setFormData] = useState({
    productCode: "",
    description: "",
    uom: "",
    unitPrice: "",
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
        console.error("Error loading dropdowns", err);
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/products", formData);
      alert("Product Saved!");
      setFormData({
        productCode: "",
        description: "",
        uom: "",
        unitPrice: "",
        productGroup: "",
        brand: "",
        category: "",
        hsnCode: "",
        profitCentre: "",
        controller: "",
      });
    } catch (err) {
      console.error("Product save failed", err);
    }
  };

  const renderDropdown = (label, name, options) => (
    <div className="mb-3">
      <label>{label}</label>
      <select className="form-control" name={name} value={formData[name]} onChange={handleChange} required>
        <option value="">Select {label}</option>
        {options.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="container mt-4">
      <h3>Product Master</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="productCode"
          value={formData.productCode}
          onChange={handleChange}
          placeholder="Product Code"
          className="form-control mb-3"
          required
        />
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="form-control mb-3"
        />
        {renderDropdown("UOM", "uom", dropdownData.uoms)}
        <input
          type="number"
          name="unitPrice"
          value={formData.unitPrice}
          onChange={handleChange}
          placeholder="Unit Price"
          className="form-control mb-3"
          required
        />
        {renderDropdown("Product Group", "productGroup", dropdownData.productGroups)}
        {renderDropdown("Brand", "brand", dropdownData.brands)}
        {renderDropdown("Category", "category", dropdownData.categories)}
        {renderDropdown("HSN Code", "hsnCode", dropdownData.hsnCodes)}
        {renderDropdown("Profit Centre", "profitCentre", dropdownData.profitCentres)}
        {renderDropdown("Controller", "controller", dropdownData.controllers)}
        <button className="btn btn-primary" type="submit">Save Product</button>
      </form>
    </div>
  );
};

export default ProductMaster;
