import React, { useState, useEffect } from "react";
import axios from "axios";

const ApprovalMatrix = () => {
  const [form, setForm] = useState({
    productGroup: "",
    controller: "",
    location: "",
    department: "",
    rangeFrom: "",
    rangeTo: "",
    currency: "",
  });

  const [numApprovers, setNumApprovers] = useState(1);
  const [selectedApprovers, setSelectedApprovers] = useState([""]);
  const [approvers, setApprovers] = useState([]);
  const [matrixList, setMatrixList] = useState([]);

  const currencies = ["INR", "USD", "EUR", "JPY"];
  const departments = ["Procurement", "Sales", "Finance"];
  const productGroups = ["Raw Material", "Semi Finished", "Finished", "Traded"];
  const controllers = ["John", "Priya", "Rahul"];
  const locations = ["Bangalore", "Chennai", "Mumbai"];

  useEffect(() => {
    axios.get("http://localhost:5000/api/getApprovers")
      .then((res) => {
        console.log("Approvers:", res.data);
        setApprovers(res.data);
      })
      .catch((err) => console.error("Error fetching approvers", err));

    fetchMatrix();
  }, []);

  const fetchMatrix = () => {
    axios.get("http://localhost:5000/api/getApprovalMatrix")
      .then((res) => setMatrixList(res.data))
      .catch((err) => console.error("Error fetching matrix", err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApproverChange = (index, value) => {
    const updated = [...selectedApprovers];
    updated[index] = value;
    setSelectedApprovers(updated);
  };

  const handleNumApproversChange = (e) => {
    const count = parseInt(e.target.value);
    setNumApprovers(count);
    setSelectedApprovers((prev) => {
      const updated = [...prev];
      while (updated.length < count) updated.push("");
      return updated.slice(0, count);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      approvalName: selectedApprovers.filter(Boolean).join(", "),
    };

    try {
      await axios.post("http://localhost:5000/api/saveApprovalMatrix", payload);
      alert("Matrix saved");
      fetchMatrix();
      setForm({
        productGroup: "",
        controller: "",
        location: "",
        department: "",
        rangeFrom: "",
        rangeTo: "",
        currency: "",
      });
      setNumApprovers(1);
      setSelectedApprovers([""]);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4 fw-bold">Approval Matrix</h4>

      <form className="row g-3" onSubmit={handleSubmit}>
        {[{ label: "Product Group", name: "productGroup", options: productGroups },
          { label: "Controller", name: "controller", options: controllers },
          { label: "Location", name: "location", options: locations },
          { label: "Department", name: "department", options: departments },
          { label: "Currency", name: "currency", options: currencies }
        ].map(({ label, name, options }) => (
          <div className="col-md-4" key={name}>
            <label className="form-label fw-semibold">{label}</label>
            <select
              className="form-select"
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {options.map((o, i) => (
                <option key={i} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}

        <div className="col-md-2">
          <label className="form-label fw-semibold">Range From</label>
          <input type="number" className="form-control" name="rangeFrom" value={form.rangeFrom} onChange={handleChange} required />
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">Range To</label>
          <input type="number" className="form-control" name="rangeTo" value={form.rangeTo} onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">Number of Approvers</label>
          <select className="form-select" value={numApprovers} onChange={handleNumApproversChange}>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          {[...Array(numApprovers)].map((_, idx) => (
            <div key={idx} className="mt-2">
              <label className="form-label">Approver {idx + 1}</label>
              <select
                className="form-select"
                value={selectedApprovers[idx] || ""}
                onChange={(e) => handleApproverChange(idx, e.target.value)}
                required
              >
                <option value="">Select Approver</option>
                {approvers.map((user) => (
                  <option key={user.id} value={user.name}>{user.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-success mt-3">
            Save Matrix Entry
          </button>
        </div>
      </form>

      <h5 className="mt-5">Approval Matrix List</h5>
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Product Group</th>
              <th>Controller</th>
              <th>Location</th>
              <th>Department</th>
              <th>Range</th>
              <th>Currency</th>
              <th>Approval Name(s)</th>
            </tr>
          </thead>
          <tbody>
            {matrixList.map((m, i) => (
              <tr key={m.id}>
                <td>{i + 1}</td>
                <td>{m.productGroup}</td>
                <td>{m.controller}</td>
                <td>{m.location}</td>
                <td>{m.department}</td>
                <td>₹{m.rangeFrom} - ₹{m.rangeTo}</td>
                <td>{m.currency}</td>
                <td>{m.approvalName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalMatrix;
