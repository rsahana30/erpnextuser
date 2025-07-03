import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import PurchaseSidebar from "./PurchaseSidebar";

const VendorQuotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vendorquotations");
      setQuotations(res.data);
      const initialStatus = {};
      res.data.forEach((q) => {
        initialStatus[q.id] = q.status || "";
      });
      setStatusMap(initialStatus);
    } catch (err) {
      console.error("Failed to fetch vendor quotations", err);
    }
  };

  const handleStatusChange = (id, value) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveAll = async () => {
    const updates = Object.entries(statusMap)
      .filter(([_, status]) => status) // Only if status is selected
      .map(([id, status]) => ({
        id,
        status,
      }));

    if (updates.length === 0) {
      return alert("Please select Accept or Reject for at least one quotation.");
    }

    try {
      await Promise.all(
        updates.map(({ id, status }) =>
          axios.put(`http://localhost:5000/api/vendorquotation/${id}`, { status })
        )
      );
      alert("All statuses updated successfully.");
      fetchQuotations();
    } catch (err) {
      console.error("Failed to update statuses", err);
      alert("One or more updates failed.");
    }
  };

  return (
    <>
       <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "70px",
          zIndex: 1000,
          backgroundColor: "#fff",
         
        }}
      >
        <Navbar/>
      </div>

      <div
        className="position-fixed border-end"
        style={{ top: "70px", bottom: 0, left: 0, width: "250px", background: "#f8f9fa" }}
      >
        <PurchaseSidebar />
      </div>

      <div className="container" style={{ marginLeft: "270px", paddingTop: "100px", maxWidth: "1250px" }}>
        <div className="card shadow p-4">
          <h4 className="text-center text-dark mb-4">Vendor Quotations</h4>

          {quotations.length === 0 ? (
            <p className="text-center text-muted">No vendor quotations available.</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-secondary text-center">
                    <tr>
                      <th>RFQ Number</th>
                      <th>Quotation Number</th>
                      <th>Vendor Name</th>
                      <th>Vendor Number</th>
                      <th>Price</th>
                      <th>Delivery Date</th>
                      <th>Quality</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {quotations.map((q) => (
                      <tr key={q.id}>
                        <td>{q.rfqNumber}</td>
                        <td>{q.quotationNumber}</td>
                        <td>{q.vendorName}</td>
                        <td>{q.vendorNumber}</td>
                        <td>{q.price}</td>
                        <td>{new Date(q.deliveryDate).toLocaleDateString("en-GB")}</td>
                        <td>{q.quality}</td>
                        <td>
                          <select
                            className="form-select"
                            value={statusMap[q.id] || ""}
                            onChange={(e) => handleStatusChange(q.id, e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="Accepted">Accept</option>
                            <option value="Rejected">Reject</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-center mt-3">
                <button className="btn btn-primary px-4" onClick={handleSaveAll}>
                  Save All
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VendorQuotation;
