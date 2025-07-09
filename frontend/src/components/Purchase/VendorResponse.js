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
    return new Date(dateString).toISOString().split("T")[0];
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
      toast.success(`RFQ ${status}ed successfully`, { transition: Zoom });
      fetchRfqs();
    } catch (err) {
      toast.error("Failed to submit response", { transition: Zoom });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/vendor-login");
  };

  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-secondary">Welcome, Vendor <span className="text-dark">{vendorCode}</span></h4>
          <button onClick={handleLogout} className="btn btn-outline-dark">Logout</button>
        </div>

        <div className="card shadow-sm p-3 mb-5 bg-body rounded">
          <h5 className="mb-3 text-center text-dark">Assigned RFQs</h5>

          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>RFQ No</th>
                  <th>Product Code</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Delivery</th>
                  <th>Deadline</th>
                  <th>Upload</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.length > 0 ? (
                  rfqs.map((rfq) => {
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
                            className="form-control form-control-sm"
                            onChange={(e) => handleFileChange(e, rfq.id)}
                            disabled={isResponded}
                          />
                        </td>
                        <td>
                          <span className={`badge rounded-pill px-3 py-2 bg-${
                            rfq.responseStatus === "Accepted"
                              ? "success"
                              : rfq.responseStatus === "Rejected"
                              ? "danger"
                              : "secondary"
                          }`}>
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
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-muted">No RFQs assigned</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop transition={Zoom} />
      </div>
    </>
  );
}

export default VendorResponse;
