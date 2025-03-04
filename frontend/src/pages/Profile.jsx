import { useEffect, useState, useContext } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const navigate = useNavigate();
  
  const [isCompact, setIsCompact] = useState(() => {
    return localStorage.getItem("isCompact") === "true";
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } 
  }, [navigate]);

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

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const url = `${import.meta.env.VITE_API_URL}/user-added-products`;
      const res = await axios.get(url, { headers, withCredentials: true });

      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const toggleCompactView = () => {
    const newCompactState = !isCompact;
    setIsCompact(newCompactState);
    localStorage.setItem("isCompact", newCompactState);
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {user && (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <h2>Your products</h2>

          <label className="compact-toggle">
            <input type="checkbox" checked={isCompact} onChange={toggleCompactView} />
            Compact View
          </label>

          <div className="products-container">
            {products?.length > 0 ? (
              products.map((product) => (
                <ProductCard 
                  product={product} 
                  statuses={statuses} 
                  fetchProducts={fetchProducts} 
                  showStatus={true} 
                  allowStatusChange={user?.is_admin} 
                  allowCartActions={false} 
                  showEditButton={true} 
                />
              ))
            ) : (
              <p>No products available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
