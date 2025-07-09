import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import Navbar from "../Navbar";
import PurchaseSidebar from "./PurchaseSidebar";

const VendorResponseView = () => {
  const [quotationData, setQuotationData] = useState([]);

  useEffect(() => {
    fetchQuotationData();
  }, []);

  const fetchQuotationData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vendor-response-view");
      setQuotationData(res.data);
    } catch (err) {
      console.error("Failed to fetch quotation data", err);
    }
  };

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toISOString().split("T")[0] : "-";
  };

  const renderStatusBadge = (status) => {
    const color =
      status === "Accepted"
        ? "success"
        : status === "Rejected"
        ? "danger"
        : "secondary";

    return (
      <span className={`badge bg-${color} px-3 py-2 rounded-pill`}>
        {status || "Pending"}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="d-flex">
        <PurchaseSidebar />
        <div className="container mt-4">
          <div className="card shadow-sm p-4">
            <h4 className="mb-4 fw-bold text-dark text-center">Vendor Quotation Summary</h4>

            <div className="table-responsive">
              <Table bordered hover responsive className="align-middle text-center">
                <thead className="table-secondary">
                  <tr>
                    <th>RFQ No</th>
                    <th>Product Code</th>
                    <th>Vendor Code</th>
                    <th>Status</th>
                    <th>Response Date</th>
                    <th>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.length > 0 ? (
                    quotationData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.rfqNumber}</td>
                        <td>{item.productCode}</td>
                        <td>{item.vendorCode}</td>
                        <td>{renderStatusBadge(item.responseStatus)}</td>
                        <td>{formatDate(item.responseDate)}</td>
                        <td>
                          {item.responseDocument ? (
                            <a
                              href={`http://localhost:5000/uploads/${item.responseDocument}`}
                              className="btn btn-sm btn-outline-secondary"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-muted text-center py-3">
                        No vendor responses available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorResponseView;
