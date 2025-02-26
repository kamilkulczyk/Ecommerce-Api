import { useEffect, useState, useContext } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { AuthContext } from "../context/AuthContext";
import "../styles.css";

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(2);

  const fetchProducts = async (status_id = 2) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/products`;
      const res = await axios.get(url, {
        params: user?.is_admin ? { status_id } : {},
        withCredentials: true,
      });

      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = Number(e.target.value);
    setSelectedStatus(newStatus);
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/product-statuses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStatuses(res.data);
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
      }
    };

    fetchStatuses();
  }, []);

  useEffect(() => {
    fetchProducts(selectedStatus);
  }, [selectedStatus, user?.is_admin]);

  return (
    <div className="page-container">
      <h2>Products</h2>

      {user?.is_admin && statuses.length > 0 && (
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

      <div className="products-container">
        {products.length > 0 ? (
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
