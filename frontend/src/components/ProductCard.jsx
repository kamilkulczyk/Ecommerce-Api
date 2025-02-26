import { useContext, useState } from "react";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const ProductCard = ({ product, statuses, fetchProducts }) => {
  const { cart, addToCart } = useCart();
  const { user } = useContext(AuthContext);
  const [selectedStatus, setSelectedStatus] = useState(product.status_id);
  const cartItem = cart.find((item) => item.id === product.id);
  const maxAvailable = product.stock - (cartItem ? cartItem.quantity : 0);

  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value, 10) || 1;
    value = Math.max(1, Math.min(value, maxAvailable));
    setQuantity(value);
  };

  const handleStatusChange = async (newStatusId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/products/${product.id}/status`,
        { status_id: newStatusId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSelectedStatus(newStatusId);
      fetchProducts();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>💰 ${product.price}</p>
      <p>📦 In Stock: {product.stock}</p>
      <p>Status: {product.status_name}</p>

      {user?.is_admin && (
        <select value={selectedStatus} onChange={(e) => handleStatusChange(e.target.value)}>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.status}
            </option>
          ))}
        </select>
      )}

      <input
        type="number"
        value={quantity}
        min="1"
        max={maxAvailable}
        onChange={handleQuantityChange}
        disabled={maxAvailable === 0}
      />

      <button onClick={() => addToCart(product, quantity)} disabled={maxAvailable === 0}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
