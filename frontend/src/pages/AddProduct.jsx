import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [loading, setLoading] = useState(false);

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
      await axios.post(import.meta.env.VITE_API_URL + "/products", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product submitted for approval!");
      navigate("/");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add a New Product</h2>
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
                key={index}
                type="text"
                placeholder="Image URL"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                required
              />
              {url && url.trim() !== "" && (
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

        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
      </form>
    </div>
  );
};

export default AddProduct;
