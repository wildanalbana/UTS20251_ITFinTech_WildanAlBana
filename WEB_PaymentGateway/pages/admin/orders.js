// pages/admin/orders.js
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function OrdersPage(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=> { load(); }, []);

  async function load(){
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location = '/admin/login';
          return;
        }
        throw new Error('Failed to load');
      }
      const j = await res.json();
      setOrders(j);
    } catch (e) {
      console.error(e);
      alert('Failed to load orders');
    } finally { setLoading(false); }
  }

  async function updateStatus(id, status){
    if (!confirm(`Change status to "${status}" ?`)) return;
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed');
      }
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  }

  return (
    <AdminLayout>
      <h1>Orders</h1>
      {loading ? <p>Loading...</p> : (
        <div style={{ background:'#fff', padding:12, borderRadius:8 }}>
          {orders.length === 0 ? <p>No orders yet.</p> : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ textAlign:'left', borderBottom:'1px solid #eee' }}>
                  <th style={th}>#</th>
                  <th style={th}>Customer</th>
                  <th style={th}>Items</th>
                  <th style={th}>Total</th>
                  <th style={th}>Status</th>
                  <th style={th}>Created</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o._id} style={{ borderBottom:'1px solid #fafafa' }}>
                    <td style={td}>{idx+1}</td>
                    <td style={td}>{o.user ? (o.user.name || o.user.email) : 'Guest'}</td>
                    <td style={td}>
                      {o.items?.map(it => `${it.title || it.name} x${it.qty}`).join(', ')}
                    </td>
                    <td style={td}>Rp {Number(o.total||0).toLocaleString('id-ID')}</td>
                    <td style={td}>{o.status}</td>
                    <td style={td}>{new Date(o.createdAt).toLocaleString()}</td>
                    <td style={td}>
                      {o.status !== 'paid' && <button onClick={()=>updateStatus(o._id, 'paid')} style={btn}>Mark Paid</button>}
                      {o.status !== 'cancelled' && <button onClick={()=>updateStatus(o._id, 'cancelled')} style={{...btn, background:'#ef4444'}}>Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

const th = { padding: '10px', fontSize:13 };
const td = { padding: '10px', verticalAlign:'top' };
const btn = { padding:'6px 8px', marginRight:8, background:'#06b6d4', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' };
