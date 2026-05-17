import { useState } from 'react';
import { adminAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';
import { Settings, CheckCircle, Info } from 'lucide-react';

export default function ManageUser() {
  const [form, setForm] = useState({ email: '', username: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    const payload = { email: form.email };
    if (form.username.trim()) payload.username = form.username;
    if (form.role) payload.role = form.role;
    try {
      await adminAPI.manageUser(payload);
      toast.success('User updated successfully');
      setSuccess(true);
      setForm({ email: '', username: '', role: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Manage User" subtitle="Update username or role for any user">
      <div style={{ maxWidth: 460 }}>

        {success && (
          <div className="alert alert-success animate-in" style={{ marginBottom: 16 }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>User updated successfully</span>
          </div>
        )}

        <div className="card card-body animate-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)',
              background: 'var(--orange-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Settings size={20} color="var(--orange)" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Edit User</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Only filled fields will be updated</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div className="field-group">
              <label className="field-label">User Email *</label>
              <input className="field-input" type="email" name="email"
                placeholder="athlete@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label className="field-label">New Username <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <input className="field-input" type="text" name="username"
                placeholder="Leave blank to keep current" value={form.username} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label className="field-label">Change Role <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <select className="field-input" name="role" value={form.role} onChange={handleChange}>
                <option value="">— Keep current role —</option>
                <option value="user">Athlete (user)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Save Changes'}
            </button>

          </form>
        </div>

        <div className="alert alert-info animate-in delay-100" style={{ marginTop: 16 }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            Promoting a user to <strong>Admin</strong> gives them access to the full admin panel including user management, deletion, and performance views.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
