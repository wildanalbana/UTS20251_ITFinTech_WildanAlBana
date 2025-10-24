// pages/auth/register.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          mfaEnabled
        })
      });

      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || 'Gagal mendaftar');
        setLoading(false);
        return;
      }

      setMsg('✅ Registrasi berhasil — silakan login');
      setTimeout(() => router.push('/auth/login'), 1000);
    } catch (error) {
      console.error(error);
      setErr('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      {/* --- HEADER --- */}
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

      {/* --- FORM CONTAINER --- */}
      <main style={main}>
        <div style={cardWrap}>
          <div style={card}>
            <div style={cardHeader}>
              <h2 style={{ margin: 0 }}>Buat Akun Pembeli</h2>
              <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: 13 }}>
                Daftar untuk melakukan checkout dan menerima notifikasi WhatsApp
              </p>
            </div>

            <form onSubmit={handleSubmit} style={form}>
              <label style={label}>
                Nama Lengkap
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  style={input}
                />
              </label>

              <label style={label}>
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contoh@domain.com"
                  style={input}
                />
              </label>

              <label style={label}>
                Nomor WhatsApp (format internasional, contoh: +6281234567890)
                <input
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+628..."
                  style={input}
                />
              </label>

              <label style={label}>
                Password
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  style={input}
                />
              </label>

              <label
                style={{
                  ...label,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <input
                  type="checkbox"
                  checked={mfaEnabled}
                  onChange={e => setMfaEnabled(e.target.checked)}
                />
                <span style={{ fontSize: 13, color: '#374151' }}>
                  Aktifkan MFA (OTP via WhatsApp)
                </span>
              </label>

              {err && <div style={errStyle}>{err}</div>}
              {msg && <div style={msgStyle}>{msg}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" disabled={loading} style={btnPrimary}>
                  {loading ? 'Mendaftarkan...' : 'Daftar'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  style={ghostBtn}
                >
                  Ke Login
                </button>
              </div>
            </form>

            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: '#6b7280',
                lineHeight: 1.4
              }}
            >
              Dengan mendaftar, kamu setuju menerima notifikasi transaksi
              melalui WhatsApp jika MFA diaktifkan.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

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

const btnPrimary = {
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

const errStyle = {
  color: '#ef4444',
  fontSize: 13,
  marginTop: 6
};

const msgStyle = {
  color: '#059669',
  fontSize: 13,
  marginTop: 6
};
