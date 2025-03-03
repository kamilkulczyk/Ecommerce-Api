import { useEffect, useState, useContext } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login"); // Redirect if not logged in
    } 
    // else {
    //   setUser(JSON.parse(storedUser));
    // }
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const url = `${import.meta.env.VITE_API_URL}/user-added-products`;
      const res = await axios.get(url, {
        params: user?.id,
        headers,
        withCredentials: true,
      });

      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  });

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {user && (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <div className="products-container">
            {products?.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} statuses={statuses} fetchProducts={fetchProducts} />
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
