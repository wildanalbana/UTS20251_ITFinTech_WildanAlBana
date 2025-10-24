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

      setMsg('Registrasi berhasil — silakan login');
      // optional: short delay biar user lihat pesan
      setTimeout(() => router.push('/auth/login'), 900);
    } catch (error) {
      console.error(error);
      setErr('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Buat Akun</h2>
        <p style={{ color:'#6b7280', marginTop:8 }}>Daftar sebagai pembeli untuk melakukan checkout dan menerima notifikasi WhatsApp.</p>

        <form onSubmit={handleSubmit} style={form}>
          <label style={label}>
            Nama
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap" style={input} />
          </label>

          <label style={label}>
            Email
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contoh@domain.com" style={input} />
          </label>

          <label style={label}>
            Nomor WhatsApp (gunakan format internasional, contoh: +6281234567890)
            <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+628..." style={input} />
          </label>

          <label style={label}>
            Password
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" style={input} />
          </label>

          <label style={{ ...label, flexDirection:'row', alignItems:'center', gap:10 }}>
            <input type="checkbox" checked={mfaEnabled} onChange={e => setMfaEnabled(e.target.checked)} />
            <span style={{ fontSize:13, color:'#374151' }}>Aktifkan MFA (OTP via WhatsApp)</span>
          </label>

          {err && <div style={errStyle}>{err}</div>}
          {msg && <div style={msgStyle}>{msg}</div>}

          <div style={{ display:'flex', gap:8, marginTop:6 }}>
            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
            <button type="button" onClick={() => router.push('/auth/login')} style={ghostBtn}>
              Ke Login
            </button>
          </div>
        </form>

        <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
          Dengan mendaftar, kamu setuju menerima notifikasi transaksi lewat WhatsApp jika MFA diaktifkan.
        </div>
      </div>
    </div>
  );
}

/* styles */
const page = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8fafc',
  padding: 20,
  boxSizing: 'border-box'
};

const card = {
  width: 480,
  background: '#fff',
  padding: 24,
  borderRadius: 10,
  boxShadow: '0 8px 40px rgba(2,6,23,0.06)'
};

const form = { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 };
const label = { fontSize: 13, color: '#111827', display: 'flex', flexDirection: 'column', gap: 6 };
const input = { padding: 10, borderRadius: 8, border: '1px solid #e6edf3', marginTop: 6, outline: 'none' };
const btnPrimary = { padding: '10px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' };
const ghostBtn = { padding: '10px 14px', background: '#fff', color: '#0f172a', border: '1px solid #e6edf3', borderRadius: 8, cursor: 'pointer' };
const errStyle = { color: '#ef4444', fontSize: 13, marginTop: 6 };
const msgStyle = { color: '#059669', fontSize: 13, marginTop: 6 };
