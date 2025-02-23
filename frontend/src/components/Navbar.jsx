import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(() => {
        try {
          const storedUser = localStorage.getItem("user");
          return storedUser ? JSON.parse(storedUser) : null;
        } catch {
          return null;
        }
      });
      

  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("storage")); // Notify other components
  };

  return (
    <nav className="navbar">
      <h1 className="logo">
        <Link to="/">Ecommerce</Link>
      </h1>
      <div className="nav-items">
        <Link to="/products">Products</Link>
        {user ? (
          <>
            <Link to="/profile" className="user-button">
              Hello, {user.username}!
            </Link>
            <button onClick={handleLogout} className="button">Logout</button>
          </>
        ) : (
          <Link to="/login" className="button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
