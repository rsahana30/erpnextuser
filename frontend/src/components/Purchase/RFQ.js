import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import PurchaseSidebar from "./PurchaseSidebar";

const RFQ = () => {
  const [formData, setFormData] = useState({
    id: null,
    rfqNumber: "",
    productCode: "",
    productDescription: "",
    uom: "",
    quantity: "",
    price: "",
    quotationDeadline: "",
    deliveryDate: "",
    document: null,
    vendorCode: "",
    vendorName: "", // 👈 Add this line
  });

  const [productList, setProductList] = useState([]);
  const [vendorList, setVendorList] = useState([]);

  const [rfqList, setRfqList] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/getvendor")
      .then((res) => setVendorList(res.data))
      .catch((err) => console.error("Failed to fetch vendors", err));
  }, []);


  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProductList(res.data))
      .catch((err) => console.error("Failed to fetch products", err));

    axios
      .get("http://localhost:5000/api/rfqs")
      .then((res) => setRfqList(res.data))
      .catch((err) => console.error("Failed to fetch RFQs", err));
  }, []);

  const handleVendorSelect = (e) => {
    const selectedCode = e.target.value;
    const selectedVendor = vendorList.find(v => v.vendorCode === selectedCode);
    setFormData({
      ...formData,
      vendorCode: selectedCode,
      vendorName: selectedVendor?.vendorName || "",
    });
  };


  const handleProductSelect = async (e) => {
    const selectedCode = e.target.value;
    setFormData({ ...formData, productCode: selectedCode });

    if (!selectedCode) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/product/${selectedCode}`);
      const product = res.data;

      setFormData((prev) => ({
        ...prev,
        productDescription: product.description || "",
        uom: product.uom || "",
        price: product.unitPrice || ""
      }));
    } catch (err) {
      console.error("Failed to fetch product details", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    const isEditing = !!formData.id;

    if (!formData.productCode || !formData.quantity || !formData.quotationDeadline || !formData.deliveryDate) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      if (!isEditing) {
        const data = new FormData();
        data.append("productCode", formData.productCode);
        data.append("productDescription", formData.productDescription);
        data.append("uom", formData.uom);
        data.append("quantity", formData.quantity);
        data.append("price", formData.price);
        data.append("quotationDeadline", formData.quotationDeadline);
        data.append("vendorCode", formData.vendorCode);
        data.append("vendorName", formData.vendorName);

        data.append("deliveryDate", formData.deliveryDate);
        if (formData.document) {
          data.append("document", formData.document); // 👈 Append file
        }

        const res = await axios.post("http://localhost:5000/api/rfq", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert(`RFQ Created: ${res.data.rfqNumber}`);
      }

    } catch (err) {
      console.error("RFQ operation failed", err);
      alert("Something went wrong");
    }
  };

  const handleEdit = (rfq) => {
    setFormData({ ...rfq });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this RFQ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/rfq/${id}`);
        setRfqList(rfqList.filter((rfq) => rfq.id !== id));
      } catch (err) {
        console.error("Failed to delete RFQ", err);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
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
        <Navbar />
      </div>

      <div
        className="position-fixed border-end"
        style={{ top: "70px", bottom: 0, left: 0, width: "250px", background: "#f8f9fa" }}
      >
        <PurchaseSidebar />
      </div>

      <div className="container" style={{ marginLeft: "270px", paddingTop: "100px", maxWidth: "1250px" }}>
        <div className="card shadow border-0 p-4">
          <h4 className="text-center mb-4 text-dark">Request for Quotation (RFQ)</h4>

          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label">Product Code <span className="text-danger">*</span></label>
              <select
                name="productCode"
                className="form-select"
                value={formData.productCode}
                onChange={handleProductSelect}
              >
                <option value="">Select</option>
                {productList.map((p) => (
                  <option key={p.id} value={p.productCode}>
                    {p.productCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Product Description</label>
              <input
                type="text"
                name="productDescription"
                className="form-control"
                value={formData.productDescription}
                readOnly
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">UOM</label>
              <input
                type="text"
                name="uom"
                className="form-control"
                value={formData.uom}
                readOnly
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Price (Vendor Quote)</label>
              <input
                type="number"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                min="0"
              />
              <small className="text-muted">Auto-filled. Editable.</small>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Vendor Code <span className="text-danger">*</span></label>
              <select
                name="vendorCode"
                className="form-select"
                value={formData.vendorCode}
                onChange={handleVendorSelect}
              >
                <option value="">Select</option>
                {vendorList.map((vendor) => (
                  <option key={vendor.id} value={vendor.vendorCode}>
                    {vendor.vendorCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Vendor Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.vendorName}
                readOnly
              />
            </div>
          </div>


          <div className="row g-3 mb-4">
            <div className="col-md-2">
              <label className="form-label">Quantity <span className="text-danger">*</span></label>
              <input
                type="number"
                name="quantity"
                className="form-control"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Quotation Deadline <span className="text-danger">*</span></label>
              <input
                type="date"
                name="quotationDeadline"
                className="form-control"
                value={formData.quotationDeadline}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Upload Document</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) =>
                  setFormData({ ...formData, document: e.target.files[0] })
                }
              />
            </div>


            <div className="col-md-4">
              <label className="form-label">Delivery Date <span className="text-danger">*</span></label>
              <input
                type="date"
                name="deliveryDate"
                className="form-control"
                value={formData.deliveryDate}
                onChange={handleChange}
              />
            </div>
          </div>


          <div className="text-center">
            <button className="btn btn-secondary px-4 me-3" onClick={handleCreate}>
              {formData.id ? "Update RFQ" : "Create RFQ"}
            </button>
            <button className="btn btn-outline-secondary px-4" onClick={() => alert("Change functionality coming soon!")}>Change</button>
          </div>
        </div>

        <div className="mt-5">
          <h5 className="mb-3 text-center text-dark">Submitted RFQs</h5>

          {rfqList.length === 0 ? (
            <p className="text-center text-muted">No RFQs created yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover shadow-sm">
                <thead className="table-secondary text-center">
                  <tr>
                    <th>#</th>
                    <th>RFQ Number</th>
                    <th>Product Code</th>
                    <th>Description</th>
                    <th>UOM</th>
                    <th>Quantity</th>
                    <th>Vendor Quote</th>
                    <th>Quotation Deadline</th>
                    <th>Delivery Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {rfqList.map((rfq, index) => (
                    <tr key={rfq.id}>
                      <td>{index + 1}</td>
                      <td>{rfq.rfqNumber}</td>
                      <td>{rfq.productCode}</td>
                      <td>{rfq.productDescription}</td>
                      <td>{rfq.uom}</td>
                      <td>{rfq.quantity}</td>
                      <td>{rfq.price}</td>
                      <td>{formatDate(rfq.quotationDeadline)}</td>
                      <td>{formatDate(rfq.deliveryDate)}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(rfq)}>Edit</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDelete(rfq.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RFQ;
