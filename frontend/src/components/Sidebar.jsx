import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Activity, UploadCloud, LogOut,
  Users, Search, BarChart2, Settings, Zap, UserPlus,
} from 'lucide-react';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/log-biometrics', icon: Activity, label: 'Log Biometrics' },
  { to: '/upload-biometrics', icon: UploadCloud, label: 'Upload CSV' },
];

const adminLinks = [
  { to: '/admin', icon: Users, label: 'All Users', end: true },
  { to: '/admin/search', icon: Search, label: 'Search' },
  { to: '/admin/performance', icon: BarChart2, label: 'Performance' },
  { to: '/admin/manage', icon: Settings, label: 'Manage User' },
  { to: '/admin/create-user', icon: UserPlus, label: 'Create User' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">

        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="var(--orange)" strokeWidth={2.5} />
            <span className="font-condensed" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text)' }}>
              ATHLETE<span style={{ color: 'var(--orange)' }}>IQ</span>
            </span>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '4px 12px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--orange-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: 11, marginTop: 1 }}>
                <span className={`badge ${isAdmin ? 'badge-orange' : 'badge-gray'}`}
                  style={{ padding: '1px 7px', fontSize: 10 }}>
                  {isAdmin ? 'Admin' : 'Athlete'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Navigation */}
        <div className="sidebar-section-label">Navigation</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <div className="divider" />
        <button onClick={handleLogout} className="nav-link" style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>

      </div>
    </aside>
  );
}
