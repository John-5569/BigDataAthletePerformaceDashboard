import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../../api/api';
import DashboardLayout from '../../components/DashboardLayout';
import { UploadCloud, CheckCircle, FileText, X } from 'lucide-react';

export default function UploadBiometrics() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const selectFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) { toast.error('Only .csv files are allowed'); return; }
    setFile(f); setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a CSV file'); return; }
    setLoading(true);
    try {
      const res = await userAPI.uploadBiometricsCSV(file);
      setResult(res.data);
      setFile(null);
      toast.success(`${res.data.rows_inserted} rows imported!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Upload CSV" subtitle="Bulk import biometric data from a CSV file">
      <div style={{ maxWidth: 520 }}>

        {/* Result banner */}
        {result && (
          <div className="alert alert-success animate-in" style={{ marginBottom: 16 }}>
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>{result.rows_inserted} rows imported</strong>
              <p style={{ marginTop: 2, fontSize: 13, opacity: 0.8 }}>{result.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Drop zone */}
          <div
            className={`dropzone${dragging ? ' active' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); selectFile(e.dataTransfer.files[0]); }}
            style={{ marginBottom: 16, cursor: 'pointer' }}
          >
            <UploadCloud size={36} color={file ? 'var(--orange)' : 'var(--text-dim)'} style={{ margin: '0 auto 12px' }} />

            {file ? (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(1)} KB · Ready to upload
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Drop your CSV file here
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>or click to browse files</p>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept=".csv" className="hidden" style={{ display: 'none' }}
            onChange={e => selectFile(e.target.files[0])} />

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading || !file}>
              {loading ? <><span className="loading-spinner" /> Uploading...</> : 'Upload & Import'}
            </button>
            {file && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFile(null)}>
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Format guide */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <span className="card-title" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={14} color="var(--orange)" /> Required CSV Format
            </span>
          </div>
          <div style={{ padding: '12px 20px' }}>
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)',
              padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, lineHeight: 2 }}>
              <span style={{ color: 'var(--orange)' }}>sleep_hours</span>
              <span style={{ color: 'var(--text-dim)' }}>,</span>
              <span style={{ color: 'var(--orange)' }}>hrv</span>
              <br />
              <span style={{ color: 'var(--text-muted)' }}>7.5,65</span>
              <br />
              <span style={{ color: 'var(--text-muted)' }}>6.0,58</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>
              Both columns are required. sleep_hours accepts decimals. hrv must be a whole number.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
