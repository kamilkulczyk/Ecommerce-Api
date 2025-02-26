import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import AddProduct from "./pages/AddProduct";
import FloatingAddButton from "./components/FloatingAddButton";
import ProductPage from "./pages/ProductPage";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<h1>Welcome to our store!</h1>} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
        <FloatingAddButton />
      </Router>
    </CartProvider>
  );
};

export default App;
