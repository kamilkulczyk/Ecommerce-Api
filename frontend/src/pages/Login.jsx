import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";
import axios from "axios";
import Altcha from "altcha-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaValue, setCaptchaValue] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (failedAttempts >= 3 && !captchaValue) {
      alert("Please complete the CAPTCHA before logging in.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/login", { 
        email,
        password,
        captcha: captchaValue,
      });

      if (res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token);
        alert("Login successful!");
        navigate("/products");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setFailedAttempts((prev) => prev + 1);
      alert(error.response?.data?.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
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
        {failedAttempts >= 3 && (
          <Altcha sitekey="ckey_01752f90d0e3ee96f16c0be82632" onChange={(value) => setCaptchaValue(value)} />
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        <Link to="/forgot-password" className="forgot-button">Forgot Password?</Link>
      </p>

      <p>Don't have an account?</p>
      <Link to="/register" className="register-button">
        Register Here
      </Link>
    </div>
  );
};

export default Login;
