// pages/admin/products.js
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function ProductsPage(){
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title:'', price:'', stock:'', description:'' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // NOTE: don't return the promise from useEffect.
  // call an inner async function instead and use a cancelled flag.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cancelled) return;
      setLoading(true);
      try {
        const res = await fetch('/api/admin/product', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) {
            window.location = '/admin/login';
            return;
          } else {
            throw new Error('fail');
          }
        }
        const j = await res.json();
        if (!cancelled) setProducts(j || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) alert('Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, []); // run once on mount

  async function submit(e){
    e?.preventDefault();
    const payload = { ...form, price: Number(form.price || 0), stock: Number(form.stock || 0) };
    if (editingId) payload.id = editingId;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/admin/product', {
        method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('fail');
      setForm({ title:'', price:'', stock:'', description:'' });
      setEditingId(null);
      // reload products after save
      await reloadProductsSafe();
    } catch (e) {
      console.error(e);
      alert('Failed to save product');
    }
  }

  function startEdit(p){
    setEditingId(p._id);
    setForm({ title:p.title, price:p.price, stock:p.stock, description:p.description || '' });
  }

  async function del(id){
    if (!confirm('Hapus produk?')) return;
    try {
      const res = await fetch('/api/admin/product?id=' + id, { method:'DELETE', credentials:'include' });
      if (!res.ok) throw new Error('fail');
      await reloadProductsSafe();
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  }

  // helper for reloading that won't throw uncaught if fetch fails
  async function reloadProductsSafe(){
    try {
      setLoading(true);
      const res = await fetch('/api/admin/product', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          window.location = '/admin/login';
          return;
        } else {
          throw new Error('fail');
        }
      }
      const j = await res.json();
      setProducts(j || []);
    } catch (e) {
      console.error('Reload failed', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <h1>Products</h1>
      <div style={{ display:'flex', gap:18 }}>
        <div style={{ flex:1, background:'#fff', padding:12, borderRadius:8 }}>
          <h3>{editingId ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required style={input}/>
            <input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required style={input}/>
            <input placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} required style={input}/>
            <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} style={{...input, height:100}}/>
            <div>
              <button type="submit" style={btnPrimary}>{editingId ? 'Update' : 'Create'}</button>
              {editingId && <button type="button" onClick={()=>{ setEditingId(null); setForm({ title:'', price:'', stock:'', description:'' }) }} style={{ marginLeft:8 }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div style={{ flex:2, background:'#fff', padding:12, borderRadius:8 }}>
          <h3>All Products</h3>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr><th style={th}>Title</th><th style={th}>Price</th><th style={th}>Stock</th><th style={th}></th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={td}>{p.title}</td>
                  <td style={td}>Rp {Number(p.price).toLocaleString('id-ID')}</td>
                  <td style={td}>{p.stock}</td>
                  <td style={td}>
                    <button onClick={()=>startEdit(p)} style={actionBtn}>Edit</button>
                    <button onClick={()=>del(p._id)} style={{ ...actionBtn, background:'#ef4444' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={4} style={{ padding:12 }}>No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
      {loading && <div style={{marginTop:12}}>Loading...</div>}
    </AdminLayout>
  );
}

const input = { padding:10, borderRadius:6, border:'1px solid #e2e8f0' };
const btnPrimary = { padding:'8px 12px', background:'#0f172a', color:'#fff', border:'none', borderRadius:6 };
const th = { textAlign:'left', padding:8 };
const td = { padding:8 };
const actionBtn = { padding:'6px 8px', marginRight:8, background:'#06b6d4', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' };
