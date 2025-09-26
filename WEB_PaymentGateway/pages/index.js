// pages/index.js
import { useEffect } from 'react';

export default function Home() {
  // Reset semua margin dan padding browser
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    background: 'white',
    maxWidth: '450px',
    width: '100%',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    padding: '30px 20px',
    textAlign: 'center',
    color: 'white'
  };

  const contentStyle = {
    padding: '30px 20px',
    textAlign: 'center'
  };

  const descriptionStyle = {
    fontSize: '1.1em',
    color: '#555',
    marginBottom: '25px',
    lineHeight: '1.4'
  };

  const featuresStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    gap: '15px',
    flexWrap: 'wrap'
  };

  const featureStyle = {
    flex: '1',
    padding: '15px 10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    textAlign: 'center',
    minWidth: '100px'
  };

  const featureIconStyle = {
    fontSize: '1.5em',
    marginBottom: '8px'
  };

  const featureTextStyle = {
    fontSize: '0.9em',
    color: '#666'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    fontSize: '1.1em',
    cursor: 'pointer',
    marginBottom: '20px',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease'
  };

  const securityInfoStyle = {
    backgroundColor: '#e8f5e8',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '0.9em',
    color: '#2e7d2e',
    marginBottom: '15px'
  };

  const xenditInfoStyle = {
    fontSize: '0.9em',
    color: '#999'
  };

  const pawIconStyle = {
    fontSize: '2em',
    marginBottom: '15px'
  };

  const h1Style = {
    fontSize: '1.8em',
    marginBottom: '10px',
    margin: 0
  };

  const headerPStyle = {
    fontSize: '1em',
    opacity: 0.9,
    margin: 0
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={pawIconStyle}>🐾</div>
          <h1 style={h1Style}>Selamat Datang di Pet Shop Payment Gateway</h1>
          <p style={headerPStyle}>Pilih makanan hewan favoritmu dan bayar dengan mudah lewat Xendit</p>
        </div>
        
        <div style={contentStyle}>
          <div style={descriptionStyle}>
            Berikan yang terbaik untuk hewan kesayangan Anda dengan produk berkualitas tinggi
          </div>
          
          <div style={featuresStyle}>
            <div style={featureStyle}>
              <div style={featureIconStyle}>💳</div>
              <div style={featureTextStyle}>Pembayaran Aman</div>
            </div>
            <div style={featureStyle}>
              <div style={featureIconStyle}>⚡</div>
              <div style={featureTextStyle}>Proses Cepat</div>
            </div>
            <div style={featureStyle}>
              <div style={featureIconStyle}>🚚</div>
              <div style={featureTextStyle}>Pengiriman Terpercaya</div>
            </div>
          </div>
          
          <a
            href="/select-items"
            style={buttonStyle}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #5a6fd8, #6a42a0)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }}
          >
            🛍️ Lanjut Belanja
          </a>
          
          <div style={securityInfoStyle}>
            🔒 Transaksi Anda dilindungi dengan keamanan tinggi
          </div>
          
          <div style={xenditInfoStyle}>
            Powered by <strong>Xendit</strong> - Payment Gateway Terpercaya
          </div>
        </div>
      </div>
    </div>
  );
}