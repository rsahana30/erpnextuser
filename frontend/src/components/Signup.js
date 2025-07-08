import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assests/logo.png';

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    vendorCode: ''
  });

  const [vendorOptions, setVendorOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const roles = [
    'Requestor', 'Approver', 'PurchaseOfficer',
    'Storekeeper', 'Vendor', 'Finance', 'Admin', 'Controller'
  ];

  useEffect(() => {
    // Fetch vendor codes on mount
    axios.get("http://localhost:5000/api/getvendor")
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setVendorOptions(res.data);
        }
      })
      .catch(err => console.error("Failed to fetch vendor codes", err));
  }, []);

  const validate = (fieldValues = form) => {
    const temp = { ...errors };

    if ('name' in fieldValues) {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!fieldValues.name.trim()) temp.name = 'Name is required';
      else if (!nameRegex.test(fieldValues.name)) temp.name = 'Only alphabets allowed';
      else if (fieldValues.name.trim().length < 3) temp.name = 'Minimum 3 characters';
      else temp.name = '';
    }

    if ('email' in fieldValues) {
      if (!fieldValues.email) temp.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValues.email)) temp.email = 'Invalid email';
      else temp.email = '';
    }

    if ('password' in fieldValues) {
      temp.password = fieldValues.password.length >= 6 ? '' : 'Minimum 6 characters';
    }

    if ('confirmPassword' in fieldValues) {
      temp.confirmPassword = fieldValues.confirmPassword === form.password ? '' : 'Passwords do not match';
    }

    if ('role' in fieldValues) {
      temp.role = fieldValues.role ? '' : 'Select a role';
    }

    if (form.role === 'Vendor' && 'vendorCode' in fieldValues) {
      temp.vendorCode = fieldValues.vendorCode ? '' : 'Select a vendor code';
    }

    setErrors({ ...temp });
  };

  const isValid = () =>
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.role &&
    (form.role !== 'Vendor' || form.vendorCode) &&
    Object.values(errors).every(x => x === '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setTouched({ ...touched, [name]: true });
    validate({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === 'Vendor' && { vendorCode: form.vendorCode })
      };

      const res = await axios.post('http://localhost:5000/api/signup', payload);

      toast.success(res.data.message || "Signup successful", {
        position: "top-center",
        autoClose: 3000,
        transition: Zoom,
      });

      setTimeout(() => navigate(form.role === 'Vendor' ? '/vendor-login' : '/login'), 2500);

    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed", {
        position: "top-center",
        autoClose: 4000,
        transition: Zoom,
      });
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
        maxWidth: "420px",
        textAlign: "center"
      }}>
        <div style={{ width: "200px", height: "70px", margin: "0 auto 1.5rem", overflow: "hidden" }}>
          <img src={logo} alt="ERP Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <h4 className="mb-4 fw-semibold">Create an Account</h4>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            className={`form-control mb-3 ${touched.name && errors.name ? 'is-invalid' : ''}`}
          />
          {touched.name && errors.name && <div className="invalid-feedback">{errors.name}</div>}

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className={`form-control mb-3 ${touched.email && errors.email ? 'is-invalid' : ''}`}
          />
          {touched.email && errors.email && <div className="invalid-feedback">{errors.email}</div>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={`form-control mb-3 ${touched.password && errors.password ? 'is-invalid' : ''}`}
          />
          {touched.password && errors.password && <div className="invalid-feedback">{errors.password}</div>}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`form-control mb-3 ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
          />
          {touched.confirmPassword && errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={`form-control mb-3 ${touched.role && errors.role ? 'is-invalid' : ''}`}
          >
            <option value="">Select Role</option>
            {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
          </select>
          {touched.role && errors.role && <div className="invalid-feedback">{errors.role}</div>}

          {form.role === "Vendor" && (
            <>
              <select
                name="vendorCode"
                value={form.vendorCode}
                onChange={handleChange}
                className={`form-control mb-3 ${touched.vendorCode && errors.vendorCode ? 'is-invalid' : ''}`}
              >
                <option value="">Select Vendor Code</option>
                {vendorOptions.map((v, idx) => (
                  <option key={idx} value={v.vendorCode}>{v.vendorCode}</option>
                ))}
              </select>
              {touched.vendorCode && errors.vendorCode && <div className="invalid-feedback">{errors.vendorCode}</div>}
            </>
          )}

          <button
            type="submit"
            disabled={!isValid()}
            className="btn w-100 py-2"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "500",
              fontSize: "1rem"
            }}
          >
            Sign Up
          </button>

          <div className="text-center mt-3" style={{ fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: "black" }}>
              Login
            </Link>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Signup;
