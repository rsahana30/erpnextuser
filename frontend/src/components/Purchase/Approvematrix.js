import React, { useEffect, useState } from "react";
import axios from "axios";

const ApprovalMatrix = () => {
  const [form, setForm] = useState({
    productCode: "",
    productDescription: "",
    uom: "",
    currency: "",
    approver1: "",
    approver1From: "",
    approver1To: "",
    approver2: "",
    approver2From: "",
    approver2To: "",
    approver3: "",
    approver3From: "",
    approver3To: ""
  });

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [matrixList, setMatrixList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error loading users:", err));

    axios.get("http://localhost:5000/api/approval-matrix")
      .then(res => setMatrixList(res.data))
      .catch(err => console.error("Error loading matrix:", err));

    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error loading products:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProductSelect = (e) => {
    const selectedCode = e.target.value;
    const product = products.find(p => p.productCode === selectedCode);

    setForm({
      ...form,
      productCode: selectedCode,
      productDescription: product?.description || "",
      uom: product?.uom || "",
      currency: product?.currency || ""
    });
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/approval-matrix", form)
      .then(() => {
        alert("Matrix saved successfully");
        window.location.reload();
      })
      .catch(err => {
        console.error("Error saving matrix:", err);
        alert("Save failed");
      });
  };

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Approval Matrix Configuration</h3>

      {/* Product Info */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Select Product</div>
        <div className="card-body row g-3">
          <div className="col-md-4">
            <label className="form-label">Product Code</label>
            <select
              className="form-select"
              name="productCode"
              value={form.productCode}
              onChange={handleProductSelect}
            >
              <option value="">Select Product</option>
              {products.map((p, idx) => (
                <option key={idx} value={p.productCode}>
                  {p.productCode}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Product Description</label>
            <input
              className="form-control"
              name="productDescription"
              value={form.productDescription}
              readOnly
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">UOM</label>
            <input
              className="form-control"
              name="uom"
              value={form.uom}
              readOnly
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Currency</label>
            <input
              className="form-control"
              name="currency"
              value={form.currency}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Approver Levels */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Set Approvers & Ranges</div>
        <div className="card-body">
          {[1, 2, 3].map((num) => (
            <div className="row g-3 align-items-end mb-3" key={num}>
              <div className="col-md-4">
                <label className="form-label">Approver {num}</label>
                <select
                  className="form-select"
                  name={`approver${num}`}
                  value={form[`approver${num}`]}
                  onChange={handleChange}
                >
                  <option value="">Select Approver</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Range From</label>
                <input
                  type="number"
                  className="form-control"
                  name={`approver${num}From`}
                  value={form[`approver${num}From`]}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Range To</label>
                <input
                  type="number"
                  className="form-control"
                  name={`approver${num}To`}
                  value={form[`approver${num}To`]}
                  onChange={handleChange}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-end mb-5">
        <button className="btn btn-success px-4" onClick={handleSubmit}>
          Save Matrix
        </button>
      </div>

      {/* Approval Matrix Table */}
      <div className="card">
        <div className="card-header fw-bold">Existing Approval Matrix</div>
        <div className="card-body table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-light">
              <tr>
                <th>Product Code</th>
                <th>Description</th>
                <th>UOM</th>
                <th>Currency</th>
                <th>Approver 1</th>
                <th>Range 1</th>
                <th>Approver 2</th>
                <th>Range 2</th>
                <th>Approver 3</th>
                <th>Range 3</th>
              </tr>
            </thead>
            <tbody>
              {matrixList.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.productCode}</td>
                  <td>{row.productDescription}</td>
                  <td>{row.uom}</td>
                  <td>{row.currency}</td>
                  <td>{row.approver1}</td>
                  <td>{row.approver1From} - {row.approver1To}</td>
                  <td>{row.approver2}</td>
                  <td>{row.approver2From} - {row.approver2To}</td>
                  <td>{row.approver3}</td>
                  <td>{row.approver3From} - {row.approver3To}</td>
                </tr>
              ))}
              {matrixList.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center text-muted">
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalMatrix;
