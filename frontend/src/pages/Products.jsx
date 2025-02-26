import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import "../styles.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(0); // Default: Show all
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products?status_id=${selectedStatus}`
      );
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

    const fetchAdminStatus = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/auth/is-admin", { withCredentials: true });
        setIsAdmin(res.data.isAdmin);
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };

    fetchStatuses();
    fetchAdminStatus();
  }, []);

  // Refetch products when status filter changes
  useEffect(() => {
    fetchProducts();
  }, [selectedStatus]);

  return (
    <div className="page-container">
      <h2>Products</h2>

      {isAdmin && (
        <div className="status-filter">
          <label htmlFor="status-select">Filter by status:</label>
          <select id="status-select" value={selectedStatus} onChange={(e) => setSelectedStatus(Number(e.target.value))}>
            <option value="0">All</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
      )}

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
