import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProductStatus from "./ProductStatus";
import ProductQuantity from "./ProductQuantity";
import "./ProductCard.css";

const ProductCard = ({ 
  product, 
  statuses,
  showStatus = false, 
  allowStatusChange = false, 
  allowCartActions = true, 
  showEditButton = false 
}) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit-product/${product.id}`, { state: { product } });
  };

  return (
    <div className="product-card">
      <img src={product.images?.[0] || "placeholder.jpg"} alt={product.name} />
      <h3 className="product-title">
        <Link to={`/products/${product.id}`} className="product-link">
          {product.name}
        </Link>
      </h3>
      <p className="product-price">💰 ${product.price}</p>
      <p className="product-stock">📦 In Stock: {product.stock}</p>

      {showStatus && <ProductStatus product={product} statuses={statuses} allowChange={allowStatusChange} />}
      {allowCartActions && <ProductQuantity product={product} />}

      {showEditButton && (
        <button className="edit-button" onClick={handleEdit}>
          ✏️ Edit Product
        </button>
      )}
    </div>
  );
};

export default ProductCard;
