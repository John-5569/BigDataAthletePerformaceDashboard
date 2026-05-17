import { useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import { Activity, Info } from 'lucide-react';

export default function LogBiometrics() {
  const [form, setForm] = useState({ sleep_hours: '', hrv: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.logBiometrics({ sleep_hours: parseFloat(form.sleep_hours), hrv: parseInt(form.hrv) });
      toast.success('Entry logged successfully!');
      setForm({ sleep_hours: '', hrv: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Log Biometrics" subtitle="Record your daily sleep and HRV data">
      <div style={{ maxWidth: 480 }}>

        <div className="card card-body animate-in">
          <div style={{ display: 'flex', align: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)',
              background: 'var(--orange-subtle)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0 }}>
              <Activity size={20} color="var(--orange)" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>New Entry</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Log today's biometric readings</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="field-group">
              <label className="field-label">Sleep Hours</label>
              <input className="field-input" type="number" name="sleep_hours"
                placeholder="e.g. 7.5" step="0.1" min="0" max="24"
                value={form.sleep_hours} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label className="field-label">Heart Rate Variability (HRV)</label>
              <input className="field-input" type="number" name="hrv"
                placeholder="e.g. 65" min="0" max="300"
                value={form.hrv} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <span className="loading-spinner" /> : 'Save Entry'}
            </button>
          </form>
        </div>

        {/* Tip */}
        <div className="alert alert-info animate-in delay-100" style={{ marginTop: 16 }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            <strong>Best practice:</strong> Log immediately after waking for the most accurate sleep data. HRV should be measured in the morning at rest.
          </p>
        </div>

        {/* Quick reference */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><span className="card-title" style={{ fontSize: 14 }}>Reference Ranges</span></div>
          <div style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {[
              { m: 'Sleep', g: '7–9 hrs', ok: '6–7 hrs', low: '<6 hrs' },
              { m: 'HRV', g: '60–100 ms', ok: '40–60 ms', low: '<40 ms' },
            ].map(r => (
              <div key={r.m}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{r.m}</p>
                <p style={{ fontSize: 12, color: 'var(--green)', marginBottom: 2 }}>🟢 Great: {r.g}</p>
                <p style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 2 }}>🟡 OK: {r.ok}</p>
                <p style={{ fontSize: 12, color: 'var(--red)' }}>🔴 Low: {r.low}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
