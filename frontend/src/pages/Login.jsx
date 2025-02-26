import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Disable button during request

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/login", { email, password });

      if (res.data?.user && res.data?.token) {
        localStorage.setItem("token", res.data.token);
        login(res.data.user, res.data.token);
        alert("Login successful!");
        navigate("/products");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed, please try again.");
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>Don't have an account?</p>
      <Link to="/register" className="register-button">
        Register Here
      </Link>
    </div>
  );
};

export default Login;
