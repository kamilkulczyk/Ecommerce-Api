import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
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
            <span className="username">Hello, {user.username}!</span>
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
