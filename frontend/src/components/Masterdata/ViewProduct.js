import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewProduct = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const product = state || {};

  const formatLabel = (label) =>
    label.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">📄 Product Document</h3>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {Object.entries(product).map(([key, value], idx) => (
            <div
              className={`row py-2 ${idx % 2 === 0 ? "bg-light" : ""}`}
              key={key}
              style={{ borderBottom: "1px solid #eee" }}
            >
              <div className="col-md-4 fw-semibold text-capitalize">
                {formatLabel(key)}
              </div>
              <div className="col-md-8 text-muted">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
