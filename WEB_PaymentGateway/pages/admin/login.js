// pages/admin/login.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin(){
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const text = await res.text();
        alert('Login failed: ' + res.status + ' — ' + text);
        setLoading(false);
        return;
      }

      // success
      router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      alert('Network error: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight: '100vh', background:'#f1f5f9' }}>
      <div style={{ width: 420, background:'#fff', padding: 24, borderRadius:8, boxShadow:'0 6px 20px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop:0 }}>Admin Login</h3>
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <label>
            Email
            <input value={email} onChange={e=>setEmail(e.target.value)} required style={{ width:'100%', padding:10, borderRadius:6, border:'1px solid #e2e8f0', marginTop:6 }}/>
          </label>
          <label>
            Password
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{ width:'100%', padding:10, borderRadius:6, border:'1px solid #e2e8f0', marginTop:6 }}/>
          </label>
          <button disabled={loading} type="submit" style={{ padding:'10px 12px', background:'#0f172a', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
