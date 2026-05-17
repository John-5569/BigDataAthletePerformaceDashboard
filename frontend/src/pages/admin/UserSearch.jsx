import { useState } from 'react';
import { adminAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';
import { Search, ChevronRight, SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await adminAPI.searchUsers(query);
      setResults(res.data);
      setSearched(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Search Users" subtitle="Find athletes by name or email">
      <div style={{ maxWidth: 640 }}>

        {/* Search form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input className="field-input" type="text"
              placeholder="Search by name or email..."
              value={query} onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 44 }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
            {loading ? <span className="loading-spinner" /> : <Search size={14} />}
          </button>
        </form>

        {/* Results */}
        {searched && (
          <div className="card animate-in">
            <div className="card-header">
              <span className="card-title">Results</span>
              <span className="badge badge-gray">{results.length} found</span>
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <SearchIcon size={32} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  No users matching "<strong style={{ color: 'var(--text)' }}>{query}</strong>"
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th style={{ textAlign: 'right' }}>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(u => (
                      <tr key={u.email}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-gray'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => navigate(`/admin/performance?email=${u.email}`)}
                              className="btn btn-ghost btn-sm"
                              style={{ gap: 4, fontSize: 12 }}
                            >
                              Performance <ChevronRight size={12} />
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
        )}
      </div>
    </DashboardLayout>
  );
}
