// pages/checkout.js
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState('');

  // Warna yang diambil dari kode Homepage
  const GRADIENT_START = '#10b981'; 
  const GRADIENT_END = '#047857';  
  const PRIMARY_BUTTON_LIGHT = '#10b981';
  const PRIMARY_BUTTON_DARK = '#059669';
  const PRIMARY_TEXT_COLOR = '#374151'; 
  const SECURITY_GREEN_LIGHT = '#ecfdf5';
  const SECURITY_GREEN_BORDER = '#a7f3d0';

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  async function handlePay() {
    if (!email || cart.length === 0) {
      alert('Mohon lengkapi email dan pastikan keranjang tidak kosong.');
      return;
    }

    // Ambil tombol untuk visual feedback
    const button = document.getElementById('payButton');
    const originalText = button.innerText;
    button.innerText = 'Memproses...';
    button.disabled = true;

    const body = { items: cart, buyerEmail: email };
    
    try {
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
            alert('Error: ' + (data.error || data.message || 'Terjadi kesalahan saat membuat invoice.'));
            button.innerText = originalText;
            button.disabled = false;
        }
    } catch (error) {
        alert('Terjadi kesalahan jaringan: ' + error.message);
        button.innerText = originalText;
        button.disabled = false;
    }
  }

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  
  // =========================================================
  // STYLES
  // =========================================================

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${PRIMARY_BUTTON_DARK} 50%, ${GRADIENT_END} 100%)`,
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    background: 'white',
    maxWidth: '500px',
    width: '100%',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
    padding: '40px',
    position: 'relative'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    color: PRIMARY_TEXT_COLOR
  };

  const titleStyle = {
    fontSize: '2em',
    fontWeight: '800',
    margin: '0 0 5px 0'
  };

  const cartListStyle = {
    marginBottom: '30px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden'
  };

  const cartItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.95em',
    color: PRIMARY_TEXT_COLOR
  };

  const emptyCartStyle = {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '30px',
    fontSize: '1.1em'
  };

  const totalStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: PRIMARY_BUTTON_DARK,
    borderTop: `2px solid ${PRIMARY_BUTTON_LIGHT}`
  };

  const paymentDetailsStyle = {
    padding: '20px 0',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '20px'
  };

  const paymentMethodListStyle = {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '10px',
    padding: '10px 0',
    borderTop: '1px solid #f3f4f6'
  };
  
  const paymentLogoStyle = {
    fontSize: '1.5em',
    color: PRIMARY_BUTTON_DARK
  };
  
  const securityBadgeStyle = {
    background: SECURITY_GREEN_LIGHT,
    border: `1px solid ${SECURITY_GREEN_BORDER}`,
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'center',
    marginBottom: '25px',
    marginTop: '20px'
  };

  const securityTextStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: PRIMARY_BUTTON_DARK
  };


  const inputStyle = {
    padding: '12px 15px',
    marginTop: '15px',
    marginBottom: '25px',
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '1em',
    transition: 'border-color 0.3s'
  };

  const payButtonStyle = {
    width: '100%',
    background: `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`, 
    color: 'white',
    fontWeight: '700',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: `0 8px 20px rgba(16, 185, 129, 0.4)`,
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2em',
    transition: 'all 0.3s ease'
  };
  
  const backButtonStyle = {
    color: PRIMARY_BUTTON_DARK,
    fontSize: '0.9em',
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
    marginTop: '25px',
    transition: 'color 0.3s ease'
  };


  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        <div style={headerStyle}>
          <div style={{fontSize: '3em', color: PRIMARY_BUTTON_LIGHT, marginBottom: '10px'}}>✅</div>
          <h1 style={titleStyle}>Konfirmasi Pesanan</h1>
          <p style={{color: '#6b7280', margin: 0}}>Pastikan semua pesanan sudah benar sebelum membayar.</p>
        </div>

        {/* Daftar Item Keranjang */}
        <div style={cartListStyle}>
          {cart.length === 0 ? (
            <div style={emptyCartStyle}>
              <p>Keranjang masih kosong. <a href="/select-items" style={{color: PRIMARY_BUTTON_DARK, fontWeight: 'bold'}}>Mulai Belanja</a></p>
            </div>
          ) : (
            cart.map((it, index) => (
              <div 
                key={it.name} 
                style={{
                  ...cartItemStyle,
                  backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                }}
              >
                <span>{it.name} **({it.qty}x)**</span>
                <span style={{fontWeight: 'bold'}}>Rp {(it.qty * it.price).toLocaleString('id-ID')}</span>
              </div>
            ))
          )}
        </div>

        {/* Total Harga */}
        <div style={totalStyle}>
          <span>Total Bayar</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>
        
        {/* DETAIL PEMBAYARAN */}
        <div style={paymentDetailsStyle}>
            <p style={{fontSize: '0.9em', fontWeight: 'bold', color: PRIMARY_TEXT_COLOR, marginBottom: '5px'}}>
                Pilih Metode Pembayaran:
            </p>
            <div style={paymentMethodListStyle}>
                <span style={paymentLogoStyle} title="Virtual Account">🏦</span>
                <span style={paymentLogoStyle} title="QRIS">💳</span>
                <span style={paymentLogoStyle} title="Retail Outlet">🏪</span>
                <span style={paymentLogoStyle} title="E-Wallet">📱</span>
            </div>
            <p style={{fontSize: '0.8em', color: '#9ca3af', textAlign: 'center', margin: 0}}>
                Didukung oleh Xendit. Anda akan memilih metode spesifik di halaman selanjutnya.
            </p>
        </div>

        {/* Keamanan Transaksi */}
        <div style={securityBadgeStyle}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <span style={{color: PRIMARY_BUTTON_DARK}}>🔐</span>
                <span style={securityTextStyle}>100% Aman & Terpercaya</span>
            </div>
        </div>

        <p style={{fontSize: '0.9em', color: '#6b7280', marginTop: '5px', marginBottom: '5px'}}>
          Masukkan Email Anda untuk menerima Invoice Pembayaran:
        </p>
        
        {/* Input Email */}
        <input
          type="email"
          id="emailInput"
          placeholder="contoh@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = PRIMARY_BUTTON_LIGHT}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />

        {/* Tombol Pembayaran */}
        <button
          id="payButton"
          onClick={handlePay}
          disabled={cart.length === 0 || !email}
          style={{
            ...payButtonStyle,
            opacity: cart.length === 0 || !email ? 0.6 : 1, 
          }}
          onMouseOver={(e) => {
            if (!(cart.length === 0 || !email)) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.6)';
            }
          }}
          onMouseOut={(e) => {
            if (!(cart.length === 0 || !email)) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 8px 20px rgba(16, 185, 129, 0.4)`;
            }
          }}
        >
          Bayar Sekarang
        </button>
        
        <a 
            href="/select-items" 
            style={backButtonStyle}
            onMouseOver={(e) => e.target.style.color = GRADIENT_END}
            onMouseOut={(e) => e.target.style.color = PRIMARY_BUTTON_DARK}
        >
            ← Kembali ke Toko
        </a>
      </div>
    </div>
  );
}