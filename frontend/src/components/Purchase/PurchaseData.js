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
    vendors: [],
    locations: [],
  });

  const [productDetails, setProductDetails] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [purchaseCounter, setPurchaseCounter] = useState(1);
  const [purchases, setPurchases] = useState([]);

const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/getProductDetails").then((res) => {
      setProductDetails(res.data);

      const extractUnique = (key) => [
        ...new Set(res.data.map((p) => p[key]?.toString().trim()).filter((v) => v)),
      ];

      setDropdownOptions((prev) => ({
        ...prev,
        productCodes: extractUnique("productCode"),
        productGroups: extractUnique("productGroup"),
        brands: extractUnique("brand"),
        categories: extractUnique("category"),
      }));
    });
    axios.get("http://localhost:5000/api/getPurchases").then((res) => {
    setPurchases(res.data);
  });

    axios.get("http://localhost:5000/api/getvendor").then((res) => {
      setDropdownOptions((prev) => ({
        ...prev,
        vendors: res.data,
      }));
    });

    axios.get("http://localhost:5000/api/getlocation").then((res) => {
      setDropdownOptions((prev) => ({
        ...prev,
        locations: res.data,
      }));
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
    key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());

  const toggleCheckbox = (product) => {
    setSelectedProducts((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    );
  };

  const handlePurchaseClick = () => {
    const modal = new Modal(document.getElementById("purchaseModal"));
    modal.show();
  };

  const renderTableRow = (item, type) => {
    const isSelected = (type === "vendor"
      ? selectedVendors
      : selectedLocations
    ).some((i) => i.id === item.id);

    const handleChange = () => {
      const setter = type === "vendor" ? setSelectedVendors : setSelectedLocations;
      const list = type === "vendor" ? selectedVendors : selectedLocations;
      const exists = list.find((v) => v.id === item.id);

      if (exists) {
        setter(list.filter((v) => v.id !== item.id));
      } else {
        setter([...list, item]);
      }
    };

    const handleView = () => {
      if (type === "vendor") {
        setExpandedVendor(item);
        setExpandedLocation(null);
      } else {
        setExpandedLocation(item);
        setExpandedVendor(null);
      }
    };

    return (
      <tr key={item.id}>
        <td>
          <input type="checkbox" checked={isSelected} onChange={handleChange} />
        </td>
        <td>{item.vendorName || item.locationName}</td>
        <td>
          <button className="btn btn-sm btn-info" onClick={handleView}>
            View
          </button>
        </td>
      </tr>
    );
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

      {/* Purchase Modal */}
      <div className="modal fade" id="purchaseModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Selected Products</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle text-center">
                  <thead className="table-primary">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Product Code</th>
                      <th scope="col">Description</th>
                      <th scope="col">UOM</th>
                      <th scope="col">Unit Price (₹)</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((prod, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{prod.productCode}</td>
                        <td className="text-start">{prod.description}</td>
                        <td>{prod.uom}</td>
                        <td>₹ {parseFloat(prod.unitPrice).toFixed(2)}</td>
                        <td style={{ width: "120px" }}>
                          <input
                            type="number"
                            min="0"
                            className="form-control form-control-sm"
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
                        <td>
                          ₹ {prod.total ? prod.total.toFixed(2) : "0.00"}
                        </td>
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
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  new Modal(document.getElementById("vendorLocationModal")).show();
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor & Location Modal */}
      <div className="modal fade" id="vendorLocationModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Select Vendor(s) & Location(s)</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Vendors</h6>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr><th>Select</th><th>Name</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {dropdownOptions.vendors.map((v) => renderTableRow(v, "vendor"))}
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6>Locations</h6>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr><th>Select</th><th>Name</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {dropdownOptions.locations.map((l) => renderTableRow(l, "location"))}
                    </tbody>
                  </table>
                </div>
              </div>
              {(expandedVendor || expandedLocation) && (
                <div className="mt-4 alert alert-info">
                  <h6>Details</h6>
                  <pre className="mb-0">
                    {JSON.stringify(expandedVendor || expandedLocation, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Back</button>
              <button
                className="btn btn-success"
                onClick={async () => {
                  if (!selectedVendors.length || !selectedLocations.length) {
                    alert("Please select at least one vendor and one location.");
                    return;
                  }

                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");
                  const counter = String(purchaseCounter).padStart(4, "0");
                  const referenceId = `PR${year}${month}${day}${counter}`;

                  const total = selectedProducts.reduce((sum, p) => sum + (p.total || 0), 0);

                  try {
                    await axios.post("http://localhost:5000/api/savePurchase", {
                      referenceId,
                      selectedProducts,
                      vendors: selectedVendors,
                      locations: selectedLocations,
                      total,
                    });

                    alert(
                      `✅ Purchase Confirmed!\nReference ID: ${referenceId}\nVendors: ${selectedVendors
                        .map((v) => v.vendorName)
                        .join(", ")}\nLocations: ${selectedLocations
                          .map((l) => l.locationName)
                          .join(", ")}`
                    );

                    setPurchaseCounter((prev) => prev + 1);
                    setSelectedProducts([]);
                    setSelectedVendors([]);
                    setSelectedLocations([]);

                    Modal.getInstance(document.getElementById("purchaseModal"))?.hide();
                    Modal.getInstance(document.getElementById("vendorLocationModal"))?.hide();

                    const res = await axios.get("http://localhost:5000/api/getPurchases");
                    setPurchases(res.data);
                  } catch (error) {
                    console.error("Error saving purchase:", error);
                    alert("Failed to save purchase.");
                  }
                }}

              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mt-5 mb-3 text-primary">🧾 Submitted Purchases</h5>
<div className="table-responsive shadow-sm rounded border">
  <table className="table table-hover align-middle">
    <thead className="table-dark text-white">
      <tr>
        <th>📄 Ref ID</th>
        <th>📦 Product</th>
        <th>🏢 Vendor(s)</th>
        <th>📍 Location(s)</th>
        <th>🔢 Qty</th>
        <th>💰 Total (₹)</th>
      </tr>
    </thead>
    <tbody>
      {purchases.map((p, idx) => (
        <tr key={idx} style={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedPurchase(p);
            new Modal(document.getElementById("purchaseDetailsModal")).show();
          }}
        >
          <td className="text-primary fw-semibold">{p.referenceId}</td>
          <td>{p.productCode} - {p.description}</td>
          <td>{p.vendors}</td>
          <td>{p.locations}</td>
          <td>{p.quantity}</td>
          <td className="text-success fw-bold">₹ {parseFloat(p.total).toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<div className="modal fade" id="purchaseDetailsModal" tabIndex="-1" aria-hidden="true">
  <div className="modal-dialog modal-lg">
    <div className="modal-content border-0 shadow-lg">
      <div className="modal-header bg-gradient text-white" style={{ backgroundColor: "#0d6efd" }}>
        <h5 className="modal-title">🧾 Purchase Summary</h5>
        <button className="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div className="modal-body p-4">
        {selectedPurchase ? (
          <div className="row g-3">
            <div className="col-12 mb-2">
              <h6 className="text-secondary"><strong>Reference ID:</strong> {selectedPurchase.referenceId}</h6>
              <hr />
            </div>
            <div className="col-md-6">
              <strong>📦 Product:</strong><br />
              {selectedPurchase.productCode} - {selectedPurchase.description}
            </div>
            <div className="col-md-6">
              <strong>📐 UOM:</strong><br />
              {selectedPurchase.uom}
            </div>
            <div className="col-md-6">
              <strong>💸 Unit Price:</strong><br />
              ₹ {parseFloat(selectedPurchase.unitPrice).toFixed(2)}
            </div>
            <div className="col-md-6">
              <strong>🔢 Quantity:</strong><br />
              {selectedPurchase.quantity}
            </div>
            <div className="col-md-6">
              <strong>💰 Total:</strong><br />
              ₹ {parseFloat(selectedPurchase.total).toFixed(2)}
            </div>
            <div className="col-md-6">
              <strong>🏢 Vendor(s):</strong><br />
              {selectedPurchase.vendors}
            </div>
            <div className="col-md-6">
              <strong>📍 Location(s):</strong><br />
              {selectedPurchase.locations}
            </div>
          </div>
        ) : (
          <div className="text-muted">Loading details...</div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default PurchaseData;