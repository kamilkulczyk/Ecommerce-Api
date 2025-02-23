import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext"; // ✅ Import context
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); // ✅ Use AuthContext
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    logout();
    setIsOpen(false); // Close dropdown on logout
  };

  return (
    <nav className="navbar">
      <h1 className="logo">
        <Link to="/">Ecommerce</Link>
      </h1>
      <div className="nav-items">
        <Link to="/products">Products</Link>

        {user ? (
          <div className="dropdown">
            <button className="user-button" onClick={toggleDropdown}>
              <UserCircle size={20} className="icon" />
              {user.username}
            </button>
            {isOpen && (
              <div className="dropdown-content">
                <Link to="/profile" onClick={() => setIsOpen(false)}>User Page</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
