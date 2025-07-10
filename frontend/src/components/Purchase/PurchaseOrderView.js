import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import logo from "../../assests/logo.png"; // adjust relative path based on file location


const PurchaseOrderView = () => {
  const { poNumber } = useParams();
  const [poData, setPoData] = useState(null);

  const downloadAsPDF = () => {
    const element = document.getElementById("print-section");

    const opt = {
      margin: 0.5,
      filename: `PO_${poNumber}_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/purchase-orders/${poNumber}`)
      .then((res) => setPoData(res.data))
      .catch((err) => console.error("Error loading PO document:", err));
  }, [poNumber]);

  if (!poData) return <div className="text-center mt-5">Loading PO Document...</div>;

  const {
    poNumber: number,
    referenceId,
    summary,
    items,
  } = poData;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Purchase Order</h2>
        <button className="btn btn-primary" onClick={downloadAsPDF}>Download PDF</button>
      </div>

      <div id="print-section" className="p-4 border bg-white shadow">
        <div className="text-center mb-4">
          <img src={logo} alt="Company Logo" style={{ maxWidth: "150px" }} />
          <h4 className="mt-2">Digizura Private Limited</h4>
          <p>1234 Main Street, City, Country | Email: info@company.com | GST: 22ABCDE1234F1Z5</p>
          <hr />
        </div>

        <div className="row mb-2">
          <div className="col-md-4"><strong>PO Number:</strong> {number}</div>
          <div className="col-md-4"><strong>PR Number:</strong> {referenceId}</div>
          <div className="col-md-4"><strong>Saved At:</strong> {new Date(summary.savedAt).toLocaleString()}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4"><strong>Total:</strong> ₹{summary.total}</div>
          <div className="col-md-4"><strong>Discount:</strong> ₹{summary.discount}</div>
          <div className="col-md-4"><strong>Net Price:</strong> ₹{summary.netPrice}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4"><strong>Delivery Price:</strong> ₹{summary.delivery}</div>
          <div className="col-md-4"><strong>Actual Price:</strong> ₹{summary.actualPrice}</div>
        </div>

        <h5 className="mt-4">Item Details</h5>
        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>UOM</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
             
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.itemNo}</td>
                <td>{item.productCode}</td>
                <td>{item.uom}</td>
                <td>{item.quantity}</td>
                <td>₹{item.unitPrice}</td>
                <td>₹{item.total}</td>
                
              </tr>
            ))}
          </tbody>
        </table>

        <h5 className="mt-5">Vendor & Location Info</h5>
        {items.map((item, idx) => (
          <div key={idx} className="border rounded p-3 mb-3">
            <h6>Item #{item.itemNo}</h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Vendor:</strong>
                <ul>
                  <li>{item.vendor.vendorName}</li>
                  <li>Code: {item.vendor.vendorCode}</li>
                  <li>Email: {item.vendor.vendorEmail}</li>
                  <li>GST: {item.vendor.vendorGST}</li>
                  <li>Country: {item.vendor.vendorCountry}</li>
                </ul>
              </div>
              <div className="col-md-6">
                <strong>Location:</strong>
                <ul>
                  <li>{item.location.locationName}</li>
                  <li>Code: {item.location.locationCode}</li>
                  <li>GST: {item.location.locationGST}</li>
                  <li>Country: {item.location.locationCountry}</li>
                </ul>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-5 text-end">
          <p><strong>Authorized Signature</strong></p>
          <div style={{ height: "80px" }}></div>
          <hr style={{ width: "200px", marginLeft: "auto" }} />
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderView;