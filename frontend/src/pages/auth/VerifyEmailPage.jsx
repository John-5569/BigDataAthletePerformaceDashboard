import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../api/api';
import { Zap, CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  // 'verifying' | 'success' | 'already_verified' | 'invalid'
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('invalid'); return; }

    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        // If the token was already used, the user IS verified — they can just log in.
        // The backend returns 400 "Invalid token" for both cases, so we treat
        // any 400 coming from this endpoint as "already verified / link used".
        const status = err.response?.status;
        if (status === 400) {
          setStatus('already_verified');
        } else {
          setStatus('invalid');
        }
      });
  }, [searchParams]);

  const states = {
    verifying: {
      icon: <Loader2 size={32} color="var(--orange)" style={{ animation: 'spin 0.8s linear infinite' }} />,
      iconBg: 'var(--orange-subtle)',
      title: 'Verifying your email…',
      desc: 'Please wait a moment.',
      cta: null,
    },
    success: {
      icon: <CheckCircle size={32} color="var(--green)" />,
      iconBg: 'rgba(34,197,94,0.1)',
      title: 'Email verified!',
      desc: 'Your account is active. You can now sign in.',
      cta: <Link to="/login"><button className="btn btn-primary btn-full">Sign In</button></Link>,
    },
    already_verified: {
      icon: <CheckCircle size={32} color="var(--orange)" />,
      iconBg: 'var(--orange-subtle)',
      title: 'Already verified',
      desc: 'This link has already been used. Your account is active — just sign in.',
      cta: <Link to="/login"><button className="btn btn-primary btn-full"><LogIn size={15}/> Go to Sign In</button></Link>,
    },
    invalid: {
      icon: <XCircle size={32} color="var(--red)" />,
      iconBg: 'rgba(239,68,68,0.1)',
      title: 'Invalid link',
      desc: 'This verification link is broken or has expired. Please register again to get a new one.',
      cta: <Link to="/register"><button className="btn btn-primary btn-full">Register Again</button></Link>,
    },
  };

  const s = states[status] || states.invalid;

  return (
    <div className="auth-page">
      <div className="auth-card animate-in" style={{ textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <Zap size={18} color="var(--orange)" strokeWidth={2.5} />
          <span className="font-condensed" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.05em' }}>
            ATHLETE<span style={{ color: 'var(--orange)' }}>IQ</span>
          </span>
        </div>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: s.iconBg, border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          {s.icon}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{s.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>{s.desc}</p>

        {s.cta}

        {/* Always show a link back to login */}
        {status !== 'verifying' && status !== 'success' && (
          <Link to="/login" style={{ display: 'block', marginTop: 14, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
