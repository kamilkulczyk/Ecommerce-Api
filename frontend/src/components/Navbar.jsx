import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css"

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser)); // Parse user data from localStorage
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <nav style={styles.navbar}>
      <h1 style={styles.logo}>
        <Link to="/" style={styles.link}>Ecommerce</Link>
      </h1>
      <div style={styles.navItems}>
        <Link to="/products" style={styles.link}>Products</Link>
        {user ? (
          <>
            <span style={styles.username}>Hello, {user.username}!</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={styles.button}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;