import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

function VendorResponse() {
  const [rfqs, setRfqs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const navigate = useNavigate();
  const vendorCode = localStorage.getItem("vendorCode");

  useEffect(() => {
    if (!vendorCode) {
      toast.error("Unauthorized access");
      navigate("/vendor-login");
      return;
    }
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/rfq-by-vendor?vendorCode=${vendorCode}`);
      setRfqs(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch RFQs", { transition: Zoom });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleFileChange = (e, rfqId) => {
    setSelectedFiles({ ...selectedFiles, [rfqId]: e.target.files[0] });
  };

  const handleSubmitResponse = async (rfqId, status) => {
  const formData = new FormData();
  formData.append("rfqId", rfqId);
  formData.append("vendorCode", vendorCode);
  formData.append("status", status);
  if (selectedFiles[rfqId]) {
    formData.append("document", selectedFiles[rfqId]);
  }

  try {
    await axios.post("http://localhost:5000/api/rfq-response", formData);

    // Update status in local state immediately
    setRfqs((prevRfqs) =>
      prevRfqs.map((rfq) =>
        rfq.id === rfqId ? { ...rfq, responseStatus: status } : rfq
      )
    );

    toast.success(`RFQ ${status}ed successfully`, { transition: Zoom });
  } catch (err) {
    toast.error("Failed to submit response", { transition: Zoom });
  }
};


  const handleLogout = () => {
    localStorage.clear();
    navigate("/vendor-login");
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Welcome, Vendor {vendorCode}</h3>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover table-bordered align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th>RFQ Number</th>
              <th>Product Code</th>
              <th>Description</th>
              <th>UOM</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Delivery Date</th>
              <th>Deadline</th>
              <th>Upload</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {rfqs.length > 0 ? rfqs.map((rfq) => {
              const isResponded = rfq.responseStatus === "Accepted" || rfq.responseStatus === "Rejected";
              return (
                <tr key={rfq.id}>
                  <td>{rfq.rfqNumber}</td>
                  <td>{rfq.productCode}</td>
                  <td>{rfq.productDescription}</td>
                  <td>{rfq.uom}</td>
                  <td>{rfq.quantity}</td>
                  <td>{rfq.price}</td>
                  <td>{formatDate(rfq.deliveryDate)}</td>
                  <td>{formatDate(rfq.quotationDeadline)}</td>
                  <td>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e, rfq.id)}
                      disabled={isResponded}
                    />
                  </td>
                  <td>
                    <span className={`badge px-3 py-2 rounded-pill fs-6 bg-${rfq.responseStatus === "Accepted"
                      ? "success"
                      : rfq.responseStatus === "Rejected"
                        ? "danger"
                        : "secondary"}`}>
                      {rfq.responseStatus || "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        disabled={isResponded}
                        onClick={() => handleSubmitResponse(rfq.id, "Accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        disabled={isResponded}
                        onClick={() => handleSubmitResponse(rfq.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="11" className="text-center text-muted">No RFQs assigned</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  );
}

export default VendorResponse;
