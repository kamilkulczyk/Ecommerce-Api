import { useState } from "react";
import { useCart } from "../context/CartContext";

const ProductQuantity = ({ product }) => {
  const { cart, addToCart } = useCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const maxAvailable = product.stock - (cartItem ? cartItem.quantity : 0);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(newQuantity, maxAvailable)));
  };

  return (
    <>
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
    </>
  );
};

export default ProductQuantity;
