import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./Cart.css";

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useContext(CartContext);

  // Combine items with the same ID
  const groupedCart = cart.reduce((acc, item) => {
    if (acc[item.id]) {
      acc[item.id].quantity += item.quantity;
    } else {
      acc[item.id] = { ...item };
    }
    return acc;
  }, {});

  const cartItems = Object.values(groupedCart);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <span className="cart-item-name">
              {item.name} - ${item.price} x {item.quantity}
            </span>
            <div className="cart-controls">
              <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
              <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
              <button className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          </div>
        ))
      )}

      <div className="cart-total">Total: ${totalAmount.toFixed(2)}</div>

      {cartItems.length > 0 && (
        <button className="clear-cart" onClick={clearCart}>Clear Cart</button>
      )}
    </div>
  );
};

export default Cart;
