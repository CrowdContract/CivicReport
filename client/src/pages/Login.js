import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  // context
  const [, setAuth] = useAuth();
  // state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // hooks
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`/login`, {
        email,
        password,
      });
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
      } else {
        // Set axios headers immediately before navigating so PrivateRoute works
        axios.defaults.headers.common["Authorization"] = data.token;
        axios.defaults.headers.common["refresh_token"] = data.refreshToken;
        setAuth(data);
        localStorage.setItem("auth", JSON.stringify(data));
        toast.success("Login successful");
        setLoading(false);
        location?.state !== null
          ? navigate(location.state)
          : navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>
      
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                className="modern-input"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                placeholder="Enter your password"
                className="modern-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary-modern"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
          <Link to="/auth/forgot-password" className="forgot-password">
            Forgot password?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
