import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Reuse your existing sports theme CSS

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Connecting to your FastAPI backend
      const response = await axios.post("http://127.0.0.1:8000/auth/forgotpassword", {
        email: email
      });
      
      // We show a success message regardless of whether the email exists (security best practice)
      setMessage("RECOVERY LINK SENT. CHECK YOUR INBOX, CHAMP.");
    } catch (error) {
      setMessage("SYSTEM ERROR. TRY AGAIN LATER.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="form-header">
          <h2 className="glitch-text">PASSWORD RECOVERY</h2>
          <p className="form-subtitle">GET BACK IN THE GAME</p>
        </div>

        {message && (
          <div className={`status-msg ${message.includes("SENT") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="sports-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="ENTER REGISTERED EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "SENDING..." : "SEND RESET LINK"}
          </button>

          <div className="form-footer-links" style={{ justifyContent: 'center' }}>
            <span onClick={() => navigate('/login')}>BACK TO LOGIN</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;