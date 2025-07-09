import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar";
import PurchaseSidebar from "./PurchaseSidebar";

const VendorQuotation = () => {
  const [quotationData, setQuotationData] = useState([]);
  const vendorCode = localStorage.getItem("vendorCode");
  const negotiatedRef = useRef(null);

  useEffect(() => {
    fetchQuotationData();
  }, []);

  const fetchQuotationData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vendor-quotation");
      setQuotationData(res.data);
    } catch (err) {
      console.error("Failed to fetch quotation data", err);
    }
  };

  const handleCustomerAction = async (responseId, vendorCode, action) => {
    try {
      await axios.post("http://localhost:5000/api/customer-decision", {
        id: responseId,
        vendorCode,
        customerDecision: action,
      });

      toast.success(`Quotation ${action} successfully`);
      fetchQuotationData();
    } catch (error) {
      console.error("Request failed:", error.response?.data || error);
      toast.error("Action failed");
    }
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split("T")[0] : "-";

  // Negotiated quotations that haven’t been accepted or rejected yet
  const negotiated = quotationData.filter(
    (item) => item.customerDecision === "Negotiated"
  );

  // All other quotations (including Accepted, Rejected, or Pending)
  const mainTableData = quotationData.filter(
    (item) => item.customerDecision !== "Negotiated"
  );

  return (
    <>
      <Navbar />
      <div className="d-flex">
        <PurchaseSidebar />
        <div className="container mt-4">
          <ToastContainer position="top-right" autoClose={2000} />
          <div className="text-center mb-4">
            <h4 className="fw-bold text-dark">
              Customer Review of Vendor Quotations
            </h4>
          </div>

          {/* Negotiated Quotations Section */}
          {negotiated.length > 0 && (
            <div className="mb-5" ref={negotiatedRef}>
              <h5 className="text-warning fw-bold">Negotiated Quotations</h5>
              <Table striped bordered hover responsive>
                <thead className="table-warning text-center">
                  <tr>
                    <th>RFQ Number</th>
                    <th>Product Code</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Negotiated On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {negotiated.map((item) => (
                    <tr key={item.responseId}>
                      <td>{item.rfqNumber}</td>
                      <td>{item.productCode}</td>
                      <td>{item.productDescription}</td>
                      <td>{item.quantity}</td>
                      <td>{formatDate(item.customerDecisionDate)}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() =>
                              handleCustomerAction(
                                item.responseId,
                                item.vendorCode,
                                "Accepted"
                              )
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              handleCustomerAction(
                                item.responseId,
                                item.vendorCode,
                                "Rejected"
                              )
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Main Quotations Table */}
          <div className="table-responsive shadow-sm rounded">
            <Table striped bordered hover responsive>
              <thead className="table-secondary text-center">
                <tr>
                  <th>RFQ Number</th>
                  <th>Product Code</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Delivery Date</th>
                  <th>Deadline</th>
                  <th>Vendor Status</th>
                  <th>Response Document</th>
                  <th>Customer Decision</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {mainTableData.length > 0 ? (
                  mainTableData.map((item) => (
                    <tr key={item.responseId}>
                      <td>{item.rfqNumber}</td>
                      <td>{item.productCode}</td>
                      <td>{item.productDescription}</td>
                      <td>{item.uom}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td>{formatDate(item.deliveryDate)}</td>
                      <td>{formatDate(item.quotationDeadline)}</td>
                      <td>
                        <span className="badge bg-success">
                          {item.responseStatus}
                        </span>
                      </td>
                      <td>
                        {item.responseDocument ? (
                          <a
                            href={`http://localhost:5000/uploads/${item.responseDocument}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {item.customerDecision ? (
                          <span
                            className={`badge bg-${
                              item.customerDecision === "Accepted"
                                ? "success"
                                : item.customerDecision === "Rejected"
                                ? "danger"
                                : "secondary"
                            }`}
                          >
                            {item.customerDecision}
                          </span>
                        ) : (
                          <span className="text-muted">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            size="sm"
                            variant="success"
                            disabled={!!item.customerDecision}
                            onClick={() =>
                              handleCustomerAction(
                                item.responseId,
                                item.vendorCode,
                                "Accepted"
                              )
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={!!item.customerDecision}
                            onClick={() =>
                              handleCustomerAction(
                                item.responseId,
                                item.vendorCode,
                                "Rejected"
                              )
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            disabled={!!item.customerDecision}
                            onClick={() =>
                              handleCustomerAction(
                                item.responseId,
                                item.vendorCode,
                                "Negotiated"
                              )
                            }
                          >
                            Negotiate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-muted text-center">
                      No quotations available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorQuotation;
