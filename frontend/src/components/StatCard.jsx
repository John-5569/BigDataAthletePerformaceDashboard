export default function StatCard({ label, value, unit = '', icon, color = '#f97316', sub }) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#666' }}>
            {label}
          </p>
          <div className="flex items-end gap-2">
            <span
              className="font-condensed font-black text-5xl leading-none"
              style={{ color }}
            >
              {value ?? '—'}
            </span>
            {unit && (
              <span className="text-sm pb-1" style={{ color: '#888' }}>
                {unit}
              </span>
            )}
          </div>
          {sub && <p className="text-xs mt-2" style={{ color: '#555' }}>{sub}</p>}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18` }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
