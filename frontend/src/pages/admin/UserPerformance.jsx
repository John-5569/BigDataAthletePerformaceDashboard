import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';
import { Moon, Heart, TrendingUp, TrendingDown, Search } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: 'var(--orange)', fontWeight: 600 }}>{payload[0].value?.toFixed(2)}</p>
    </div>
  );
};

const metrics = (stats) => [
  { label: 'Avg Sleep', value: stats?.avg_sleep?.toFixed(1), unit: 'hrs', icon: Moon, color: 'var(--orange)' },
  { label: 'Avg HRV', value: stats?.avg_hrv?.toFixed(0), unit: 'ms', icon: Heart, color: 'var(--orange)' },
  { label: 'Best Sleep', value: stats?.max_sleep?.toFixed(1), unit: 'hrs', icon: TrendingUp, color: 'var(--green)' },
  { label: 'Min Sleep', value: stats?.min_sleep?.toFixed(1), unit: 'hrs', icon: TrendingDown, color: 'var(--red)' },
];

export default function UserPerformance() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await adminAPI.getUserPerformance(email);
      setStats(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'No data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (email) fetchStats(); }, []);

  const radarData = stats ? [
    { metric: 'Avg Sleep', A: stats.avg_sleep },
    { metric: 'HRV/10', A: stats.avg_hrv / 10 },
    { metric: 'Max Sleep', A: stats.max_sleep },
    { metric: 'Min Sleep', A: stats.min_sleep },
  ] : [];

  return (
    <DashboardLayout title="Athlete Performance" subtitle="View biometric stats for any user">

      {/* Search form */}
      <form onSubmit={fetchStats} style={{ display: 'flex', gap: 10, marginBottom: 28, maxWidth: 480 }}>
        <input className="field-input" type="email" placeholder="athlete@example.com"
          value={email} onChange={e => setEmail(e.target.value)} required style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary" disabled={loading || !email.trim()}>
          {loading ? <span className="loading-spinner" /> : <Search size={14} />}
        </button>
      </form>

      {stats && (
        <div className="animate-in">
          {/* Key metrics */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {metrics(stats).map(({ label, value, unit, icon: Icon, color }, i) => (
              <div key={label} className="metric-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="metric-icon" style={{ color }}><Icon size={18} /></div>
                <p className="metric-label">{label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="metric-value" style={{ color }}>{value ?? '—'}</span>
                  <span className="metric-unit">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Radar */}
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-header">
              <span className="card-title">Performance Radar</span>
              <span className="badge badge-gray" style={{ fontSize: 11, maxWidth: 180, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email}
              </span>
            </div>
            <div style={{ padding: '8px 8px 16px' }}>
              <ResponsiveContainer width="100%" height={220}>
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
      )}
    </DashboardLayout>
  );
}
