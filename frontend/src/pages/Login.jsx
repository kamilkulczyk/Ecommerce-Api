import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";
import axios from "axios";
import "altcha";

const MAX_FAILED_ATTEMPTS = 3;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaValue, setCaptchaValue] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAttempts = localStorage.getItem("failedAttempts");
    if (storedAttempts) setFailedAttempts(parseInt(storedAttempts, 10));
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (failedAttempts >= MAX_FAILED_ATTEMPTS  && !captchaValue) {
      alert("Please complete the CAPTCHA before logging in.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/login", { 
        email,
        password,
        captcha: failedAttempts >= MAX_FAILED_ATTEMPTS  ? captchaValue : undefined,
      });

      if (res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token);

        localStorage.removeItem("failedAttempts");
        setFailedAttempts(0);
        
        alert("Login successful!");
        navigate("/products");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem("failedAttempts", newAttempts);
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
        {failedAttempts >= MAX_FAILED_ATTEMPTS  && (
          <altcha-widget
            challengeurl="https://api.altcha.io/v1/challenge"
            onverified={(e) => setCaptchaToken(e.detail.token)}
          ></altcha-widget>
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
