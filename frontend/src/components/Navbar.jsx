import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { UserCircle, ShoppingCart } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext"; // Import CartContext
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext); // Get cart from context
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/"); // Redirect to homepage after logout
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <h1 className="logo">
        <Link to="/">Ecommerce</Link>
      </h1>
      <div className="nav-items">

        <button className="cart-button" onClick={() => navigate("/cart")}>
          <ShoppingCart size={20} className="icon" />
          {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </button>

        {user ? (
          <div className="user-menu" ref={dropdownRef}>
            <button className="user-button" onClick={toggleDropdown}>
              <UserCircle size={20} className="icon" />
              {user.username}
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>User Page</Link>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
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
