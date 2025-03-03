import { useState } from "react";
import axios from "axios";

const ProductStatus = ({ product, statuses, allowChange }) => {
  const [selectedStatus, setSelectedStatus] = useState(product.status_id);

  const handleStatusChange = async (newStatusId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/products/${product.id}/status`,
        { status_id: Number(newStatusId) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSelectedStatus(newStatusId);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="product-status">
      {allowChange ? (
        <select value={selectedStatus} onChange={(e) => handleStatusChange(e.target.value)}>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.status}
            </option>
          ))}
        </select>
      ) : (
        <p>Status: {statuses.find((s) => s.id === product.status_id)?.status || "Unknown"}</p>
      )}
    </div>
  );
};

export default ProductStatus;
