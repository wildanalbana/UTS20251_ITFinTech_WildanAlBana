// pages/checkout.js
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  async function handlePay() {
    const body = { items: cart, buyerEmail: email };
    const res = await fetch('/api/checkout/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok) {
      // Redirect ke invoice page Xendit
      window.location.href = data.invoiceUrl;
    } else {
      alert('Error: ' + (data.error || data.message));
    }
  }

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Checkout</h1>

      {cart.length === 0 && <p>Keranjang masih kosong.</p>}

      {cart.map((it) => (
        <div key={it.name}>
          {it.name} x {it.qty} — Rp {it.price.toLocaleString()}
        </div>
      ))}

      <h3>Total: Rp {total.toLocaleString()}</h3>

      <input
        type="email"
        placeholder="Masukkan email untuk invoice"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: 8,
          marginTop: 10,
          display: 'block',
          width: 250,
          border: '1px solid #ccc',
          borderRadius: 4,
        }}
      />

      <button
        onClick={handlePay}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Bayar via Xendit
      </button>
    </div>
  );
}
