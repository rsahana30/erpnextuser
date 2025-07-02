import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "bootstrap/js/dist/modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar";
import MasterDataSidebar from "./MasterDataSidebar";

const Vendor = () => {
  const [vendors, setVendors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [reconAccounts, setReconAccounts] = useState([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [reconFilter, setReconFilter] = useState("");
  const [form, setForm] = useState({
    supplierNumber: "",
    supplierName: "",
    country: "",
    address: "",
    postalCode: "",
    email: "",
    reconAccount: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [viewVendor, setViewVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
    fetchDropdowns();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [countryRes, reconRes] = await Promise.all([
        axios.get("http://localhost:5000/api/countries"),
        axios.get("http://localhost:5000/api/reconAccounts"),
      ]);
      setCountries(countryRes.data);
      setReconAccounts(reconRes.data);
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModal = () => {
    setForm((prev) => ({
      ...prev,
      country: countryFilter || "",
      reconAccount: reconFilter || "",
    }));
    const modal = new Modal(document.getElementById("vendorModal"));
    modal.show();
  };

  const handleEdit = (vendor) => {
    setForm({ ...vendor });
    setCurrentVendorId(vendor.id);
    setIsEditing(true);
    const modal = new Modal(document.getElementById("vendorModal"));
    modal.show();
  };

  const handleView = (vendor) => {
    setViewVendor(vendor);
    const modal = new Modal(document.getElementById("viewVendorModal"));
    modal.show();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/vendors/${currentVendorId}`,
          form
        );
        toast.success("Vendor updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/vendors", form);
        toast.success("Vendor created successfully");
      }

      fetchVendors();
      resetForm();
      setCountryFilter(""); // Reset filters after save
      setReconFilter("");
    } catch (err) {
      console.error("Error saving vendor", err);
      toast.error("Error saving vendor");
    }
  };

  const resetForm = () => {
    setForm({
      supplierNumber: "",
      supplierName: "",
      country: "",
      address: "",
      postalCode: "",
      email: "",
      reconAccount: "",
    });
    setIsEditing(false);
    setCurrentVendorId(null);
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="container-fluid">
        <div className="row">
          <MasterDataSidebar />
          <div className="col-md-10 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Vendor Master</h4>
              <button className="btn btn-dark" onClick={openModal}>
                Create Vendor
              </button>
            </div>

            {/* Filter Section */}
            <div className="d-flex gap-3 mb-3">
              <div>
                <label><strong>Country:</strong></label>
                <select
                  className="form-control"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="">--Select--</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label><strong>Recon Account:</strong></label>
                <select
                  className="form-control"
                  value={reconFilter}
                  onChange={(e) => setReconFilter(e.target.value)}
                >
                  <option value="">--Select--</option>
                  {reconAccounts.map((r) => (
                    <option key={r.id} value={r.accountCode}>
                      {r.accountCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vendor Modal */}
            <div className="modal fade" id="vendorModal" tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <form className="modal-content" onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {isEditing ? "Edit Vendor" : "Create Vendor"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  <div className="modal-body row g-3">
                    <div className="col-md-6">
                      <label>Supplier Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="supplierNumber"
                        value={form.supplierNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Supplier Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="supplierName"
                        value={form.supplierName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Country</label>
                      <select
                        className="form-control"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        disabled={!!countryFilter && !isEditing}
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label>Recon Account</label>
                      <select
                        className="form-control"
                        name="reconAccount"
                        value={form.reconAccount}
                        onChange={handleChange}
                        disabled={!!reconFilter && !isEditing}
                        required
                      >
                        <option value="">Select Recon Account</option>
                        {reconAccounts.map((r) => (
                          <option key={r.id} value={r.accountCode}>
                            {r.accountCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-dark" type="submit">
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Vendor Table */}
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Supplier Number</th>
                  <th>Supplier Name</th>
                  <th>Country</th>
                  <th>Email</th>
                  <th>Recon Account</th>
                  <th>View</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {vendors
                  .filter((v) => (!countryFilter || v.country === countryFilter) &&
                                 (!reconFilter || v.reconAccount === reconFilter))
                  .map((v) => (
                    <tr key={v.id}>
                      <td>{v.supplierNumber}</td>
                      <td>{v.supplierName}</td>
                      <td>{v.country}</td>
                      <td>{v.email}</td>
                      <td>{v.reconAccount}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleView(v)}
                        >
                          View
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(v)}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* View Vendor Modal */}
            <div className="modal fade" id="viewVendorModal" tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Vendor Details</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  <div className="modal-body">
                    {viewVendor && (
                      <div>
                        <p><strong>Supplier Number:</strong> {viewVendor.supplierNumber}</p>
                        <p><strong>Supplier Name:</strong> {viewVendor.supplierName}</p>
                        <p><strong>Country:</strong> {viewVendor.country}</p>
                        <p><strong>Address:</strong> {viewVendor.address}</p>
                        <p><strong>Postal Code:</strong> {viewVendor.postalCode}</p>
                        <p><strong>Email:</strong> {viewVendor.email}</p>
                        <p><strong>Recon Account:</strong> {viewVendor.reconAccount}</p>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" data-bs-dismiss="modal">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Vendor;
