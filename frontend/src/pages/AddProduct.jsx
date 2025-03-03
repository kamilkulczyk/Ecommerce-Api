import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
        const product = response.data;
        setName(product.name);
        setPrice(product.price);
        setStock(product.stock);
        setDescription(product.description);
        setImageUrls(product.images?.length ? product.images : [""]);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name,
      price,
      stock,
      description,
      attributes: {},
      images: imageUrls.filter(url => url.trim() !== ""),
    };

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, formData, { headers });
        alert("Product updated successfully!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, { headers });
        alert("Product submitted for approval!");
      }

      navigate("/profile"); 
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>{id ? "Edit Product" : "Add a New Product"}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => {
          const value = parseFloat(e.target.value);
          setPrice(!isNaN(value) && value >= 0 ? value : "");
        }} required />
        <input type="number" placeholder="Stock" value={stock} onChange={(e) => {
          const value = parseFloat(e.target.value);
          setStock(!isNaN(value) && value >= 0 ? value : "");
        }} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <div className="image-urls">
          {imageUrls.map((url, index) => (
            <div key={index} className="image-input">
              <input
                type="text"
                placeholder="Image URL"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                required
              />
              {url.trim() !== "" && (
                <img
                  src={url}
                  alt="Preview"
                  className="image-preview"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>
          ))}
          <button type="button" onClick={addImageUrlField}>+ Add Another Image</button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : id ? "Update Product" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
