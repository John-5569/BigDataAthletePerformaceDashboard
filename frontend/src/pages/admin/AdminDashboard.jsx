import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';
import { Trash2, ChevronRight, Users, ShieldCheck, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getAllUsers()
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (email) => {
    if (!window.confirm(`Delete ${email}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser({ email });
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.email !== email));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const admins = users.filter(u => u.role === 'admin').length;
  const athletes = users.filter(u => u.role === 'user').length;

  return (
    <DashboardLayout title="User Management" subtitle={`${users.length} total accounts`}>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'var(--orange)' },
          { label: 'Admins', value: admins, icon: ShieldCheck, color: 'var(--blue)' },
          { label: 'Athletes', value: athletes, icon: UserIcon, color: 'var(--green)' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className="metric-card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="metric-icon" style={{ color }}><Icon size={18} /></div>
            <p className="metric-label">{label}</p>
            <span className="metric-value" style={{ color }}>{loading ? '—' : value}</span>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card animate-in delay-200">
        <div className="card-header">
          <span className="card-title">All Users</span>
          <span className="badge badge-gray">{users.length} total</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 48, color: 'var(--text-muted)' }}>
            <span className="loading-spinner" /><span style={{ fontSize: 14 }}>Loading...</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
            No users found
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--orange-subtle)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>
                            {u.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{u.username}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate(`/admin/performance?email=${u.email}`)}
                          className="btn btn-ghost btn-sm"
                          style={{ gap: 4, fontSize: 12 }}
                        >
                          Stats <ChevronRight size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.email)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
