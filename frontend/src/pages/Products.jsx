import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import "../styles.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();

    const fetchStatuses = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/product-statuses");
        setStatuses(res.data);
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
      }
    };

    fetchStatuses();
  }, []);

  return (
    <div className="page-container">
      <h2>Products</h2>
      <div className="products-container">
        {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (
            <ProductCard key={product.id} product={product} statuses={statuses} fetchProducts={fetchProducts} />
            ))
        ) : (
            <p>No products available</p>
        )}
        </div>
    </div>
  );
};

export default Products;
