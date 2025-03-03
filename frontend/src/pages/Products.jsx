import { useEffect, useState, useContext } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { AuthContext } from "../context/AuthContext";
import "../styles.css";

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState(() => {
    return Number(localStorage.getItem("selectedStatus")) || 2;
  });

  const [isCompact, setIsCompact] = useState(() => {
    return localStorage.getItem("isCompact") === "true";
  });

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/product-statuses`, { headers });
        setStatuses(res.data);
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = `${import.meta.env.VITE_API_URL}/products`;

        const res = await axios.get(url, {
          params: user?.is_admin ? { status_id: selectedStatus } : {},
          headers,
          withCredentials: true,
        });

        setProducts(res.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [selectedStatus, user?.is_admin]);

  const handleStatusChange = (e) => {
    const newStatus = Number(e.target.value);
    setSelectedStatus(newStatus);
    localStorage.setItem("selectedStatus", newStatus);
  };

  const toggleCompactView = () => {
    const newCompactState = !isCompact;
    setIsCompact(newCompactState);
    localStorage.setItem("isCompact", newCompactState);
  };

  if (!statuses) return <p>Loading statuses...</p>;

  return (
    <div className="page-container">
      <h2>Products</h2>

      {user?.is_admin && (
        <div className="status-filter">
          <label htmlFor="status">Filter by Status:</label>
          <select id="status" value={selectedStatus} onChange={handleStatusChange}>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.status}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="compact-toggle">
        <input type="checkbox" checked={isCompact} onChange={toggleCompactView} />
        Compact View
      </label>

      <div className={`products-container ${isCompact ? "compact-grid" : ""}`}>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              statuses={statuses} 
              showStatus={true} 
              allowStatusChange={user?.is_admin} 
              allowCartActions={true} 
              showEditButton={false} 
              isCompact={isCompact}
            />
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default Products;
