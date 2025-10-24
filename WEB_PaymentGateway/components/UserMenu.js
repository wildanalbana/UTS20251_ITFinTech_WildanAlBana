import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null); // { email, name, id }
  const ref = useRef();

  // Cek user saat mount
  useEffect(() => {
    let mounted = true;
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          setUser(j.user || null);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    }
    fetchMe();
    return () => { mounted = false; };
  }, []);

  // klik di luar -> tutup
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { /* ignore */ }
    setUser(null);
    setOpen(false);
    // arahkan ke halaman utama atau login
    router.push('/');
  }

  function handleSignIn() {
    router.push('/auth/login');
  }
  function handleSignUp() {
    router.push('/auth/register');
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', marginLeft: 12 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderRadius: 999,
          background: '#10b98166',
          border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer'
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span style={{ width:36, height:36, borderRadius:'50%', background:'#0f172a', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
          {user ? (String(user.email||'U').charAt(0).toUpperCase()) : 'U'}
        </span>
        <span style={{ fontWeight:700, color:'#fff', textShadow:'0 1px 0 rgba(0,0,0,0.1)' }}>
          {user ? (user.email || user.name || 'Profile') : 'Account'}
        </span>
      </button>

      {open && (
        <div style={{
          position:'absolute',
          right:0,
          marginTop:10,
          minWidth:200,
          background:'#fff',
          borderRadius:8,
          boxShadow:'0 10px 30px rgba(2,6,23,0.2)',
          zIndex:50,
          overflow:'hidden'
        }}>
          <div style={{ padding:12 }}>
            {user ? (
              <>
                <div style={{ fontSize:13, color:'#111', marginBottom:8, fontWeight:700 }}>
                  {user.email || user.name}
                </div>
                <div style={{ fontSize:12, color:'#555', marginBottom:12 }}>
                  {user.isAdmin ? 'Admin' : 'Customer'}
                </div>
                <button onClick={handleLogout} style={{ width:'100%', padding:'8px 10px', background:'#ef4444', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize:13, color:'#111', marginBottom:8, fontWeight:700 }}>Welcome</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={handleSignIn} style={{ flex:1, padding:'8px 10px', borderRadius:6, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer' }}>
                    Sign in
                  </button>
                  <button onClick={handleSignUp} style={{ flex:1, padding:'8px 10px', borderRadius:6, border:'none', background:'#0f172a', color:'#fff', cursor:'pointer' }}>
                    Sign up
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
