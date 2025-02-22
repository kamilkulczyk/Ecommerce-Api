import { useEffect, useState } from "react";
import axios from "axios";
import "../styles.css";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <div className="page-container">
      <h2>Products</h2>
      <div className="products-container">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>💰 ${product.price}</p>
            <p>📦 In Stock: {product.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
