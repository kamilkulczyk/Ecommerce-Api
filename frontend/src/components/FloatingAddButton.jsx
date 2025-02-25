import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaPlus } from "react-icons/fa";
import "./FloatingAddButton.css";

const FloatingAddButton = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate("/add-product");
    } else {
      navigate("/login");
    }
  };

  return (
    <button className="floating-add-button" onClick={handleClick}>
      <FaPlus size={24} />
    </button>
  );
};

export default FloatingAddButton;
