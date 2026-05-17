import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';

/* ──────────────────────────────────────────────────
   Google Sign-Up button using Google Identity Services
   https://developers.google.com/identity/gsi/web
   ────────────────────────────────────────────────── */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("CLIENT_ID:", GOOGLE_CLIENT_ID);

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, decodeRole, decodeEmail } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  // ---------- Google One-Tap / Button init ----------
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signup_with',
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.getElementById('google-gsi-script');
      if (script) {
        script.addEventListener('load', initGoogle);
      }
    }
  }, []);

  // ---------- Google callback (signup flow) ----------
  const handleGoogleResponse = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await authAPI.googleSignup(credentialResponse.credential);
      const { access_token, refresh_token } = res.data;
      const role = decodeRole(access_token);
      const email = decodeEmail(access_token);
      login(access_token, refresh_token, role, email);
      toast.success('Account created with Google! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || '';
      if (detail.includes('already has an account')) {
        toast.error('You already have an account. Please sign in.', { duration: 4000 });
        navigate('/login');
      } else {
        toast.error(detail || 'Google sign-up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! Please verify your email.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <Zap size={20} color="var(--orange)" strokeWidth={2.5} />
          <span className="font-condensed" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.05em' }}>
            ATHLETE<span style={{ color: 'var(--orange)' }}>IQ</span>
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>

        {/* ── Google Sign-Up Button ── */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div ref={googleBtnRef} style={{ width: '100%', marginBottom: 8 }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0',
              color: 'var(--text-dim)', fontSize: 12
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="field-group">
            <label className="field-label">Display name</label>
            <input className="field-input" type="text" name="username"
              placeholder="Your athlete name" value={form.username} onChange={handleChange} required />
          </div>

          <div className="field-group">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" name="email"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="field-input" type={showPass ? 'text' : 'password'} name="password"
                placeholder="At least 6 characters" value={form.password} onChange={handleChange}
                required minLength={6} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0
                }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? <span className="loading-spinner" /> : 'Create Account'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
            By creating an account you agree to our terms of service.
          </p>

        </form>
      </div>
    </div>
  );
}
