import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/api';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ token: '', new_password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) setForm(f => ({ ...f, token }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token: form.token, new_password: form.new_password });
      toast.success('Password reset! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Link expired or invalid');
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
          Set new password
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
          Choose a strong password for your account.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field-group">
            <label className="field-label">New password</label>
            <div style={{ position: 'relative' }}>
              <input className="field-input" type={showPass ? 'text' : 'password'}
                placeholder="At least 6 characters" value={form.new_password}
                onChange={e => setForm({ ...form, new_password: e.target.value })}
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

          <div className="field-group">
            <label className="field-label">Confirm password</label>
            <input className="field-input" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? <span className="loading-spinner" /> : 'Reset Password'}
          </button>

          <Link to="/login" style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'block' }}>
            ← Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  );
}
