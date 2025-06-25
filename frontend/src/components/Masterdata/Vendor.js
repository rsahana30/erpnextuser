import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "bootstrap/js/dist/modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "../Navbar";
import MasterDataSidebar from "./MasterDataSidebar";

const Vendor = () => {
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({ vendorType: "", country: "", state: "" });
  const [formInputs, setFormInputs] = useState({
    vendorCode: "",
    vendorName: "",
    vendorType: "",
    address: "",
    country: "",
    state: "",
    gstcode: "",
  });
  const [selectedVendor, setSelectedVendor] = useState(null);

  const defaultDropdowns = {
    vendorTypes: ["Raw Material", "Service", "Logistics", "Consultant"],
    countries: ["India", "Germany", "USA", "China", "Dubai"],
    states: ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu"],
  };

  const [dropdownOptions, setDropdownOptions] = useState(defaultDropdowns);

  const dropdownKeyMap = {
    vendorType: "vendorTypes",
    country: "countries",
    state: "states",
  };

  const fetchVendors = () => {
    axios
      .get("http://localhost:5000/api/getvendor")
      .then((res) => {
        setVendors(res.data);

        const getUniqueMerged = (key, defaults) => {
          const values = [...res.data.map((v) => v[key]?.trim()).filter(Boolean)];
          return [...new Set([...defaults, ...values])];
        };

        setDropdownOptions({
          vendorTypes: getUniqueMerged("vendorType", defaultDropdowns.vendorTypes),
          countries: getUniqueMerged("country", defaultDropdowns.countries),
          states: getUniqueMerged("state", defaultDropdowns.states),
        });
      })
      .catch((err) => console.error("Error fetching vendors:", err));
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleInputChange = (e) =>
    setFormInputs({ ...formInputs, [e.target.name]: e.target.value });

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const filteredVendors = vendors.filter(
    (v) =>
      (!filters.vendorType || v.vendorType === filters.vendorType) &&
      (!filters.country || v.country === filters.country) &&
      (!filters.state || v.state === filters.state)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/savevendor", formInputs)
      .then(() => {
        alert("Vendor saved successfully!");
        fetchVendors();
        document.getElementById("closeVendorModalBtn").click();
      })
      .catch((err) => {
        console.error("Error saving vendor:", err);
        alert("Failed to save vendor.");
      });
  };

  const handleCreateClick = () => {
    setFormInputs({
      vendorCode: "",
      vendorName: "",
      vendorType: "",
      address: "",
      country: "",
      state: "",
      gstcode: "",
    });
    new Modal(document.getElementById("createVendorModal")).show();
  };

  const formatLabel = (key) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (c) => c.toUpperCase());

  return (
    <div>
      <div className="fixed-top bg-white" style={{ height: "70px", zIndex: 1000 }}>
        <Navbar />
      </div>

      <div
        className="position-fixed"
        style={{
          top: "70px",
          bottom: 0,
          left: 0,
          width: "250px",
          background: "#fff",
          marginLeft: "15px",
        }}
      >
        <MasterDataSidebar />
      </div>

      <div style={{ marginLeft: "270px", marginTop: "70px", padding: "1rem", backgroundColor: "#f9f9f9" }}>
        <div className="container">
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primary" onClick={handleCreateClick}>
              Create Vendor
            </button>
          </div>

          {/* Filters */}
          <div className="d-flex gap-3 flex-wrap mb-4">
            {Object.keys(filters).map((field) => (
              <div key={field}>
                <label className="form-label">{formatLabel(field)}</label>
                <select
                  name={field}
                  value={filters[field]}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Select</option>
                  {dropdownOptions[dropdownKeyMap[field]].map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Table */}
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Vendor Code</th>
                <th>Vendor Name</th>
                <th>Type</th>
                <th>Country</th>
                <th>GST Code</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v, idx) => (
                <tr key={idx}>
                  <td>{v.vendorCode}</td>
                  <td>{v.vendorName}</td>
                  <td>{v.vendorType}</td>
                  <td>{v.country}</td>
                  <td>{v.gstcode}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        setSelectedVendor(v);
                        new Modal(document.getElementById("viewVendorModal")).show();
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Vendor Modal */}
        <div className="modal fade" id="createVendorModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Create Vendor</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  id="closeVendorModalBtn"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {Object.entries(formInputs).map(([key, value]) => (
                    <div className="col-md-4" key={key}>
                      <label className="form-label">{formatLabel(key)}</label>
                      {dropdownKeyMap[key] ? (
                        <select
                          name={key}
                          className="form-select"
                          value={value}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select</option>
                          {dropdownOptions[dropdownKeyMap[key]].map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : key === "address" ? (
                        <textarea
                          name={key}
                          className="form-control"
                          value={value}
                          onChange={handleInputChange}
                          required
                        />
                      ) : (
                        <input
                          name={key}
                          className="form-control"
                          value={value}
                          onChange={handleInputChange}
                          required
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success">Save</button>
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        {/* View Vendor Modal */}
        <div className="modal fade" id="viewVendorModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Vendor Details</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                {selectedVendor ? (
                  <div className="bg-light p-3 rounded">
                    {Object.entries(selectedVendor).map(([key, val]) => (
                      <div className="mb-2" key={key}>
                        <strong>{formatLabel(key)}:</strong> <span className="ms-2">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No data to show</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendor;
