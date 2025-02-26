import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="product-page">
      <h2>{product.name}</h2>
      <img src={product.images?.[0] || "placeholder.jpg"} alt={product.name} />
      <p>💰 ${product.price}</p>
      <p>📦 In Stock: {product.stock}</p>
      <p>{product.description}</p>

      <input
        type="number"
        value={quantity}
        min="1"
        max={product.stock}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button onClick={() => addToCart(product, quantity)} disabled={product.stock === 0}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductPage;
