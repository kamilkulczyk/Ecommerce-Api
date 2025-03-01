import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

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
    const fetchFailedAttempts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/failed-attempts?email=${email}`
        );
        setFailedAttempts(res.data.failedAttempts);
      } catch (error) {
        console.error("Failed to fetch failed attempts:", error);
      }
    };

    if (email) {
      fetchFailedAttempts();
    }
  }, [email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (failedAttempts >= MAX_FAILED_ATTEMPTS && !captchaValue) {
      alert("Please complete the CAPTCHA before logging in.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/login", {
        email,
        password,
        captcha: failedAttempts >= MAX_FAILED_ATTEMPTS ? captchaValue : undefined,
      });

      if (res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token);
        setFailedAttempts(0);
        alert("Login successful!");
        navigate("/products");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed, please try again.";
      const newAttempts = error.response?.data?.failedAttempts;

      if(newAttempts !== undefined){
        setFailedAttempts(newAttempts);
      }

      console.error("Login error:", error.response?.data || error.message);
      alert(errorMessage);
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
        {failedAttempts >= MAX_FAILED_ATTEMPTS && (
          <ReCAPTCHA
            sitekey="6LcrauYqAAAAAKtZjo-1jlAnW78Kc03F0pG8drzs"
            onChange={(value) => setCaptchaValue(value)}
          />
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        <Link to="/forgot-password" className="forgot-button">
          Forgot Password?
        </Link>
      </p>

      <p>Don't have an account?</p>
      <Link to="/register" className="register-button">
        Register Here
      </Link>
    </div>
  );
};

export default Login;