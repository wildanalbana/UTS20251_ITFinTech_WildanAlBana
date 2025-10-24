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
      <header style={header}>
        <div style={headerLeft}>
          <div style={logo}>Natural Nosh Store</div>
        </div>

        <div style={headerRight}>
          <button onClick={() => router.push('/auth/login')} style={accountBtn}>
            <span style={avatar}>U</span>
            <span style={{ marginLeft: 8 }}>Account</span>
          </button>
        </div>
      </header>

      <main style={main}>
        <div style={cardWrap}>
          <div style={card}>
            <div style={cardHeader}>
              <h2 style={{ margin: 0 }}>Login Pembeli</h2>
              <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: 13 }}>
                Masuk untuk melanjutkan pembelian
              </p>
            </div>

            {!mfaRequired ? (
              <form onSubmit={handleLogin} style={form}>
                <label style={label}>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={input}
                    placeholder="nama@contoh.com"
                  />
                </label>

                <label style={label}>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={input}
                    placeholder="Masukkan password"
                  />
                </label>

                {error && <div style={err}>{error}</div>}

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button type="submit" disabled={loading} style={btn}>
                    {loading ? 'Loading...' : 'Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/auth/register')}
                    style={ghostBtn}
                  >
                    Register
                  </button>
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                  Tidak punya akun? <button type="button" onClick={() => router.push('/auth/register')} style={linkLike}>Buat akun</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={form}>
                <p style={{ margin: 0, color: '#374151' }}>
                  Kami sudah mengirim kode OTP ke WhatsApp:
                  <span style={{ fontWeight: 700, marginLeft: 6 }}>{maskedPhone || 'nomormu'}</span>
                </p>

                <label style={label}>
                  Kode OTP
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    style={input}
                    placeholder="Masukkan 6 digit OTP"
                  />
                </label>

                {error && <div style={err}>{error}</div>}

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button type="submit" disabled={loading} style={btn}>
                    {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMfaRequired(false); setOtp(''); }}
                    style={ghostBtn}
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Styles ---------------- */
const page = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(90deg,#10b981,#059669)',

};

const header = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 36px',
  background: 'linear-gradient(90deg,#10b981,#059669)',
  color: '#fff'
};

const headerLeft = { display: 'flex', alignItems: 'center', gap: 12 };
const headerRight = { display: 'flex', alignItems: 'center', gap: 12 };

const logo = {
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: '-0.5px'
};

const checkoutBtn = {
  padding: '10px 18px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  borderRadius: 999,
  cursor: 'pointer',
  fontWeight: 700
};

const accountBtn = {
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.18)',
  border: 'none',
  color: '#fff',
  borderRadius: 999,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer'
};

const avatar = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  background: '#061520',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 800
};

const main = {
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 28
};

const cardWrap = {
  width: '100%',
  maxWidth: 980,
  padding: '30px 20px'
};

const card = {
  background: '#fff',
  borderRadius: 12,
  padding: 28,
  boxShadow: '0 12px 40px rgba(2,6,23,0.08)'
};

const cardHeader = { marginBottom: 18 };

const form = { display: 'flex', flexDirection: 'column', gap: 12 };

const label = {
  fontSize: 13,
  color: '#374151',
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const input = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #e6eaf0',
  outline: 'none',
  fontSize: 14,
  boxSizing: 'border-box'
};

const btn = {
  padding: '12px 14px',
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 700
};

const ghostBtn = {
  padding: '12px 14px',
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #e6eaf0',
  borderRadius: 8,
  cursor: 'pointer'
};

const linkLike = {
  background: 'transparent',
  border: 'none',
  color: '#059669',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontWeight: 700
};

const err = {
  color: '#ef4444',
  fontSize: 13,
  marginTop: 6
};
