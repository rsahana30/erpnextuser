import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/login", form);


      // Store token and user name
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);

      toast.success(`Welcome ${res.data.user.name}!`, {
        position: "top-center",
        autoClose: 3000,
        transition: Zoom,
      });

      setTimeout(() => navigate("/home"), 2500);
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
          backgroundColor: "#000",
          width: "50px",
          height: "50px",
          borderRadius: "8px",
          margin: "0 auto 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.3rem"
        }}>
          E
        </div>

        <h4 style={{ marginBottom: "2rem", fontWeight: "600" }}>Login to ERP</h4>

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
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
