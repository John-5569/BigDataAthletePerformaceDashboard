import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Activity, UploadCloud, LogOut,
  Users, Search, BarChart2, Settings,
} from 'lucide-react';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/log-biometrics', icon: Activity, label: 'Log' },
  { to: '/upload-biometrics', icon: UploadCloud, label: 'Upload' },
];

const adminLinks = [
  { to: '/admin', icon: Users, label: 'Users', end: true },
  { to: '/admin/search', icon: Search, label: 'Search' },
  { to: '/admin/performance', icon: BarChart2, label: 'Stats' },
  { to: '/admin/manage', icon: Settings, label: 'Manage' },
];

export default function MobileNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = async () => {
    await logout(); toast.success('Signed out'); navigate('/login');
  };

  return (
    <nav className="mobile-nav" style={{ display: 'none' }}>
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className="mobile-nav-item" onClick={handleLogout} style={{ color: 'var(--text-muted)' }}>
        <LogOut size={20} />
        <span>Out</span>
      </button>
    </nav>
  );
}
