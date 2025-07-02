import React, { useEffect, useState } from "react";
import axios from "axios";

const Purchaseorder = () => {
  const [matrixData, setMatrixData] = useState([]);

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/getApprovalMatrix");
      setMatrixData(res.data);
    } catch (err) {
      console.error("Failed to fetch matrix", err);
    }
  };

  const handleApprove = async (id) => {
    alert(`Approved matrix ID: ${id}`);
    // Optionally send update to backend here
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Approval Matrix Table</h3>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Product Group</th>
            <th>Controller</th>
            <th>Location</th>
            <th>Department</th>
            <th>Range From</th>
            <th>Range To</th>
            <th>Currency</th>
            <th>Approval Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {matrixData.map((row) => (
            <tr key={row.id}>
              <td>{row.productGroup}</td>
              <td>{row.controller}</td>
              <td>{row.location}</td>
              <td>{row.department}</td>
              <td>{row.rangeFrom}</td>
              <td>{row.rangeTo}</td>
              <td>{row.currency}</td>
              <td>{row.approvalName}</td>
              <td>
                <button className="btn btn-success" onClick={() => handleApprove(row.id)}>
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Purchaseorder;
