import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PurchaseOrderList = () => {
  const [poList, setPoList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/purchase-orders"); // <-- Update your endpoint
      setPoList(res.data);
      console.log(res);
      
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    }
  };

  const handleView = (poNumber) => {
    navigate(`/order/${poNumber}`);
  };

  return (
    <div className="container mt-4">
      <h3>Purchase Orders</h3>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>PO Number</th>
            <th>Reference ID</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {poList.map((po, index) => (
            <tr key={index}>
              <td>{po.poNumber}</td>
              <td>{po.referenceId}</td>
              <td>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleView(po.poNumber)}
                >
                  View PO
                </button>
              </td>
            </tr>
          ))}
          {poList.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center">No Purchase Orders Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderList;
