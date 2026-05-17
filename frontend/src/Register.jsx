import React, { useState } from "react";
import axios from "axios";
import "./Register.css"; // We'll add some cool animations here

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/register", formData);
      setMessage("Success! Welcome to the team.");
      setFormData({ username: "", email: "", password: "" });
    } catch (error) {
      setMessage(error.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="form-header">
          <h2 className="glitch-text">JOIN THE LEAGUE</h2>
          <p className="form-subtitle">BECOME A PRO ATHLETE TODAY</p>
        </div>

        {message && (
          <div className={`status-msg ${message.includes("Success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sports-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="DISPLAY NAME"
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="EMAIL ADDRESS"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="SECURE PASSWORD"
            />
          </div>

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? <span className="loader"></span> : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;