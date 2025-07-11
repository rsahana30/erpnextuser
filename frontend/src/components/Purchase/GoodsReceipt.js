import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";

const GoodsReceipt = () => {
  const [referenceId, setReferenceId] = useState("");
  const [availablePOs, setAvailablePOs] = useState([]);
  const [data, setData] = useState({ items: [], summary: {}, vendor: {}, location: {} });
  const [postingDate, setPostingDate] = useState(moment().format("YYYY-MM-DD"));
  const [grnQuantities, setGrnQuantities] = useState({});
  const [grns, setGrns] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/getPurchases").then((res) => {
      const uniquePOs = [...new Set(res.data.map((row) => row.referenceId))];
      setAvailablePOs(uniquePOs);
    });
    fetchGRNs();
  }, []);

  const fetchGRNs = () => {
    axios.get("http://localhost:5000/api/grn-list")
      .then(res => setGrns(res.data))
      .catch(err => console.error("Error loading GRNs:", err));
  };

  const handleSelect = (e) => {
    const id = e.target.value;
    setReferenceId(id);
    if (id) {
      axios.get(`http://localhost:5000/api/get-goods-receipt/${id}`).then((res) => {
        setData(res.data);
        setGrnQuantities({});
      });
    }
  };

  const handleQtyChange = (productCode, qty) => {
    setGrnQuantities({ ...grnQuantities, [productCode]: qty });
  };

  const handlePostGRN = () => {
    if (!postingDate) {
      alert("Please select a GRN Posting Date");
      return;
    }

    const grnData = data.items.map((item) => ({
      referenceId: item.referenceId,
      postingDate,
      productCode: item.productCode,
      grnQuantity: grnQuantities[item.productCode] || 0,
      unitPrice: item.unitPrice,
      totalPrice: ((grnQuantities[item.productCode] || 0) * item.unitPrice).toFixed(2),
    }));

    axios.post("http://localhost:5000/api/post-grn", grnData)
      .then((res) => {
        alert(`✅ GRN ${res.data.grnNumber} posted successfully`);
        setReferenceId("");
        setData({ items: [], summary: {}, vendor: {}, location: {} });
        setGrnQuantities({});
        setPostingDate(moment().format("YYYY-MM-DD"));
        fetchGRNs();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to post GRN");
      });
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF();
    const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/800px-HD_transparent_picture.png"; // replace with your logo

    const tableData = data.map(row => [
      row.grnNumber,
      row.referenceId,
      row.postingDate,
      row.productCode,
      row.grnQuantity,
      row.unitPrice,
      row.totalPrice
    ]);

    doc.setFontSize(16);
    doc.text("Goods Receipt Note (GRN) Report", 14, 20);

    autoTable(doc, {
      head: [["GRN No", "PO Ref", "Date", "Product", "Qty", "Price", "Total"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 9 },
      theme: "striped"
    });

    doc.save("GRN_Report.pdf");
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">📦 Goods Receipt</h2>

      <div className="mb-3 row">
        <label className="col-sm-2 col-form-label">Select PO Number:</label>
        <div className="col-sm-6">
          <select className="form-select" onChange={handleSelect} value={referenceId}>
            <option value="">-- Select PO --</option>
            {availablePOs.map((po) => (
              <option key={po} value={po}>
                {po}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data.vendor.vendorCode && (
        <div className="mb-4">
          <h5 className="text-success">Vendor Details</h5>
          <div className="border p-3 bg-light rounded">
            <p><strong>Name:</strong> {data.vendor.vendorName}</p>
            <p><strong>Code:</strong> {data.vendor.vendorCode}</p>
            <p><strong>Address:</strong> {data.vendor.vendorAddress}, {data.vendor.vendorState}, {data.vendor.vendorCountry}</p>
            <p><strong>Email:</strong> {data.vendor.vendorEmail}</p>
            <p><strong>GST:</strong> {data.vendor.vendorGST}</p>
            <p><strong>Recon Account:</strong> {data.vendor.vendorRecon}</p>
          </div>
        </div>
      )}

      {data.location.locationCode && (
        <div className="mb-4">
          <h5 className="text-success">Location Details</h5>
          <div className="border p-3 bg-light rounded">
            <p><strong>Name:</strong> {data.location.locationName}</p>
            <p><strong>Code:</strong> {data.location.locationCode}</p>
            <p><strong>Type:</strong> {data.location.locationType}</p>
            <p><strong>Address:</strong> {data.location.locationAddress}, {data.location.locationState}, {data.location.locationCountry}</p>
            <p><strong>Email:</strong> {data.location.locationEmail}</p>
            <p><strong>GST:</strong> {data.location.locationGST}</p>
          </div>
        </div>
      )}

      {data.items.length > 0 && (
        <>
          <h5 className="text-secondary">Line Items</h5>
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                <th>Product Code</th>
                <th>Description</th>
                <th>UOM</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productCode}</td>
                  <td>{item.description}</td>
                  <td>{item.uom}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.quantity}</td>
                  <td>{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5 className="text-secondary">Enter GRN Quantities</h5>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>GRN Posting Date:</label>
              <input
                type="date"
                className="form-control"
                value={postingDate}
                onChange={(e) => setPostingDate(e.target.value)}
              />
            </div>
          </div>

          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Product Code</th>
                <th>Description</th>
                <th>Ordered Qty</th>
                <th>GRN Qty (Received)</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.productCode}>
                  <td>{item.productCode}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={grnQuantities[item.productCode] || ""}
                      onChange={(e) =>
                        handleQtyChange(item.productCode, parseInt(e.target.value) || 0)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end mb-4">
            <button className="btn btn-primary" onClick={handlePostGRN}>
              📥 Post GRN
            </button>
          </div>

          <h5 className="text-secondary">PO Summary</h5>
          <table className="table table-bordered w-50">
            <tbody>
              <tr><th>Total</th><td>{data.summary.total}</td></tr>
              <tr><th>Discount</th><td>{data.summary.discount}</td></tr>
              <tr><th>Net Price</th><td>{data.summary.netPrice}</td></tr>
              <tr><th>Delivery Cost</th><td>{data.summary.delivery}</td></tr>
              <tr><th>Actual Price</th><td>{data.summary.actualPrice}</td></tr>
            </tbody>
          </table>
        </>
      )}

      <hr className="my-5" />

      <h3 className="mb-4 text-primary">📋 GRN List</h3>

      <div className="row mb-3">
        <div className="col-md-4">
          <label>Filter by PO Reference:</label>
          <select className="form-select" onChange={(e) => {
            const ref = e.target.value;
            if (ref === "") fetchGRNs();
            else setGrns(grns.filter(g => g.referenceId === ref));
          }}>
            <option value="">-- Show All --</option>
            {availablePOs.map(po => (
              <option key={po} value={po}>{po}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 text-end mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => downloadPDF(grns)}
          >
            📄 Download GRN PDF
          </button>
        </div>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>GRN Number</th>
            <th>Reference ID</th>
            <th>Posting Date</th>
            <th>Product Code</th>
            <th>GRN Quantity</th>
            <th>Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {grns.map((row, idx) => (
            <tr key={idx}>
              <td>{row.grnNumber}</td>
              <td>{row.referenceId}</td>
              <td>{row.postingDate}</td>
              <td>{row.productCode}</td>
              <td>{row.grnQuantity}</td>
              <td>{row.unitPrice}</td>
              <td>{row.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoodsReceipt;
