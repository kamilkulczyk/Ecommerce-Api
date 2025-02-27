import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./ProductCard.css"

const ProductCard = ({ product, statuses, fetchProducts }) => {
  const { cart, addToCart } = useCart();
  const { user } = useContext(AuthContext);
  const [selectedStatus, setSelectedStatus] = useState(product.status_id);
  const cartItem = cart.find((item) => item.id === product.id);
  const maxAvailable = product.stock - (cartItem ? cartItem.quantity : 0);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(newQuantity, maxAvailable)));
  };

  const handleStatusChange = async (newStatusId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/products/${product.id}/status`,
        { status_id: Number(newStatusId) },
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
      <img src={product.images?.[0] || "placeholder.jpg"} alt={product.name} />
      <h3 className="product-title">
        <Link to={`/products/${product.id}`} className="product-link">
          {product.name}
        </Link>
      </h3>
      <p className="product-price">💰 ${product.price}</p>
      <p className="product-stock">📦 In Stock: {product.stock}</p>

      {user?.is_admin && (
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="product-status"
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.status}
            </option>
          ))}
        </select>
      )}

      <div className="quantity-controls">
        <button className="quantity-btn" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity === 1}>
          -
        </button>
        <span className="quantity-value">{quantity}</span>
        <button className="quantity-btn" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= maxAvailable}>
          +
        </button>
      </div>

      <button className="add-to-cart" onClick={() => addToCart(product, quantity)} disabled={maxAvailable === 0}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
