import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login", { email, password });
      const { access_token, role } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      role === "admin" ? navigate("/admin") : navigate("/user");
    } catch (error) {
      setMessage("INVALID CREDENTIALS. PUSH HARDER.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page"> {/* Reusing the layout container */}
      <div className="register-card"> {/* Reusing the card style */}
        <div className="form-header">
          <h2 className="glitch-text">PLAYER LOGIN</h2>
          <p className="form-subtitle">READY FOR THE NEXT ROUND?</p>
        </div>

        {message && <div className="status-msg error">{message}</div>}

        <form onSubmit={handleLogin} className="sports-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-footer-links">
             <span onClick={() => navigate('/register')}>NEW ATHLETE? SIGN UP</span>
             <span onClick={() => navigate('/forgotpassword')}>FORGOT PASSWORD?</span>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "CHECKING STATS..." : "ENTER ARENA"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;