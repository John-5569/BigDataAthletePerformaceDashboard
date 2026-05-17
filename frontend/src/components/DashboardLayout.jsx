import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function DashboardLayout({ children, title, subtitle, actions }) {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-content">

        {/* Page header */}
        {title && (
          <header className="page-header">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </div>
              {actions && <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>{actions}</div>}
            </div>
          </header>
        )}

        <main className="page-body">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
