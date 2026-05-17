import { Link } from 'react-router-dom';
import { Zap, ArrowRight, BarChart2, Shield, Activity } from 'lucide-react';

const features = [
  { icon: Activity, title: 'Biometric Tracking', desc: 'Log sleep, HRV, and recovery data daily' },
  { icon: BarChart2, title: 'Performance Analytics', desc: 'Visualise trends with advanced charts' },
  { icon: Shield, title: 'Secure & Private', desc: 'End-to-end protected health data' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '64px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={20} color="var(--orange)" strokeWidth={2.5} />
          <span className="font-condensed" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.05em' }}>
            ATHLETE<span style={{ color: 'var(--orange)' }}>IQ</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login">
            <button className="btn btn-ghost btn-sm">Sign In</button>
          </Link>
          <Link to="/register">
            <button className="btn btn-primary btn-sm">Get Started</button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px 60px',
      }}>
        {/* Pill label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--orange-subtle)',
          border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 99, padding: '5px 14px',
          marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Big Data Athlete Performance
          </span>
        </div>

        <h1 className="font-condensed text-glow" style={{
          fontSize: 'clamp(52px, 9vw, 100px)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          marginBottom: 24,
          maxWidth: 900,
        }}>
          VICTORY{' '}
          <span className="text-gradient">STARTS</span>{' '}
          HERE
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-muted)', maxWidth: 520,
          lineHeight: 1.7, marginBottom: 40,
        }}>
          Track biometrics, analyse performance, and dominate your sport with real-time data insights.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register">
            <button className="btn btn-primary btn-lg" style={{ gap: 8 }}>
              Get Started Free <ArrowRight size={16} />
            </button>
          </Link>
          <Link to="/login">
            <button className="btn btn-secondary btn-lg">Member Login</button>
          </Link>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-body animate-in" style={{ textAlign: 'left' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius)',
                background: 'var(--orange-subtle)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Icon size={20} color="var(--orange)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          padding: '28px 24px',
        }}>
          {[{ v: '10K+', l: 'Athletes' }, { v: '99M+', l: 'Data Points' }, { v: '98%', l: 'Accuracy' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div className="font-condensed" style={{ fontSize: 36, fontWeight: 900, color: 'var(--orange)' }}>{s.v}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
