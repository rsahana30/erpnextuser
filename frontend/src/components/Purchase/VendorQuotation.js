import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";

const VendorQuotation = () => {
  const [quotationData, setQuotationData] = useState([]);
  const vendorCode = localStorage.getItem("vendorCode");

  useEffect(() => {
    if (vendorCode) {
      fetchQuotationData();
    }
  }, []);

  const fetchQuotationData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vendor-quotation?vendorCode=${vendorCode}`);
      setQuotationData(res.data);
    } catch (err) {
      console.error("Failed to fetch quotation data", err);
    }
  };

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";
  };

  const handleCustomerAction = async (id, action) => {
    try {
      await axios.post("http://localhost:5000/api/customer-decision", {
        id,
        vendorCode,
        customerDecision: action,
      });
      fetchQuotationData(); // refresh
    } catch (error) {
      console.error(`Failed to ${action} quotation`, error);
    }
  };

  const negotiated = quotationData.filter(item => item.customerDecision === "Negotiated");

  return (
    <div className="container mt-4">
      <h4 className="mb-4 fw-bold text-primary">Customer Review of Vendor Quotations</h4>

      {/* Negotiated Quotations Table */}
      {negotiated.length > 0 && (
        <div className="mb-5">
          <h5 className="text-warning fw-bold">📝 Negotiated Quotations</h5>
          <Table striped bordered hover responsive>
            <thead className="table-warning text-center">
              <tr>
                <th>RFQ Number</th>
                <th>Product Code</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Negotiated On</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {negotiated.map(item => (
                <tr key={item.id}>
                  <td>{item.rfqNumber}</td>
                  <td>{item.productCode}</td>
                  <td>{item.productDescription}</td>
                  <td>{item.quantity}</td>
                  <td>{formatDate(item.customerDecisionDate)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Main Table */}
      <div className="table-responsive shadow-sm rounded">
        <Table striped bordered hover responsive>
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
              <th>Vendor Status</th>
              <th>Response Document</th>
              <th>Customer Decision</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {quotationData.length > 0 ? (
              quotationData.map((item) => (
                <tr key={item.id}>
                  <td>{item.rfqNumber}</td>
                  <td>{item.productCode}</td>
                  <td>{item.productDescription}</td>
                  <td>{item.uom}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>{formatDate(item.deliveryDate)}</td>
                  <td>{formatDate(item.quotationDeadline)}</td>
                  <td>
                    <span className={`badge bg-${item.responseStatus === "Accepted" ? "success" : item.responseStatus === "Rejected" ? "danger" : "secondary"}`}>
                      {item.responseStatus || "Pending"}
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
                    ) : "-"}
                  </td>
                  <td>
                    {item.customerDecision ? (
                      <span className={`badge bg-${item.customerDecision === "Accepted"
                        ? "success" : item.customerDecision === "Rejected"
                        ? "danger" : item.customerDecision === "Negotiated"
                        ? "warning text-dark" : "secondary"}`}>
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
                        onClick={() => handleCustomerAction(item.id, "Accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={!!item.customerDecision}
                        onClick={() => handleCustomerAction(item.id, "Rejected")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="warning"
                        disabled={!!item.customerDecision}
                        onClick={() => handleCustomerAction(item.id, "Negotiated")}
                      >
                        Negotiate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="text-muted text-center">No quotations available.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default VendorQuotation;
