import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/api';
import { Zap, Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Friendly "no account" modal state
  const [showNoAccountModal, setShowNoAccountModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);

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
        text: 'signin_with',
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.getElementById('google-gsi-script');
      if (script) script.addEventListener('load', initGoogle);
    }
  }, []);

  // ---------- Google callback (login flow) ----------
  const handleGoogleResponse = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await authAPI.googleLogin(credentialResponse.credential);
      const { access_token, refresh_token } = res.data;
      const role = decodeRole(access_token);
      const email = decodeEmail(access_token);
      login(access_token, refresh_token, role, email);
      toast.success('Welcome back!');
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || '';
      if (detail === 'no_account') {
        // Store the token so user can proceed to sign up with same token
        setPendingGoogleToken(credentialResponse.credential);
        setShowNoAccountModal(true);
      } else {
        toast.error(detail || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // User chose: sign up anyway with their Google account
  const handleSignUpWithGoogle = async () => {
    if (!pendingGoogleToken) return;
    setShowNoAccountModal(false);
    setLoading(true);
    try {
      const res = await authAPI.googleSignup(pendingGoogleToken);
      const { access_token, refresh_token } = res.data;
      const role = decodeRole(access_token);
      const email = decodeEmail(access_token);
      login(access_token, refresh_token, role, email);
      toast.success('Account created with Google! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Sign-up failed');
    } finally {
      setLoading(false);
      setPendingGoogleToken(null);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { access_token, refresh_token } = res.data;
      const role = decodeRole(access_token);
      const email = decodeEmail(access_token);
      login(access_token, refresh_token, role, email);
      toast.success('Welcome back!');
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <Zap size={20} color="var(--orange)" strokeWidth={2.5} />
          <span className="font-condensed" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.05em' }}>
            ATHLETE<span style={{ color: 'var(--orange)' }}>IQ</span>
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Sign in to your account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>

        {/* ── Google Sign-In Button ── */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div ref={googleBtnRef} style={{ width: '100%', marginBottom: 8 }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0',
              color: 'var(--text-dim)', fontSize: 12,
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="field-group">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" name="email"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="field-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
                onMouseOver={e => e.target.style.color = 'var(--orange)'}
                onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input className="field-input" type={showPass ? 'text' : 'password'} name="password"
                placeholder="Enter your password" value={form.password} onChange={handleChange}
                required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? <span className="loading-spinner" /> : 'Sign In'}
          </button>

        </form>
      </div>

      {/* ── "No Account" Modal ── */}
      {showNoAccountModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 32, maxWidth: 400, width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <Zap size={24} color="var(--orange)" />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 10 }}>
              No account found
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>
              We couldn't find an AthleteIQ account linked to your Google account.
              Would you like to create one instantly?
            </p>

            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button
                onClick={handleSignUpWithGoogle}
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? <span className="loading-spinner" /> : 'Yes, create my account'}
              </button>
              <button
                onClick={() => { setShowNoAccountModal(false); setPendingGoogleToken(null); }}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text-muted)', padding: '10px 16px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
