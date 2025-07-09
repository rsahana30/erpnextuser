import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assests/logo.png";

// ... your imports remain the same

function Login() {
  const [form, setForm] = useState({ email: "", password: "", module: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const moduleOptions = [
    "Master Data", "Order Management", "Logistics Execution",
    "Purchase Management", "Inventory Management", "Stock Transfer",
    "Finance Management", "Assets Management"
  ];

  const routeMap = {
    "Master Data": "/master",
    "Order Management": "/order",
    "Logistics Execution": "/logistics",
    "Purchase Management": "/purchase",
    "Inventory Management": "/inventory",
    "Stock Transfer": "/stock",
    "Finance Management": "/finance",
    "Assets Management": "/assets"
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/login", form);
      const { user, token } = res.data;

      // ❌ Block vendors here
      if (user.role === 'Vendor') {
        toast.error("Vendors must log in from Vendor Login Page", {
          position: "top-center",
          autoClose: 4000,
          transition: Zoom,
        });
        return;
      }

      localStorage.setItem("userName", user.name);
      localStorage.setItem("selectedModule", form.module);
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);
      const vendorCode = localStorage.getItem("vendorCode");


      toast.success(`Welcome ${user.name}!`, {
        position: "top-center",
        autoClose: 3000,
        transition: Zoom,
      });

      const selectedRoute = routeMap[form.module] || "/dashboard";
      setTimeout(() => navigate(selectedRoute), 2500);

    } catch (err) {
      toast.error("Invalid credentials. Try again!", {
        position: "top-center",
        autoClose: 4000,
        transition: Zoom,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#f4f4f4",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Poppins, sans-serif"
    }}>
      <div style={{
        background: "#fff",
        padding: "2.5rem",
        borderRadius: "15px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center"
      }}>
        <div style={{
          width: "200px",
          height: "70px",
          margin: "0 auto 1.5rem",
          overflow: "hidden"
        }}>
          <img src={logo} alt="ERP Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <h4 style={{ marginBottom: "2rem", fontWeight: "600" }}>Enterprise Resource Planning</h4>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="jane@example.com"
            onChange={handleChange}
            className="form-control mb-3"
            required
            style={{ borderRadius: "10px", fontSize: "0.95rem" }}
          />

          <input
            type="password"
            name="password"
            placeholder="••••••••"
            onChange={handleChange}
            className="form-control mb-3"
            required
            style={{ borderRadius: "10px", fontSize: "0.95rem" }}
          />

          <select
            name="module"
            value={form.module}
            onChange={handleChange}
            className="form-control mb-3"
            required
            style={{ borderRadius: "10px", fontSize: "0.95rem" }}
          >
            <option value="">Select Module</option>
            {moduleOptions.map((mod, idx) => (
              <option key={idx} value={mod}>{mod}</option>
            ))}
          </select>

          <div style={{ fontSize: "0.9rem", textAlign: "right" }}>
            <Link to="#" style={{ textDecoration: "none", color: "#555" }}>Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 py-2 mt-3"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "500",
              fontSize: "1rem"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ✅ Vendor login link */}
        <div className="text-center mt-3" style={{ fontSize: "0.9rem" }}>
          Are you a vendor?{" "}
          <Link to="/vendor-login" className="fw-semibold text-decoration-none" style={{ color: "black" }}>
            Login Here
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
