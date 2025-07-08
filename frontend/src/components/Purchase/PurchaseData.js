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

  const filterLabels = {
    productCode: "Product Code",
    productType: "Product Type",
    productGroup: "Product Group",
    brand: "Brand",
    category: "Category"
  };

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
  const [purchaseCounter, setPurchaseCounter] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [purchases, setPurchases] = useState([]);
   const [tableData, setTableData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/getPurchases").then((res) => setPurchases(res.data));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, vendorsRes, locationsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/getvendor"),
        axios.get("http://localhost:5000/api/getlocation"),
      ]);

      setProductDetails(productsRes.data);
      setDropdownOptions((prev) => ({
        ...prev,
        productCodes: [...new Set(productsRes.data.map(p => p.productCode))],
        productGroups: [...new Set(productsRes.data.map(p => p.productGroup))],
        brands: [...new Set(productsRes.data.map(p => p.brand))],
        categories: [...new Set(productsRes.data.map(p => p.category))],
        vendors: vendorsRes.data,
        locations: locationsRes.data,
      }));
    };
    fetchData();
  }, []);


  useEffect(() => {
  let res=axios.get("http://localhost:5000/api/getPurchases").then((res) => {
    const initializedData = res.data.map((item) => ({
      
      productCode: item.productCode,
      description: item.description,
      uom: item.uom,
      quantity: item.quantity || 0,
      unitPrice: item.total || 0,
      deliveryDate: "",
      hsnCode: item.hsnCode,
      taxCode: "",
      discount: 0,
      netPrice: 0,
      deliveryCost: 0,
      actualPrice: 0,
       
    }));
    console.log(initializedData);
    
  
    
    setTableData(initializedData);
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

  const handlePurchase = () => {
    setCurrentStep(1);
    new Modal(document.getElementById("multiStepModal")).show();
  };



  const handleChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;

    if (["discount", "unitPrice", "deliveryCost", "quantity"].includes(field)) {
      const qty = parseFloat(updated[index].quantity || 0);
      const unitPrice = parseFloat(updated[index].unitPrice || 0);
      const discount = parseFloat(updated[index].discount || 0);
      const deliveryCost = parseFloat(updated[index].deliveryCost || 0);

      const netPrice = qty * unitPrice * (1 - discount / 100);
      const actualPrice = netPrice + deliveryCost;

      updated[index].netPrice = netPrice.toFixed(2);
      updated[index].actualPrice = actualPrice.toFixed(2);
    }

    setTableData(updated);
  };
   const handleSave = async () => {
    try {
      await axios.post("http://localhost:5000/api/savePurchaseTable", tableData);
      alert("✅ Purchase table saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save purchase table");
    }
  };

  const handleConfirm = async () => {
    const today = new Date();
    const refId = `PR${today.getFullYear()}${String(today.getMonth()+1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${String(purchaseCounter).padStart(4, "0")}`;
    const total = selectedProducts.reduce((sum, p) => sum + (p.total || 0), 0);

    try {
      await axios.post("http://localhost:5000/api/savePurchase", {
        referenceId: refId,
        selectedProducts,
        vendors: selectedVendors,
        locations: selectedLocations,
        total
      });
      alert(`✅ Purchase saved! Ref: ${refId}`);
      setPurchaseCounter(purchaseCounter + 1);
      setSelectedProducts([]);
      setSelectedVendors([]);
      setSelectedLocations([]);
      Modal.getInstance(document.getElementById("multiStepModal")).hide();
    } catch (err) {
      console.error(err);
      alert("❌ Error saving purchase");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h5>Select Product & Quantity</h5>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Code</th><th>Description</th><th>UOM</th><th>Unit Price</th><th>Qty</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((prod, idx) => (
                  <tr key={idx}>
                    <td>{prod.productCode}</td>
                    <td>{prod.description}</td>
                    <td>{prod.uom}</td>
                    <td>{prod.unitPrice}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={prod.quantity || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const updated = [...selectedProducts];
                          updated[idx] = { ...prod, quantity: value, total: value * parseFloat(prod.unitPrice) };
                          setSelectedProducts(updated);
                        }}
                      />
                    </td>
                    <td>{prod.total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case 2:
        return (
          <>
            <h5>Select Vendor(s)</h5>
            <div className="list-group">
              {dropdownOptions.vendors.map((v) => (
                <label key={v.id} className="list-group-item">
                  <input type="checkbox" className="form-check-input me-2"
                    checked={selectedVendors.some(sv => sv.id === v.id)}
                    onChange={() => {
                      setSelectedVendors(prev =>
                        prev.some(sv => sv.id === v.id) ? prev.filter(p => p.id !== v.id) : [...prev, v]
                      );
                    }}
                  /> {v.vendorName} ({v.country})
                </label>
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h5>Select Location(s)</h5>
            <div className="list-group">
              {dropdownOptions.locations.map((l) => (
                <label key={l.id} className="list-group-item">
                  <input type="checkbox" className="form-check-input me-2"
                    checked={selectedLocations.some(sl => sl.id === l.id)}
                    onChange={() => {
                      setSelectedLocations(prev =>
                        prev.some(sl => sl.id === l.id) ? prev.filter(p => p.id !== l.id) : [...prev, l]
                      );
                    }}
                  /> {l.locationName} ({l.country})
                </label>
              ))}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h5>Final Review</h5>
            <h6>Products:</h6>
            <table className="table table-bordered table-sm">
              <thead>
                <tr><th>Code</th><th>Description</th><th>UOM</th><th>Qty</th><th>Total</th><th>HSN</th><th>Type</th><th>Brand</th></tr>
              </thead>
              <tbody>
                {selectedProducts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.productCode}</td>
                    <td>{p.description}</td>
                    <td>{p.uom}</td>
                    <td>{p.quantity}</td>
                    <td>{p.total?.toFixed(2)}</td>
                    <td>{p.hsnCode}</td>
                    <td>{p.productType}</td>
                    <td>{p.brand}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h6>Vendor Details:</h6>
            <table className="table table-bordered table-sm">
              <thead><tr><th>Name</th><th>Address</th><th>Email</th><th>GST</th></tr></thead>
              <tbody>
                {selectedVendors.map((v, i) => (
                  <tr key={i}>
                    <td>{v.vendorName}</td><td>{v.address}</td><td>{v.email}</td><td>{v.gstcode}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h6>Location Details:</h6>
            <table className="table table-bordered table-sm">
              <thead><tr><th>Name</th><th>Address</th><th>Email</th><th>GST</th></tr></thead>
              <tbody>
                {selectedLocations.map((l, i) => (
                  <tr key={i}>
                    <td>{l.locationName}</td><td>{l.address}</td><td>{l.email}</td><td>{l.gstcode}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <strong>Total: ₹{selectedProducts.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(2)}</strong>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">🛒 Purchase Request</h3>

      <div className="row g-3 mb-4">
        {Object.entries(filters).map(([key, value]) => (
          <div className="col-md-2" key={key}>
            <label className="form-label">{filterLabels[key] || key}</label>
            <select
              className="form-select"
              name={key}
              value={value}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            >
              <option value="">All</option>
              {dropdownOptions[key + 's']?.map((opt, idx) => (
                <option key={idx}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <table className="table table-striped">
        <thead>
          <tr><th>Select</th><th>Product Code</th><th>Description</th><th>Type</th><th>Group</th><th>Brand</th><th>Category</th></tr>
        </thead>
        <tbody>
          {filteredData.map((prod, idx) => (
            <tr key={idx}>
              <td>
                <input type="checkbox" checked={selectedProducts.includes(prod)} onChange={() => setSelectedProducts((prev) => prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod])} />
              </td>
              <td>{prod.productCode}</td>
              <td>{prod.description}</td>
              <td>{prod.productType}</td>
              <td>{prod.productGroup}</td>
              <td>{prod.brand}</td>
              <td>{prod.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-dark mt-3" disabled={!selectedProducts.length} onClick={handlePurchase}>Start Purchase Process</button>

      {/* Multi Step Modal */}
      <div className="modal fade" id="multiStepModal" tabIndex="-1">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Purchase Requisition</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">{renderStepContent()}</div>
            <div className="modal-footer">
              {currentStep > 1 && <button className="btn btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>Back</button>}
              {currentStep < 4 && <button className="btn btn-primary" onClick={() => setCurrentStep(currentStep + 1)}>Next</button>}
              {currentStep === 4 && <button className="btn btn-success" onClick={handleConfirm}>Confirm Purchase</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <h4>📋 Purchase Summary</h4>

        <table className="table table-striped table-bordered mt-3">
          <thead className="table-secondary">
            <tr>
              <th>Reference ID</th>
              <th>Product Code</th>
              <th>Vendor Code</th>
              <th>Location Code</th>
              <th>Quantity</th>
              <th>Total Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => (
              <tr key={index}>
                <td>{purchase.referenceId}</td>
                <td>{purchase.productCode}</td>
                <td>{purchase.vendorCode}</td>
                <td>{purchase.locationCode}</td>
                <td>{purchase.quantity}</td>
                <td>{Number(purchase.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      <div className="container mt-5">
      <h3 className="mb-4">📦 Purchase Entry Table</h3>
      <table className="table table-bordered table-striped">
        <thead className="table-secondary">
          <tr>
            <th>Product Code</th>
            <th>Description</th>
            <th>UOM</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Delivery Date</th>
            <th>HSN Code</th>
            <th>Tax Code</th>
            <th>Discount (%)</th>
            <th>Net Price</th>
            <th>Delivery Cost</th>
            <th>Actual Price</th>
          </tr>
        </thead>



        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{row.productCode}</td>
              <td>{row.description}</td>
              <td>{row.uom}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.quantity || ""}
                  onChange={(e) => handleChange(index, "quantity", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.unitPrice || ""}
                  onChange={(e) => handleChange(index, "unitPrice", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="date"
                  className="form-control"
                  value={row.deliveryDate || ""}
                  onChange={(e) => handleChange(index, "deliveryDate", e.target.value)}
                />
              </td>
              <td>{row.hsnCode}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.taxCode || ""}
                  onChange={(e) => handleChange(index, "taxCode", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.discount || 0}
                  onChange={(e) => handleChange(index, "discount", e.target.value)}
                />
              </td>
              <td>{row.netPrice}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.deliveryCost || 0}
                  onChange={(e) => handleChange(index, "deliveryCost", e.target.value)}
                />
              </td>
              <td>{row.actualPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success mt-3" onClick={handleSave}>
        💾 Save Purchase Table
      </button>
    </div>
    </div>
  );
};

export default PurchaseData;
