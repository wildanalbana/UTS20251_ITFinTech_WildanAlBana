// pages/index.js
export default function Home() {
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>🐾 Selamat Datang di Pet Shop Payment Gateway</h1>
        <p>Pilih makanan hewan favoritmu dan bayar dengan mudah lewat Xendit.</p>
        <a
          href="/select-items"
          style={{
            display: 'inline-block',
            marginTop: 20,
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          👉 Lanjut Belanja
        </a>
      </div>
    );
  }
  