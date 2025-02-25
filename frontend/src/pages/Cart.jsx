import { useCart } from "../context/CartContext";
import "./Cart.css";

const Cart = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();

  return (
    <div className="page-container">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <p>
                  <strong>{item.name}</strong> - ${item.price} x {item.quantity}
                </p>

                <button
                  onClick={() => decreaseQuantity(item.id)}
                  disabled={item.quantity === 1}
                >
                  -
                </button>

                <button
                  onClick={() => increaseQuantity(item.id)}
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>

                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            ))}
          </div>

          <h3 className="total-price">
            Total: ${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
          </h3>

          <button className="clear-cart" onClick={clearCart} disabled={cart.length === 0}>
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;