import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "bootstrap/js/dist/modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "../Navbar";
import MasterDataSidebar from "./MasterDataSidebar";

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    plantType: "",
    state: "",
  });

  const [formInputs, setFormInputs] = useState({
    locationCode: "",
    locationName: "",
    country: "",
    plantType: "",
    address: "",
    state: "",
    pinCode: "",
    gstcode: "",
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  const defaultDropdowns = {
    countries: ["India", "Europe", "China", "Thailand", "Dubai"],
    plantTypes: ["Manufacturing", "Warehouse", "Office", "R&D"],
    states: ["Karnataka", "Maharashtra", "Tamil Nadu", "Delhi"],
  };

  const [dropdownOptions, setDropdownOptions] = useState(defaultDropdowns);

  const dropdownKeyMap = {
    country: "countries",
    plantType: "plantTypes",
    state: "states",
  };

  const fetchLocations = () => {
    axios
      .get("http://localhost:5000/api/getlocation")
      .then((res) => {
        setLocations(res.data);

        const extractUnique = (key) =>
          [...new Set(res.data.map((item) => item[key]?.trim()).filter(Boolean))];

        const mergeDropdowns = (key) =>
          [...new Set([...defaultDropdowns[key], ...extractUnique(key)])];

        setDropdownOptions({
          countries: mergeDropdowns("countries"),
          states: mergeDropdowns("states"),
          plantTypes: defaultDropdowns.plantTypes, // already fixed
        });
      })
      .catch((err) => console.error("Error fetching locations:", err));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleInputChange = (e) =>
    setFormInputs({ ...formInputs, [e.target.name]: e.target.value });

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/saveLocation", formInputs)
      .then(() => {
        alert("Location saved!");
        fetchLocations();
        document.getElementById("closeLocationModalBtn").click();
      })
      .catch((err) => {
        console.error("Save error:", err);
        alert("Failed to save.");
      });
  };

  const handleCreateClick = () => {
    setFormInputs({
      locationCode: "",
      locationName: "",
      country: "",
      plantType: "",
      address: "",
      state: "",
      pinCode: "",
      gstcode: "",
    });
    new Modal(document.getElementById("createLocationModal")).show();
  };

  const formatLabel = (key) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (c) => c.toUpperCase());

  const filteredLocations = locations.filter(
    (loc) =>
      (!filters.country || loc.country === filters.country) &&
      (!filters.state || loc.state === filters.state) &&
      (!filters.plantType || loc.plantType === filters.plantType)
  );

  return (
    <div>
      <div className="fixed-top bg-white" style={{ height: "70px", zIndex: 1000 }}>
        <Navbar />
      </div>

      <div
        className="position-fixed"
        style={{ top: "70px", bottom: 0, left: 0, width: "250px", background: "#fff", marginLeft: "15px" }}
      >
        <MasterDataSidebar />
      </div>

      <div style={{ marginLeft: "270px", marginTop: "70px", padding: "1rem", backgroundColor: "#f9f9f9" }}>
        <div className="container">
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primary" onClick={handleCreateClick}>
              Create Location
            </button>
          </div>

          {/* Filters */}
          <div className="d-flex gap-3 flex-wrap mb-4">
            {Object.keys(filters).map((field) => (
              <div key={field}>
                <label>{formatLabel(field)}</label>
                <select
                  name={field}
                  value={filters[field]}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Select</option>
                  {dropdownOptions[dropdownKeyMap[field]]?.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Location Code</th>
                <th>Location Name</th>
                <th>Country</th>
                <th>State</th>
                <th>GST Code</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((loc, idx) => (
                <tr key={idx}>
                  <td>{loc.locationCode}</td>
                  <td>{loc.locationName}</td>
                  <td>{loc.country}</td>
                  <td>{loc.state}</td>
                  <td>{loc.gstcode}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        setSelectedLocation(loc);
                        new Modal(document.getElementById("viewLocationModal")).show();
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

        {/* Create Modal */}
        <div className="modal fade" id="createLocationModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Create Location</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeLocationModalBtn"></button>
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
                          {dropdownOptions[dropdownKeyMap[key]]?.map((opt, idx) => (
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

        {/* View Modal */}
        <div className="modal fade" id="viewLocationModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Location Details</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                {selectedLocation ? (
                  <div className="bg-light p-3 rounded">
                    {Object.entries(selectedLocation).map(([key, val]) => (
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

export default Location;
