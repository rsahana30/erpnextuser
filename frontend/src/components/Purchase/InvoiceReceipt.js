import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const InvoiceReceipt = () => {
  const [poList, setPoList] = useState([]);
  const [selectedPO, setSelectedPO] = useState("");
  const [vendor, setVendor] = useState({});
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceValue, setInvoiceValue] = useState(0);
  const [taxCode, setTaxCode] = useState("");
  const [taxValue, setTaxValue] = useState(0);
  const [items, setItems] = useState([]);
  const [balance, setBalance] = useState(0);

  // Fetch PO list from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/invoice-po-list")
      .then((res) => setPoList(res.data))
      .catch((err) => console.error("Failed to load PO list", err));
  }, []);

  // On selecting a PO
  const handlePOSelect = (e) => {
    const po = e.target.value;
    setSelectedPO(po);
    axios
      .get(`http://localhost:5000/api/invoice-data/${po}`)
      .then((res) => {
        setItems(res.data.items || []);
        setVendor(res.data.vendor || {});

        const total = res.data.items.reduce(
          (sum, item) => sum + parseFloat(item.totalPrice || 0),
          0
        );

        setInvoiceValue(total.toFixed(2));
        setBalance(total.toFixed(2));
      })
      .catch((err) => console.error("Failed to load PO data", err));
  };

  const handleSimulate = () => {
    const taxAmount = (invoiceValue * parseFloat(taxValue || 0)) / 100;
    setBalance((parseFloat(invoiceValue) + taxAmount).toFixed(2));
  };

  const handlePost = () => {
    if (!selectedPO || !invoiceDate || !vendor.vendorName) {
      alert("Please fill all required fields!");
      return;
    }

    const payload = {
      poNumber: selectedPO,
      invoiceDate,
      invoiceValue,
      balance,
      vendor: vendor.vendorName,
      taxCode,
      taxValue,
      items: items.map((item) => ({
        productCode: item.productCode,
        description: item.description,
        uom: item.uom,
        poQty: item.grnQuantity,
        grQty: item.grnQuantity,
        actualPrice: item.totalPrice,
      })),
    };

    axios
      .post("http://localhost:5000/api/post-invoice", payload)
      .then((res) => alert(`✅ Invoice Posted Successfully: ${res.data.invoiceNumber}`))
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to post invoice.");
      });
  };

  return (
    <div className="container mt-5">
      <div className="bg-secondary text-white p-3 rounded mb-4">
        <h3 className="mb-0">🧾 Invoice Receipt Entry</h3>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">PO Number</label>
          <select className="form-select" value={selectedPO} onChange={handlePOSelect}>
            <option value="">-- Select PO --</option>
            {poList.map((po) => (
              <option key={po} value={po}>
                {po}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Invoice Date</label>
          <input
            type="date"
            className="form-control"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Invoice Value</label>
          <input type="text" className="form-control" value={invoiceValue} readOnly />
        </div>

        <div className="col-md-3">
          <label className="form-label">Balance</label>
          <input type="text" className="form-control" value={balance} readOnly />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">Vendor</label>
          <input
            type="text"
            className="form-control"
            value={vendor.vendorName || ""}
            readOnly
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Tax Code</label>
          <input
            type="text"
            className="form-control"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Tax Value (%)</label>
          <input
            type="number"
            className="form-control"
            value={taxValue}
            onChange={(e) => setTaxValue(e.target.value)}
          />
        </div>
        <div className="col-md-3 d-flex align-items-end justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={handleSimulate}>
            🧮 Simulate
          </button>
          <button className="btn btn-success" onClick={handlePost}>
            ✅ Post
          </button>
        </div>
      </div>

      <h5 className="mb-2">Invoice Line Items</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-secondary">
          <tr>
            <th>#</th>
            <th>Product Code</th>
            {/* <th>Description</th>
            <th>UOM</th> */}
            <th>PO Qty</th>
            <th>GRN Qty</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{item.productCode}</td>
                {/* <td>{item.description}</td>
                <td>{item.uom}</td> */}
                <td>{item.grnQuantity}</td>
                <td>{item.grnQuantity}</td>
                <td>{item.totalPrice}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No items to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceReceipt;
