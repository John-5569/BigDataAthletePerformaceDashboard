import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/api';
import { Zap, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong');
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

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px' }}>
              <Mail size={28} color="var(--green)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
              If an account exists for <strong style={{ color: 'var(--text)' }}>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <Link to="/login">
              <button className="btn btn-primary btn-full">Back to Sign In</button>
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Forgot your password?
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              No worries. Enter your email and we'll send you a reset link.
            </p>

            {/* Hint for Google users */}
            <div style={{
              background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--orange)' }}>Signed up with Google?</strong> You can still
              use this form to set a manual password for your account.
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field-group">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Send Reset Link'}
              </button>

              <Link to="/login" style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
                display: 'block', marginTop: 4 }}
                onMouseOver={e => e.target.style.color = 'var(--text)'}
                onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
              >← Back to Sign In</Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
