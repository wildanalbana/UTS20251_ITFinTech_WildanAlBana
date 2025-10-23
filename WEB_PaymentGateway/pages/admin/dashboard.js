// pages/admin/dashboard.js
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

export default function Dashboard(){
  const [stats, setStats] = useState([]);
  const [range, setRange] = useState('daily'); // daily or monthly
  const [summary, setSummary] = useState({ totalOrders:0, totalRevenue:0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);           // <-- ini yang penting: hanya render chart setelah mount (client)
  }, []);

  useEffect(() => {
    fetchStats();
    fetchSummary();
  }, [range]);

  async function fetchStats(){
    try {
      const res = await fetch(`/api/admin/stats?range=${range}`, { credentials: 'include' });
      if (!res.ok) throw new Error('not auth');
      const j = await res.json();
      setStats(j);
    } catch (e) {
      console.error(e);
      if (e.message === 'not auth') window.location = '/admin/login';
    }
  }

  async function fetchSummary(){
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      if (!res.ok) return;
      const orders = await res.json();
      const totalOrders = orders.length;
      const totalRevenue = orders.filter(o=>o.status==='paid').reduce((s,o)=>s+(o.total||0),0);
      setSummary({ totalOrders, totalRevenue });
    } catch (e) { console.error(e); }
  }

  return (
    <AdminLayout>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      <div style={{ display:'flex', gap:16, marginBottom:18 }}>
        <StatCard title="Total Orders" value={summary.totalOrders} />
        <StatCard title="Total Revenue (paid)" value={formatCurrency(summary.totalRevenue)} />
        <div style={{ marginLeft:'auto' }}>
          <select value={range} onChange={e=>setRange(e.target.value)} style={{ padding:8 }}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div style={{ background:'#fff', padding:16, borderRadius:8 }}>
        <h3>Omzet ({range})</h3>
        <div style={{ width:'100%', height:360 }}>
          {mounted ? (   /* <- hanya render chart saat mounted di client */
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>Loading chart…</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({title, value}) {
  return (
    <div style={{ background:'#fff', padding:16, borderRadius:8, minWidth:180 }}>
      <div style={{ color:'#64748b', fontSize:13 }}>{title}</div>
      <div style={{ fontSize:20, fontWeight:600 }}>{value}</div>
    </div>
  );
}

function formatCurrency(n){
  if (!n) return 'Rp 0';
  return 'Rp ' + n.toLocaleString('id-ID');
}
