import { CartContext } from "../context/CartContext";
import { useContext } from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-left">
                {item.image && <img src={item.image} alt={item.name} className="cart-item-image" />}
                <div className="cart-item-details">
                  <h3 className="cart-item-name">
                    <Link to={`/products/${item.id}`}>{item.name}</Link>
                  </h3>
                </div>
              </div>

              <div className="cart-item-right">
                <p className="cart-item-price">{item.price.toFixed(2)} zł</p>

                <div className="cart-controls">
                  <button
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <input type="text" value={item.quantity} readOnly className="quantity-input" />
                  <button
                    className="quantity-btn"
                    disabled={item.quantity >= item.stock}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="cart-item-total">{(item.price * item.quantity).toFixed(2)} zł</p>

                <button className="remove-button" onClick={() => removeFromCart(item.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <strong>Total: {calculateTotal()} zł</strong>
          </div>

          <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
