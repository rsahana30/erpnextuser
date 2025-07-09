import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import PurchaseSidebar from "./PurchaseSidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const RFQ = () => {
  const [productList, setProductList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [productListState, setProductListState] = useState([
    { productCode: "", productDescription: "", uom: "", price: "", quantity: "" },
  ]);
  const [vendorListState, setVendorListState] = useState([
    { vendorCode: "", vendorName: "" },
  ]);
  const [formData, setFormData] = useState({
    quotationDeadline: "",
    deliveryDate: "",
    document: null,
  });
  const [rfqList, setRfqList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products").then((res) => setProductList(res.data));
    axios.get("http://localhost:5000/api/getvendor").then((res) => setVendorList(res.data));
    axios.get("http://localhost:5000/api/rfqs").then((res) => setRfqList(res.data));
  }, []);

  const handleProductChange = (index, field, value) => {
    const updated = [...productListState];
    updated[index][field] = value;
    if (field === "productCode") {
      const product = productList.find((p) => p.productCode === value);
      if (product) {
        updated[index].productDescription = product.description || "";
        updated[index].uom = product.uom || "";
        updated[index].price = product.unitPrice || "";
      }
    }
    setProductListState(updated);
  };

  const handleVendorChange = (index, field, value) => {
    const updated = [...vendorListState];
    updated[index][field] = value;
    if (field === "vendorCode") {
      const vendor = vendorList.find((v) => v.vendorCode === value);
      if (vendor) {
        updated[index].vendorName = vendor.vendorName || "";
      }
    }
    setVendorListState(updated);
  };

  const addProductRow = () => {
    setProductListState([...productListState, { productCode: "", productDescription: "", uom: "", price: "", quantity: "" }]);
  };

  const addVendorRow = () => {
    setVendorListState([...vendorListState, { vendorCode: "", vendorName: "" }]);
  };

  const handleCreate = async () => {
    const { quotationDeadline, deliveryDate } = formData;

    const missingProducts = productListState.some(p => !p.productCode);
    const missingVendors = vendorListState.some(v => !v.vendorCode);

    if (!quotationDeadline || !deliveryDate) {
      toast.error("Quotation deadline and delivery date are required");
      return;
    }
    if (missingProducts) {
      toast.error("Please select a product for all rows");
      return;
    }
    if (missingVendors) {
      toast.error("Please select a vendor for all rows");
      return;
    }

    const form = new FormData();
    form.append("quotationDeadline", quotationDeadline);
    form.append("deliveryDate", deliveryDate);
    if (formData.document) form.append("document", formData.document);
    form.append("products", JSON.stringify(productListState));
    form.append("vendors", JSON.stringify(vendorListState));

    try {
      const res = await axios.post("http://localhost:5000/api/rfq", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("RFQ Created: " + res.data.rfqNumber);
      setRfqList([...rfqList, ...res.data.savedRfqs]);
    } catch (err) {
      console.error("Failed to create RFQ", err);
      toast.error("Something went wrong");
    }
  };

  const handleEditClick = (rfq) => {
    setEditFormData({ ...rfq });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    const formattedDeadline = new Date(editFormData.quotationDeadline).toISOString().slice(0, 10);
    const formattedDelivery = new Date(editFormData.deliveryDate).toISOString().slice(0, 10);

    const form = new FormData();
    form.append("quotationDeadline", formattedDeadline);
    form.append("deliveryDate", formattedDelivery);
    if (editFormData.document instanceof File) {
      form.append("document", editFormData.document);
    }

    try {
      await axios.put(`http://localhost:5000/api/rfq/${editFormData.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await axios.get("http://localhost:5000/api/rfqs");
      setRfqList(res.data);
      setEditModalOpen(false);
      toast.success("RFQ Updated Successfully");
    } catch (err) {
      console.error("Error updating RFQ", err);
      toast.error("Update failed");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB");
  };

  return (
    <>
      <Navbar />
      <div className="d-flex">
        <PurchaseSidebar />
        <div className="container mt-4">
          <div className="card shadow-sm p-4 rounded-4 border">
            <h4 className="text-center mb-4 text-dark fw-bold">Create Request for Quotation (RFQ)</h4>

            {/* Product Section */}
            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">Product Details</h6>
            {productListState.map((row, index) => (
              <div className="row g-3 mb-2 align-items-end" key={`product-${index}`}>
                <div className="col-md-2">
                  <label className="form-label">Product Code</label>
                  <select className={`form-select ${!row.productCode ? "is-invalid" : ""}`} value={row.productCode} onChange={(e) => handleProductChange(index, "productCode", e.target.value)}>
                    <option value="">Select</option>
                    {productList.map((p) => (
                      <option key={p.productCode} value={p.productCode}>{p.productCode}</option>
                    ))}
                  </select>
                  {!row.productCode && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Description</label>
                  <input className="form-control" value={row.productDescription} readOnly />
                </div>
                <div className="col-md-1">
                  <label className="form-label">UOM</label>
                  <input className="form-control" value={row.uom} readOnly />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Price</label>
                  <input type="number" className="form-control" value={row.price} onChange={(e) => handleProductChange(index, "price", e.target.value)} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-control" value={row.quantity} onChange={(e) => handleProductChange(index, "quantity", e.target.value)} />
                </div>
              </div>
            ))}
            <div className="text-end mb-3">
              <button className="btn btn-sm btn-outline-primary" onClick={addProductRow}>+ Add Product</button>
            </div>

            {/* Vendor Section */}
            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">Vendor Details</h6>
            {vendorListState.map((row, index) => (
              <div className="row g-3 mb-2 align-items-end" key={`vendor-${index}`}>
                <div className="col-md-3">
                  <label className="form-label">Vendor Code</label>
                  <select className={`form-select ${!row.vendorCode ? "is-invalid" : ""}`} value={row.vendorCode} onChange={(e) => handleVendorChange(index, "vendorCode", e.target.value)}>
                    <option value="">Select</option>
                    {vendorList.map((v) => (
                      <option key={v.vendorCode} value={v.vendorCode}>{v.vendorCode}</option>
                    ))}
                  </select>
                  {!row.vendorCode && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Vendor Name</label>
                  <input className="form-control" value={row.vendorName} readOnly />
                </div>
              </div>
            ))}
            <div className="text-end mb-3">
              <button className="btn btn-sm btn-outline-primary" onClick={addVendorRow}>+ Add Vendor</button>
            </div>

            {/* RFQ Metadata */}
            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">RFQ Metadata</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Quotation Deadline</label>
                <input type="date" className={`form-control ${!formData.quotationDeadline ? "is-invalid" : ""}`} value={formData.quotationDeadline} onChange={(e) => setFormData({ ...formData, quotationDeadline: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Delivery Date</label>
                <input type="date" className={`form-control ${!formData.deliveryDate ? "is-invalid" : ""}`} value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Upload Document</label>
                <input type="file" className="form-control" onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })} />
              </div>
            </div>

            <div className="text-center mt-4">
              <button className="btn btn-dark px-5" onClick={handleCreate}>Submit RFQ</button>
            </div>
          </div>

          {/* RFQ List */}
          <div className="mt-5">
            <h5 className="mb-3 text-center text-dark">Submitted RFQs</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped text-center">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>RFQ Number</th>
                    <th>Product Code</th>
                    <th>Description</th>
                    <th>UOM</th>
                    <th>Quantity</th>
                    <th>Vendor</th>
                    <th>Price</th>
                    <th>Deadline</th>
                    <th>Delivery</th>
                    <th>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqList.map((rfq, i) => (
                    <tr key={rfq.id}>
                      <td>{i + 1}</td>
                      <td>
                        <button className="btn btn-link p-0" onClick={() => handleEditClick(rfq)}>{rfq.rfqNumber}</button>
                      </td>
                      <td>{rfq.productCode}</td>
                      <td>{rfq.productDescription}</td>
                      <td>{rfq.uom}</td>
                      <td>{rfq.quantity}</td>
                      <td>{rfq.vendorName}</td>
                      <td>{rfq.price}</td>
                      <td>{formatDate(rfq.quotationDeadline)}</td>
                      <td>{formatDate(rfq.deliveryDate)}</td>
                      <td>{rfq.document ? (<a href={`http://localhost:5000/uploads/${rfq.document}`} target="_blank" rel="noreferrer">View</a>) : ("-")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal (unchanged from previous) */}
          {editModalOpen && editFormData && (
            <div className="modal show fade d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit RFQ - {editFormData.rfqNumber}</h5>
                    <button type="button" className="btn-close" onClick={() => setEditModalOpen(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="row g-3 mb-2">
                      <div className="col-md-6">
                        <label>Quotation Deadline</label>
                        <input type="date" className="form-control" value={editFormData.quotationDeadline?.substring(0, 10)} onChange={(e) => setEditFormData({ ...editFormData, quotationDeadline: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label>Delivery Date</label>
                        <input type="date" className="form-control" value={editFormData.deliveryDate?.substring(0, 10)} onChange={(e) => setEditFormData({ ...editFormData, deliveryDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label>Upload Document (Optional)</label>
                      <input type="file" className="form-control" onChange={(e) => setEditFormData({ ...editFormData, document: e.target.files[0] })} />
                      {editFormData.document && !(editFormData.document instanceof File) && (
                        <div className="mt-2">
                          Current: <a href={`http://localhost:5000/uploads/${editFormData.document}`} target="_blank" rel="noreferrer">View Document</a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast Container */}
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </div>
      </div>
    </>
  );
};

export default RFQ;
