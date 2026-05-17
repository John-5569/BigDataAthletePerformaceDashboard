import { useEffect, useState } from 'react';
import { userAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis,
} from 'recharts';
import { Moon, Heart, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: 'var(--orange)', fontWeight: 600 }}>{p.name}: {p.value?.toFixed(1)}</p>
      ))}
    </div>
  );
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getBiometrics()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Could not load biometrics'))
      .finally(() => setLoading(false));
  }, []);

  const hasData = stats && (stats.avg_sleep > 0 || stats.avg_hrv > 0);

  const metrics = stats ? [
    { label: 'Avg Sleep', value: stats.avg_sleep?.toFixed(1), unit: 'hrs', icon: Moon, color: 'var(--orange)' },
    { label: 'Avg HRV', value: stats.avg_hrv?.toFixed(0), unit: 'ms', icon: Heart, color: 'var(--orange)' },
    { label: 'Best Sleep', value: stats.max_sleep?.toFixed(1), unit: 'hrs', icon: TrendingUp, color: 'var(--green)' },
    { label: 'Min Sleep', value: stats.min_sleep?.toFixed(1), unit: 'hrs', icon: TrendingDown, color: 'var(--red)' },
  ] : [];

  const areaData = stats ? [
    { name: 'Min', sleep: stats.min_sleep },
    { name: 'Avg', sleep: stats.avg_sleep },
    { name: 'Max', sleep: stats.max_sleep },
  ] : [];

  const radarData = stats ? [
    { metric: 'Avg Sleep', A: Math.min(stats.avg_sleep / 10 * 10, 10) },
    { metric: 'HRV Score', A: Math.min(stats.avg_hrv / 100 * 10, 10) },
    { metric: 'Max Sleep', A: Math.min(stats.max_sleep / 10 * 10, 10) },
    { metric: 'Min Sleep', A: Math.min(stats.min_sleep / 10 * 10, 10) },
    { metric: 'Recovery', A: Math.min(stats.avg_hrv / 80 * 10, 10) },
  ] : [];

  return (
    <DashboardLayout title="My Dashboard" subtitle={`Welcome back, ${user?.email}`}>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: 'var(--text-muted)' }}>
          <span className="loading-spinner" />
          <span style={{ fontSize: 14 }}>Loading your data...</span>
        </div>
      ) : !hasData ? (
        /* Empty state */
        <div style={{
          border: '1.5px dashed var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px', textAlign: 'center', maxWidth: 520,
        }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--orange-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Activity size={24} color="var(--orange)" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No data yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Start logging your biometrics to see your performance analytics here.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/log-biometrics">
              <button className="btn btn-primary btn-sm">Log Biometrics</button>
            </Link>
            <Link to="/upload-biometrics">
              <button className="btn btn-secondary btn-sm">Upload CSV</button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {metrics.map(({ label, value, unit, icon: Icon, color }, i) => (
              <div key={label} className="metric-card animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="metric-icon"><Icon size={18} /></div>
                <p className="metric-label">{label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="metric-value" style={{ color }}>{value ?? '—'}</span>
                  <span className="metric-unit">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="chart-grid">
            <div className="card">
              <div className="card-header"><span className="card-title">Sleep Range</span></div>
              <div style={{ padding: '16px 8px 8px' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--border)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis stroke="var(--border)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sleep" name="Sleep (hrs)" stroke="var(--orange)" fill="url(#sleepGrad)" strokeWidth={2} dot={{ fill: 'var(--orange)', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">Performance Radar</span></div>
              <div style={{ padding: '8px' }}>
                <ResponsiveContainer width="100%" height={216}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Radar dataKey="A" stroke="var(--orange)" fill="var(--orange)" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
