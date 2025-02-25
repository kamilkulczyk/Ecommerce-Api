import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import "../styles.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [stock, setStock] = useState({});

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/products")
      .then((res) => {
        setProducts(res.data);
        const initialStock = res.data.reduce((acc, product) => {
          acc[product.id] = product.stock;
          return acc;
        }, {});
        setStock(initialStock);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1; // Default to 1 if not set
    if (product.stock >= quantity) {
      addToCart({ ...product, quantity });

      setStock((prevStock) => ({
        ...prevStock,
        [product.id]: prevStock[product.id] - quantity,
      }));
    } else {
      alert("Not enough stock available!");
    }
  };

  return (
    <div className="page-container">
      <h2>Products</h2>
      <div className="products-container">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>💰 ${product.price}</p>
            <p>📦 In Stock: {product.stock}</p>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantities[product.id] || 1}
              onChange={(e) =>
                setQuantities({ ...quantities, [product.id]: parseInt(e.target.value) })
              }
              disabled={stock[product.id] === 0}
            />
            <button 
                onClick={() => handleAddToCart(product)}
                disabled={stock[product.id] === 0}
            >
                {stock[product.id] > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
