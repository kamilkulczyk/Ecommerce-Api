import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    images.forEach((image) => formData.append("images", image));

    try {
      const token = localStorage.getItem("token");
      await axios.post(import.meta.env.VITE_API_URL + "/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product submitted for approval!");
      navigate("/products");
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
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="file" multiple onChange={handleImageUpload} accept="image/*" />
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
      </form>
    </div>
  );
};

export default AddProduct;
