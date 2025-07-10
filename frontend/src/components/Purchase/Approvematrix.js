import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ApprovalMatrix = () => {
  const [department, setDepartment] = useState("");
  const [currency, setCurrency] = useState("");
  const [levels, setLevels] = useState([
    { level: 1, rangeFrom: "", rangeTo: "", approvers: [""] }
  ]);
  const [allUsers, setAllUsers] = useState([]);
  const [savedMatrices, setSavedMatrices] = useState([]);

  const departments = ["Finance", "HR", "Sales", "IT", "Logistics"];
  const currencies = ["INR", "USD", "EUR"];

  useEffect(() => {
    axios.get("http://localhost:5000/api/users")
      .then((res) => setAllUsers(res.data))
      .catch((err) => console.error("User fetch error:", err));
  }, []);

  const fetchSavedMatrices = () => {
    axios.get("http://localhost:5000/api/approval-matrix")
      .then((res) => setSavedMatrices(res.data))
      .catch((err) => console.error("Matrix fetch error:", err));
  };

  useEffect(() => {
    fetchSavedMatrices();
  }, []);

  const handleLevelChange = (index, field, value) => {
    const updated = [...levels];
    updated[index][field] = value;
    setLevels(updated);
  };

  const handleApproverChange = (levelIndex, approverIndex, value) => {
    const updated = [...levels];
    updated[levelIndex].approvers[approverIndex] = value;
    setLevels(updated);
  };

  const addApproverToLevel = (levelIndex) => {
    const updated = [...levels];
    updated[levelIndex].approvers.push("");
    setLevels(updated);
  };

  const addLevel = () => {
    setLevels([
      ...levels,
      { level: levels.length + 1, rangeFrom: "", rangeTo: "", approvers: [""] },
    ]);
  };

  const handleSubmit = async () => {
    if (!department || !currency) {
      alert("Department and Currency are required.");
      return;
    }

    try {
      const payload = { department, currency, levels };
      await axios.post("http://localhost:5000/api/approval-matrix", payload);
      alert("✅ Matrix saved successfully!");
      setDepartment("");
      setCurrency("");
      setLevels([{ level: 1, rangeFrom: "", rangeTo: "", approvers: [""] }]);
      fetchSavedMatrices();
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ Failed to save matrix");
    }
  };

  const handleDelete = async (matrixId) => {
    if (!window.confirm("Are you sure you want to delete this matrix?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/approval-matrix/${matrixId}`);
      fetchSavedMatrices();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete matrix");
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-dark border-bottom pb-2">📋 Approval Matrix Setup</h2>

      {/* Matrix Form */}
      <div className="card shadow p-4 mb-4">
        <h5 className="mb-3 text-dark">Matrix Details</h5>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">-- Select Department --</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Currency</label>
            <select
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="">-- Select Currency --</option>
              {currencies.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <h6 className="text-muted mb-2">Approver Levels</h6>
        {levels.map((level, levelIndex) => (
          <div key={levelIndex} className="border rounded bg-light p-3 mb-3">
            <h6 className="text-secondary">Level {level.level}</h6>
            <div className="row g-3 mb-2">
              <div className="col-md-3">
                <label className="form-label">Range From</label>
                <input
                  type="number"
                  className="form-control"
                  value={level.rangeFrom}
                  onChange={(e) =>
                    handleLevelChange(levelIndex, "rangeFrom", e.target.value)
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Range To</label>
                <input
                  type="number"
                  className="form-control"
                  value={level.rangeTo}
                  onChange={(e) =>
                    handleLevelChange(levelIndex, "rangeTo", e.target.value)
                  }
                />
              </div>
            </div>

            <label className="form-label">Approvers</label>
            {level.approvers.map((approver, approverIndex) => (
              <div className="row mb-2" key={approverIndex}>
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={approver}
                    onChange={(e) =>
                      handleApproverChange(levelIndex, approverIndex, e.target.value)
                    }
                  >
                    <option value="">-- Select Approver --</option>
                    {allUsers.map((user, i) => (
                      <option key={i} value={user.name || user.username}>
                        {user.name || user.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <button
              className="btn btn-sm btn-outline-dark mt-2"
              onClick={() => addApproverToLevel(levelIndex)}
            >
              + Add Approver
            </button>
          </div>
        ))}

        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-outline-secondary" onClick={addLevel}>
            + Add Level
          </button>
          <button className="btn btn-secondary" onClick={handleSubmit}>
            ✅ Save Matrix
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {department && currency && (
        <div className="card border-info mb-5 p-4">
          <h5 className="text-info">Live Preview</h5>
          <p>
            <strong>Department:</strong> {department} &nbsp;|&nbsp;
            <strong>Currency:</strong> {currency}
          </p>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Level</th>
                <th>Range From</th>
                <th>Range To</th>
                <th>Approvers</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level, i) => (
                <tr key={i}>
                  <td>Level {level.level}</td>
                  <td>{level.rangeFrom}</td>
                  <td>{level.rangeTo}</td>
                  <td>
                    {level.approvers
                      .filter(Boolean)
                      .map((a, j) => (
                        <span key={j} className="badge bg-primary me-1">{a}</span>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Saved Matrices */}
      {savedMatrices.length > 0 && (
        <div className="card p-4 shadow-sm">
          <h4 className="mb-4 text-dark">🗃️ Saved Matrices</h4>
          {savedMatrices.map((matrix, index) => (
            <div key={index} className="border rounded p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">
                  <strong>Department:</strong> {matrix.department} |{" "}
                  <strong>Currency:</strong> {matrix.currency}
                </h6>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(matrix.matrixId)}
                >
                  Delete
                </button>
              </div>
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Level</th>
                    <th>Range From</th>
                    <th>Range To</th>
                    <th>Approvers</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.levels.map((level, lvlIndex) => (
                    <tr key={lvlIndex}>
                      <td>Level {level.level}</td>
                      <td>{level.rangeFrom}</td>
                      <td>{level.rangeTo}</td>
                      <td>
                        {level.approvers.map((a, i) => (
                          <span key={i} className="badge bg-secondary me-1">
                            {a}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalMatrix;
