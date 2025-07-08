import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assests/logo.png";

function VendorLogin() {
  const [form, setForm] = useState({ vendorCode: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/vendor-login", form);
      const { token, user } = res.data;

      if (user.role !== "Vendor") {
        toast.error("Unauthorized access", { position: "top-center", transition: Zoom });
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("vendorCode", user.vendorCode);
      localStorage.setItem("userName", user.name);

      toast.success(`Welcome ${user.name}`, {
        position: "top-center",
        autoClose: 3000,
        transition: Zoom,
      });

      setTimeout(() => navigate("/vendor-response"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        position: "top-center",
        autoClose: 3000,
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

        <h4 style={{ marginBottom: "2rem", fontWeight: "600" }}>Vendor Login</h4>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="vendorCode"
            placeholder="Enter Vendor Code"
            onChange={handleChange}
            className="form-control mb-3"
            required
            style={{ borderRadius: "10px", fontSize: "0.95rem" }}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="form-control mb-3"
            required
            style={{ borderRadius: "10px", fontSize: "0.95rem" }}
          />

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
      </div>
      <ToastContainer />
    </div>
  );
}

export default VendorLogin;
