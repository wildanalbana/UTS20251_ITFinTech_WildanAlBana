import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { /* ignore */ }
    router.push('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, Arial' }}>
      <aside style={{ width: 220, background: '#0f172a', color: '#fff', padding: 20 }}>
        <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>Admin Dashboard</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/admin/dashboard">
            <span style={linkStyle(router.pathname === '/admin/dashboard')}>Dashboard</span>
          </Link>
          <Link href="/admin/orders">
            <span style={linkStyle(router.pathname === '/admin/orders')}>Orders</span>
          </Link>
          <Link href="/admin/products">
            <span style={linkStyle(router.pathname === '/admin/products')}>Products</span>
          </Link>
        </nav>
        <div style={{ marginTop: 24 }}>
          <button onClick={logout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24, background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  );
}

function linkStyle(active){
  return {
    color: active ? '#0f172a' : '#cbd5e1',
    padding: '8px 10px',
    background: active ? '#e2e8f0' : 'transparent',
    borderRadius: 6,
    textDecoration: 'none',
    display: 'inline-block',
    cursor: 'pointer'
  }
}
