import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "bootstrap/js/dist/modal";

const PurchaseData = () => {
  const [filters, setFilters] = useState({
    productCode: "",
    productType: "",
    productGroup: "",
    brand: "",
    category: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    productCodes: [],
    productGroups: [],
    brands: [],
    categories: [],
    productTypes: ["Raw material", "Semi finished", "Finished", "Traded"],
  });

  const [productDetails, setProductDetails] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]); // ✅ NEW
  const [purchaseCounter, setPurchaseCounter] = useState(1); // can reset daily

  useEffect(() => {
    axios.get("http://localhost:5000/api/getProductDetails").then((res) => {
      setProductDetails(res.data);

      const extractUnique = (key) => [
        ...new Set(
          res.data.map((p) => p[key]?.toString().trim()).filter((v) => v)
        ),
      ];

      setDropdownOptions({
        productCodes: extractUnique("productCode"),
        productGroups: extractUnique("productGroup"),
        brands: extractUnique("brand"),
        categories: extractUnique("category"),
        productTypes: ["Raw material", "Semi finished", "Finished", "Traded"],
      });
    });
  }, []);

  useEffect(() => {
    const result = productDetails.filter((p) => {
      return (
        (!filters.productCode || p.productCode === filters.productCode) &&
        (!filters.productType || p.productType === filters.productType) &&
        (!filters.productGroup || p.productGroup === filters.productGroup) &&
        (!filters.brand || p.brand === filters.brand) &&
        (!filters.category || p.category === filters.category)
      );
    });
    setFilteredData(result);
  }, [filters, productDetails]);

  const dropdownMap = {
    productCode: "productCodes",
    productType: "productTypes",
    productGroup: "productGroups",
    brand: "brands",
    category: "categories",
  };

  const formatLabel = (key) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const toggleCheckbox = (product) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product]
    );
  };

  const handlePurchaseClick = () => {
    const modal = new Modal(document.getElementById("purchaseModal"));
    modal.show();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Purchase Data</h4>
        <button
          className="btn btn-primary"
          disabled={selectedProducts.length === 0}
          onClick={handlePurchaseClick}
        >
          Purchase
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
              onChange={(e) =>
                setFilters({ ...filters, [e.target.name]: e.target.value })
              }
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
            <th>Select</th>
            <th>Product Code</th>
            <th>Description</th>
            <th>Product Type</th>
            <th>Brand</th>
            <th>Group</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((prod, idx) => (
            <tr key={idx}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(prod)}
                  onChange={() => toggleCheckbox(prod)}
                />
              </td>
              <td>{prod.productCode}</td>
              <td>{prod.description}</td>
              <td>{prod.productType}</td>
              <td>{prod.brand}</td>
              <td>{prod.productGroup}</td>
              <td>{prod.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Modal for Purchase Preview */}
      {/* ✅ Modal for Purchase Preview */}
      <div
        className="modal fade"
        id="purchaseModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Selected Products</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              {selectedProducts.length === 0 ? (
                <p>No products selected.</p>
              ) : (
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Product Code</th>
                      <th>Description</th>
                      <th>UOM</th>
                      <th>Unit Price</th>
                      <th>Currency</th>
                      <th>Quantity</th>
                      <th>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((prod, idx) => (
                      <tr key={idx}>
                        <td>{prod.productCode}</td>
                        <td>{prod.description}</td>
                        <td>{prod.uom}</td>
                        <td>{prod.unitPrice}</td>
                        <td>{prod.currency}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={prod.quantity || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              const updated = [...selectedProducts];
                              updated[idx] = {
                                ...prod,
                                quantity: value,
                                total: value * parseFloat(prod.unitPrice),
                              };
                              setSelectedProducts(updated);
                            }}
                          />
                        </td>
                        <td>₹ {prod.total ? prod.total.toFixed(2) : "0.00"}</td>
                      </tr>
                    ))}
                    <tr className="table-light fw-bold">
                      <td colSpan="6" className="text-end">
                        Grand Total:
                      </td>
                      <td>
                        ₹{" "}
                        {selectedProducts
                          .reduce((sum, p) => sum + (p.total || 0), 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const vendorModal = new Modal(
                    document.getElementById("vendorLocationModal")
                  );
                  vendorModal.show();
                }}
              >
                Next
              </button>
            </div>
            <div
              className="modal fade"
              id="vendorLocationModal"
              tabIndex="-1"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-md">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Vendor & Location</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  <div className="modal-body">
                    {(() => {
                      const uniqueVendors = [
                        ...new Set(selectedProducts.map((p) => p.vendor)),
                      ];
                      const uniqueLocations = [
                        ...new Set(selectedProducts.map((p) => p.location)),
                      ];

                      if (
                        uniqueVendors.length > 1 ||
                        uniqueLocations.length > 1
                      ) {
                        return (
                          <div className="alert alert-warning">
                            Products have different vendors or locations. Please
                            select consistent products.
                          </div>
                        );
                      }

                      const vendor = uniqueVendors[0] || "N/A";
                      const location = uniqueLocations[0] || "N/A";

                      return (
                        <>
                          <p>
                            <strong>Vendor:</strong> {vendor}
                          </p>
                          <p>
                            <strong>Location:</strong> {location}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Back
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        const uniqueVendors = [
                          ...new Set(selectedProducts.map((p) => p.vendor)),
                        ];
                        const uniqueLocations = [
                          ...new Set(selectedProducts.map((p) => p.location)),
                        ];

                        if (
                          uniqueVendors.length > 1 ||
                          uniqueLocations.length > 1
                        ) {
                          alert(
                            "Cannot proceed. Products have multiple vendors or locations."
                          );
                          return;
                        }

                        const vendor = uniqueVendors[0];
                        const location = uniqueLocations[0];

                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(today.getDate()).padStart(2, "0");
                        const counter = String(purchaseCounter).padStart(
                          4,
                          "0"
                        );

                        const referenceId = `PR${year}${month}${day}${counter}`;

                        alert(
                          `✅ Purchase Confirmed!\nReference ID: ${referenceId}\nVendor: ${vendor}\nLocation: ${location}`
                        );

                        setPurchaseCounter((prev) => prev + 1);
                        setSelectedProducts([]);

                        Modal.getInstance(
                          document.getElementById("purchaseModal")
                        )?.hide();
                        Modal.getInstance(
                          document.getElementById("vendorLocationModal")
                        )?.hide();
                      }}
                    >
                      Confirm Purchase
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseData;
