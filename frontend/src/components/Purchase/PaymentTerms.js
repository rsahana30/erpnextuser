import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const PaymentTerms = () => {
  const [products, setProducts] = useState([]);
  const [terms, setTerms] = useState([]);
  const [form, setForm] = useState({
    productCode: "",
    description: "",
    netDays: "",
    payments: [{ days: "", percent: "" }],
  });

  // Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product fetch error:", err));
  }, []);

  // Fetch existing payment terms
  const fetchTerms = () => {
    axios
      .get("http://localhost:5000/api/payment-terms")
      .then((res) => {
        // Parse payments if needed
        const formatted = res.data.map((term) => ({
          ...term,
          payments:
            typeof term.payments === "string"
              ? JSON.parse(term.payments)
              : term.payments,
        }));
        setTerms(formatted);
      })
      .catch((err) => console.error("Payment terms fetch error:", err));
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleProductChange = (e) => {
    const code = e.target.value;
    const selected = products.find((p) => p.productCode === code);
    setForm((prev) => ({
      ...prev,
      productCode: code,
      description: selected?.description || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (index, field, value) => {
    const updatedPayments = [...form.payments];
    updatedPayments[index][field] = value;
    setForm((prev) => ({ ...prev, payments: updatedPayments }));
  };

  const addPaymentTerm = () => {
    setForm((prev) => ({
      ...prev,
      payments: [...prev.payments, { days: "", percent: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productCode) return alert("Please select a product.");

    try {
      await axios.post("http://localhost:5000/api/payment-terms", form);
      alert("✅ Payment terms saved!");
      setForm({
        productCode: "",
        description: "",
        netDays: "",
        payments: [{ days: "", percent: "" }],
      });
      fetchTerms();
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save payment terms.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h3 className="text-dark mb-4">💰 Payment Terms Setup</h3>

      <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Product Code</label>
            <select
              name="productCode"
              value={form.productCode}
              onChange={handleProductChange}
              className="form-select"
              required
            >
              <option value="">-- Select Product --</option>
              {products.map((p, i) => (
                <option key={i} value={p.productCode}>
                  {p.productCode}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Product Description</label>
            <input
              name="description"
              value={form.description}
              className="form-control"
              readOnly
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-3">
            <label className="form-label">🧾 Net Days</label>
            <input
              type="number"
              name="netDays"
              value={form.netDays}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <h5 className="text-secondary mt-3 mb-2">📅 Discount Payment Terms</h5>
        {form.payments.map((pay, i) => (
          <div className="row mb-3" key={i}>
            <div className="col-md-2">
              <label className="form-label">{`Term ${i + 1} Days`}</label>
              <input
                type="number"
                className="form-control"
                value={pay.days}
                onChange={(e) =>
                  handlePaymentChange(i, "days", e.target.value)
                }
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">{`Term ${i + 1} %`}</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={pay.percent}
                onChange={(e) =>
                  handlePaymentChange(i, "percent", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline-secondary mb-3"
          onClick={addPaymentTerm}
        >
          ➕ Add Payment Term
        </button>

        <div>
          <button type="submit" className="btn btn-dark">
            ✅ Save Payment Terms
          </button>
        </div>
      </form>

      {/* Table Display */}
      {terms.length > 0 && (
        <div className="card mt-5 p-4 shadow-sm">
          <h4 className="mb-3 text-success">📋 Existing Payment Terms</h4>
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                <th>Product Code</th>
                {/* <th>Description</th>
                <th>Discount Terms</th> */}
                <th>Net Days</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term, i) => (
                <tr key={i}>
                  <td>{term.productCode}</td>
                  {/* <td>{term.description}</td>
                  <td>
                    {term.payments?.length > 0 ? (
                      term.payments.map((p, j) => (
                        <div key={j}>
                          {p.days} days / {p.percent}%
                        </div>
                      ))
                    ) : (
                      <div>-</div>
                    )}
                  </td> */}
                  <td>{term.netDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentTerms;
