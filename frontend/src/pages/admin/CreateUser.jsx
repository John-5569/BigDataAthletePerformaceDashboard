import { useState } from 'react';
import { adminAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';
import { UserPlus, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';

export default function CreateUser() {
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCreated(null);
    try {
      const res = await adminAPI.createUser(form);
      setCreated(res.data);
      toast.success(`User "${res.data.username}" created!`);
      setForm({ email: '', username: '', password: '', role: 'user' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create User" subtitle="Add a new account directly — no email verification needed">
      <div style={{ maxWidth: 460 }}>

        {/* Success banner */}
        {created && (
          <div className="alert alert-success animate-in" style={{ marginBottom: 16 }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Account created</strong>
              <p style={{ marginTop: 2, fontSize: 12, opacity: 0.85 }}>
                {created.email} · role: {created.role} · verified ✓
              </p>
            </div>
          </div>
        )}

        <div className="card card-body animate-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)',
              background: 'var(--orange-subtle)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0 }}>
              <UserPlus size={20} color="var(--orange)" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>New User</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Account is immediately active — no email link required
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div className="field-group">
              <label className="field-label">Display Name</label>
              <input className="field-input" type="text" name="username"
                placeholder="e.g. John Doe" value={form.username}
                onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input className="field-input" type="email" name="email"
                placeholder="user@example.com" value={form.email}
                onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="field-input" type={showPass ? 'text' : 'password'} name="password"
                  placeholder="At least 6 characters" value={form.password}
                  onChange={handleChange} required minLength={6} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Role</label>
              <select className="field-input" name="role" value={form.role} onChange={handleChange}>
                <option value="user">Athlete (user)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : <><UserPlus size={15} /> Create Account</>}
            </button>

          </form>
        </div>

        <div className="alert alert-info animate-in delay-100" style={{ marginTop: 16 }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            Users created here are automatically marked as <strong>verified</strong> — they can log in immediately with the credentials you set.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
