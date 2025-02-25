import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "../styles.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const { cart, addToCart } = useCart();
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleQuantityChange = (productId, value) => {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue >= 1) {
      setQuantities((prev) => ({ ...prev, [productId]: parsedValue }));
    }
  };

  return (
    <div className="page-container">
      <h2>Products</h2>
      <div className="products-container">
        {products.map((product) => {
          const cartItem = cart.find((item) => item.id === product.id);
          const maxAvailable = product.stock - (cartItem ? cartItem.quantity : 0);

          return (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>💰 ${product.price}</p>
              <p>📦 In Stock: {product.stock}</p>

              <input
                type="number"
                value={quantities[product.id] || 1}
                min="1"
                max={maxAvailable}
                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
              />

              <button
                onClick={() => addToCart(product, quantities[product.id] || 1)}
                disabled={maxAvailable === 0}
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
