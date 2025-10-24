// pages/auth/login.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function BuyerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const j = await res.json();

      if (!res.ok) {
        setError(j.error || 'Login gagal');
        setLoading(false);
        return;
      }

      if (j.mfaRequired) {
        // server sudah mengirim OTP via WA; tunjukkan UI OTP
        setMfaRequired(true);
        if (j.phone) setMaskedPhone(j.phone);
        setLoading(false);
        return;
      }

      // login sukses tanpa MFA -> cookie token sudah diset di backend
      router.push('/'); // arahkan ke halaman utama
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp })
      });

      const j = await res.json();
      if (!res.ok) {
        setError(j.error || 'Verifikasi OTP gagal');
        setLoading(false);
        return;
      }

      // OTP valid -> cookie token sudah diset di backend
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan saat verifikasi OTP');
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Login Pembeli</h2>

        {!mfaRequired ? (
          <form onSubmit={handleLogin} style={form}>
            <label style={label}>
              Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={input}/>
            </label>

            <label style={label}>
              Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={input}/>
            </label>

            {error && <div style={err}>{error}</div>}

            <div style={{ display:'flex', gap:8, marginTop: 8 }}>
              <button type="submit" disabled={loading} style={btn}>
                {loading ? 'Loading...' : 'Login'}
              </button>
              <button type="button" onClick={() => router.push('/auth/register')} style={ghostBtn}>
                Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={form}>
            <p>Kami sudah mengirim kode OTP ke WhatsApp: <b>{maskedPhone || 'nomor kamu'}</b></p>

            <label style={label}>
              Kode OTP
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required style={input} />
            </label>

            {error && <div style={err}>{error}</div>}

            <div style={{ display:'flex', gap:8, marginTop: 8 }}>
              <button type="submit" disabled={loading} style={btn}>
                {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
              </button>
              <button type="button" onClick={() => { setMfaRequired(false); setOtp(''); }} style={ghostBtn}>
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* --- simple styles --- */
const page = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f3f4f6',
  padding: 20,
  boxSizing: 'border-box'
};

const card = {
  width: 420,
  background: '#fff',
  padding: 24,
  borderRadius: 8,
  boxShadow: '0 6px 30px rgba(2,6,23,0.08)'
};

const form = { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 };
const label = { fontSize: 13, color: '#111827', display: 'flex', flexDirection: 'column', gap:6 };
const input = { padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', marginTop:6 };
const btn = { padding: '10px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
const ghostBtn = { padding: '10px 14px', background: '#fff', color: '#0f172a', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' };
const err = { color: '#ef4444', fontSize: 13, marginTop: 6 };
