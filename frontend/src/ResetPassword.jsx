import { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css"; 

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extracts the token from the URL

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage("PASSWORDS DO NOT MATCH.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/resetpassword", {
        token: token,
        new_password: newPassword,
      });

      setMessage("PASSWORD UPDATED. REDIRECTING TO LOCKER ROOM...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "LINK EXPIRED OR INVALID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="form-header">
          <h2 className="glitch-text">RESET ACCESS</h2>
          <p className="form-subtitle">SET YOUR NEW CREDENTIALS</p>
        </div>

        {message && (
          <div className={`status-msg ${message.includes("UPDATED") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="sports-form">
          <div className="input-group">
            <input
              type="password"
              placeholder="NEW PASSWORD"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="CONFIRM NEW PASSWORD"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading || !token}>
            {loading ? "UPDATING..." : "RESET PASSWORD"}
          </button>
          
          {!token && <p className="error-banner">ERROR: NO TOKEN DETECTED.</p>}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;