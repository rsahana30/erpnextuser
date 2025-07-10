import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "bootstrap/js/dist/modal";
import { useNavigate } from "react-router-dom";
const PurchaseData = () => {
  const [filters, setFilters] = useState({
    productCode: "",
    productType: "",
    productGroup: "",
    brand: "",
    category: "",
  });
 const navigate = useNavigate();
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
  const [groupedPricing, setGroupedPricing] = useState({});
  const [savedSummaries, setSavedSummaries] = useState({});



const handleConvertClick = () => {
    navigate("/purchaseorder");
  };

 useEffect(() => {
  axios.get("http://localhost:5000/api/getPurchases").then((res) => {
    setPurchases(res.data);

    const savedMap = {};
    res.data.forEach(p => {
      if (p.summarySaved) {
        savedMap[p.referenceId] = true;
      }
    });
    setSavedSummaries(savedMap);

    const lastRef = res.data
      .map(p => p.referenceId)
      .filter(Boolean)
      .sort()
      .reverse()[0];

    if (lastRef?.startsWith("PR")) {
      const lastNumber = parseInt(lastRef.slice(-4));
      setPurchaseCounter(lastNumber + 1);
    }
  });
}, []); // ✅ ADD THIS




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

const handleGroupedSave = async (refId, summary) => {
  const { total, discount, netPrice, delivery, actualPrice } = summary;

  try {
    await axios.post("http://localhost:5000/api/savePurchaseSummary", {
      referenceId: refId,
      total,
      discount,
      netPrice,
      delivery,
      actualPrice
    });

    alert(`✅ Summary saved for ${refId}`);

    // 🔒 Mark the row as saved
    setSavedSummaries(prev => ({
      ...prev,
      [refId]: true
    }));

  } catch (err) {
    console.error("❌ API Error:", err.response?.data || err.message);
    alert("❌ Failed to save summary");
  }
};

useEffect(() => {
  let res=axios.get("http://localhost:5000/api/getSavedSummaries")
    .then((res) => {
      const savedMap = {};
      res.data.forEach((row) => {
        savedMap[row.referenceId] = true;
      });
      console.log(res);
      
      setSavedSummaries(savedMap); // 👈 This ensures Save buttons stay disabled
    })
    .catch((err) => {
      console.error("❌ Failed to fetch saved summaries:", err.message);
    });
}, []);







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
      <table className="table table-bordered table-striped table-sm">
        <thead className="table-light">
          <tr>
            <th>Select</th>
            <th>Vendor Code</th>
            <th>Vendor Name</th>
            <th>Country</th>
            <th>GST Code</th>
          </tr>
        </thead>
        <tbody>
          {dropdownOptions.vendors.map((v) => (
            <tr key={v.id}>
              <td>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedVendors.some(sv => sv.id === v.id)}
                  onChange={() => {
                    setSelectedVendors(prev =>
                      prev.some(sv => sv.id === v.id)
                        ? prev.filter(p => p.id !== v.id)
                        : [...prev, v]
                    );
                  }}
                />
              </td>
              <td>{v.vendorCode}</td>
              <td>{v.vendorName}</td>
              <td>{v.country}</td>
              <td>{v.gstcode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

      case 3:
  return (
    <>
      <h5>Select Location(s)</h5>
      <table className="table table-bordered table-striped table-sm">
        <thead className="table-light">
          <tr>
            <th>Select</th>
            <th>Location Code</th>
            <th>Location Name</th>
            <th>Country</th>
            <th>GST Code</th>
          </tr>
        </thead>
        <tbody>
          {dropdownOptions.locations.map((l) => (
            <tr key={l.id}>
              <td>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedLocations.some(sl => sl.id === l.id)}
                  onChange={() => {
                    setSelectedLocations(prev =>
                      prev.some(sl => sl.id === l.id)
                        ? prev.filter(p => p.id !== l.id)
                        : [...prev, l]
                    );
                  }}
                />
              </td>
              <td>{l.locationCode}</td>
              <td>{l.locationName}</td>
              <td>{l.country}</td>
              <td>{l.gstcode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

      case 4:
  return (
    <>
      <h5>Final Review</h5>

      <h6>Products:</h6>
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
            <th>UOM</th>
            <th>Weight</th>
            <th>Weight Unit</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Valuation Class</th>
            <th>Profit Centre</th>
            <th>HSN Code</th>
            <th>Currency</th>
            <th>Controller</th>
            <th>Type</th>
            <th>Group</th>
            <th>Brand</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {selectedProducts.map((p, i) => (
            <tr key={i}>
              <td>{p.productCode}</td>
              <td>{p.description}</td>
              <td>{p.uom}</td>
              <td>{p.weight}</td>
              <td>{p.weightUnit}</td>
               <td>{p.quantity}</td>
              <td>{p.unitPrice}</td>
              <td>{p.valuationClass}</td>
              <td>{p.profitCentre}</td>
              <td>{p.hsnCode}</td>
              <td>{p.currency}</td>
              <td>{p.controller}</td>
              <td>{p.productType}</td>
              <td>{p.productGroup}</td>
              <td>{p.brand}</td>
             
              <td>{p.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h6>Vendor Details:</h6>
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Vendor Code</th>
            <th>Vendor Name</th>
            <th>Country</th>
            <th>GST Code</th>
          </tr>
        </thead>
        <tbody>
          {selectedVendors.map((v, i) => (
            <tr key={i}>
              <td>{v.vendorCode}</td>
              <td>{v.vendorName}</td>
              <td>{v.country}</td>
              <td>{v.gstcode}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h6>Location Details:</h6>
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Location Code</th>
            <th>Location Name</th>
            <th>Country</th>
            <th>GST Code</th>
          </tr>
        </thead>
        <tbody>
          {selectedLocations.map((l, i) => (
            <tr key={i}>
              <td>{l.locationCode}</td>
              <td>{l.locationName}</td>
              <td>{l.country}</td>
              <td>{l.gstcode}</td>
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
  <h4>🧾 Grouped Purchase Summary</h4>

  <table className="table table-bordered table-striped">
    <thead className="table-dark">
      <tr>
        <th>Reference ID</th>
        <th>Total Price (₹)</th>
        <th>Discount (₹)</th>
        <th>Net Price (₹)</th>
        <th>Delivery Price (₹)</th>
        <th>Actual Price (₹)</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(
        purchases.reduce((acc, curr) => {
          const refId = curr.referenceId;
          if (!acc[refId]) acc[refId] = [];
          acc[refId].push(curr);
          return acc;
        }, {})
      ).map(([refId, items], idx) => {
        const total = items.reduce((sum, i) => sum + Number(i.total || 0), 0);

        const discount = groupedPricing[refId]?.discount || 0;
        const delivery = groupedPricing[refId]?.delivery || 0;

        const netPrice = total - discount;
        const actualPrice = netPrice + delivery;

        return (
          <tr key={idx}>
            <td>{refId}</td>
            <td>₹{total.toFixed(2)}</td>
            <td>
              <input
                type="number"
                className="form-control form-control-sm"
                value={discount}
                disabled={savedSummaries[refId]} // 🔒 Disable if saved
                onChange={(e) =>
                  setGroupedPricing((prev) => ({
                    ...prev,
                    [refId]: {
                      ...prev[refId],
                      discount: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
              />
            </td>
            <td>₹{netPrice.toFixed(2)}</td>
            <td>
              <input
                type="number"
                className="form-control form-control-sm"
                value={delivery}
                disabled={savedSummaries[refId]} // 🔒 Disable if saved
                onChange={(e) =>
                  setGroupedPricing((prev) => ({
                    ...prev,
                    [refId]: {
                      ...prev[refId],
                      delivery: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
              />
            </td>
            <td>₹{actualPrice.toFixed(2)}</td>
            <td>
              <button
                className="btn btn-outline-success btn-sm"
                disabled={savedSummaries[refId]} // ✅ Disable if ref is marked saved
 // 🔒 Disable Save button
                onClick={() =>
                  handleGroupedSave(refId, {
                    total,
                    discount,
                    netPrice,
                    delivery,
                    actualPrice,
                  })
                }
              >
                Save
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>


  <div className="text-end">
    <button className="btn btn-primary" onClick={handleConvertClick}>
        Convert to PO
      </button>
  </div>
</div>


    

    </div>
  );
};

export default PurchaseData;
