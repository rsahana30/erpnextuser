import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import Navbar from "../Navbar";
import PurchaseSidebar from "./PurchaseSidebar";

const VendorResponseView = () => {
  const [quotationData, setQuotationData] = useState([]);
  const vendorCode = localStorage.getItem("vendorCode");

  useEffect(() => {
    if (vendorCode) {
      fetchQuotationData();
    }
  }, []);

  const fetchQuotationData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vendor-response-view?vendorCode=${vendorCode}`);
      setQuotationData(res.data);
    } catch (err) {
      console.error("Failed to fetch quotation data", err);
    }
  };

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toISOString().split("T")[0] : "-";
  };

  return (
    <>
      <Navbar />
      <div className="d-flex">
        <PurchaseSidebar />
        <div className="container mt-4">
          <h4 className="mb-3 fw-bold text-primary">Vendor Quotation Summary</h4>

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
                  <th>Response Status</th>
                  <th>Response Date</th>
                  <th>Response Document</th>
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
                        <span
                          className={`badge bg-${
                            item.responseStatus === "Accepted"
                              ? "success"
                              : item.responseStatus === "Rejected"
                              ? "danger"
                              : "secondary"
                          }`}
                        >
                          {item.responseStatus || "Pending"}
                        </span>
                      </td>
                      <td>{formatDate(item.responseDate)}</td>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-muted text-center">
                      No vendor quotations available.
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

export default VendorResponseView;
