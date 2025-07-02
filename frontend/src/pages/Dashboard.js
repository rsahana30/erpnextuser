import React from "react";
import roleAccess from "../utils/roleAccessConfig";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const accessibleModules = roleAccess[userRole]?.modules || [];

  return (
    <div style={{ padding: "2rem", fontFamily: "Poppins, sans-serif" }}>
      <h3>Welcome, {userRole}</h3>
      <div className="row mt-4">
        {accessibleModules.map((module, index) => (
          <div
            key={index}
            className="col-md-4 mb-3"
            onClick={() => navigate(`/${module.toLowerCase().replace(/\s+/g, '')}`)}
            style={{
              background: "#f5f5f5",
              padding: "1.5rem",
              borderRadius: "10px",
              cursor: "pointer",
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          >
            <h5>{module}</h5>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
