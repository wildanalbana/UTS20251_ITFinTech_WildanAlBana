// pages/payment.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentStatus() {
  const router = useRouter();
  const { external_id } = router.query;
  const [status, setStatus] = useState('LOADING');

  // Warna yang diambil dari skema hijau Natural Nosh
  const PRIMARY_GREEN_LIGHT = '#10b981';
  const PRIMARY_GREEN_DARK = '#059669';
  const PRIMARY_BG_GRADIENT = `linear-gradient(135deg, ${PRIMARY_GREEN_LIGHT} 0%, ${PRIMARY_GREEN_DARK} 100%)`;
  const TEXT_COLOR_DARK = '#374151';

  // LOGIC POLLING STATUS DARI XENDIT
  useEffect(() => {
    if (!external_id) return;
    
    // Polling setiap 3 detik (3000ms)
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/payment/status?external_id=${external_id}`);
        const d = await r.json();
        
        const currentStatus = d.status || 'PENDING';
        setStatus(currentStatus);
        
        // Hentikan polling jika status sudah final
        if (currentStatus === 'PAID' || currentStatus === 'EXPIRED') {
          clearInterval(iv);
        }
      } catch (error) {
        console.error("Failed to fetch payment status:", error);
        // Hentikan polling sementara jika ada error
      }
    }, 3000);

    return () => clearInterval(iv);
  }, [external_id]);

  // STYLES DINAMIS BERDASARKAN STATUS
  
  let statusDisplay = {
    emoji: '⏳',
    color: '#fbbf24', // Kuning (Pending/Loading)
    title: 'Menunggu Pembayaran',
    description: 'Kami sedang menunggu konfirmasi dari sistem pembayaran. Silakan cek invoice Xendit Anda.',
  };
  
  if (status === 'PAID') {
    statusDisplay = {
      emoji: '🎉',
      color: '#10b981', // Hijau (Paid)
      title: 'Pembayaran Berhasil!',
      description: 'Terima kasih! Pesanan Anda telah dikonfirmasi dan akan segera diproses.',
    };
  } else if (status === 'EXPIRED') {
    statusDisplay = {
      emoji: '❌',
      color: '#ef4444', // Merah (Expired)
      title: 'Pembayaran Kedaluwarsa',
      description: 'Waktu pembayaran telah habis. Silakan buat pesanan baru untuk melanjutkan.',
    };
  }

  // Styles statis
  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    background: PRIMARY_BG_GRADIENT,
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
    textAlign: 'center'
  };

  const statusIconStyle = {
    fontSize: '5em',
    marginBottom: '20px',
    color: statusDisplay.color,
    transition: 'color 0.5s ease'
  };

  const statusTitleStyle = {
    fontSize: '2em',
    fontWeight: '800',
    color: statusDisplay.color,
    margin: '0 0 10px 0',
    transition: 'color 0.5s ease'
  };

  const statusDescStyle = {
    color: '#6b7280',
    fontSize: '1em',
    marginBottom: '30px'
  };

  const orderIdStyle = {
    fontSize: '0.9em',
    color: '#9ca3af',
    wordBreak: 'break-all'
  };

  const primaryButtonStyle = {
    width: '100%',
    background: PRIMARY_BG_GRADIENT,
    color: 'white',
    fontWeight: '700',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1em',
    marginTop: '20px',
    boxShadow: `0 5px 15px rgba(16, 185, 129, 0.4)`
  };
  
  const secondaryButtonStyle = {
    ...primaryButtonStyle,
    background: 'white',
    color: PRIMARY_GREEN_DARK,
    border: `1px solid ${PRIMARY_GREEN_DARK}`,
    boxShadow: 'none',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        <div style={statusIconStyle}>{statusDisplay.emoji}</div>

        <h1 style={statusTitleStyle}>{statusDisplay.title}</h1>
        <p style={statusDescStyle}>{statusDisplay.description}</p>
        
        <p style={orderIdStyle}>
          **Order ID:** {external_id || 'N/A'}
        </p>

        <p style={{fontSize: '1.5em', fontWeight: 'bold', color: TEXT_COLOR_DARK, margin: '20px 0 10px 0'}}>
            Status: <span style={{color: statusDisplay.color}}>{status}</span>
        </p>

        {/* Tombol Aksi berdasarkan Status */}
        {status === 'PAID' && (
          <button 
            style={primaryButtonStyle} 
            onClick={() => router.push('/')}
          >
            Kembali ke Homepage
          </button>
        )}
        
        {(status === 'PENDING' || status === 'LOADING') && (
          <div>
            <p style={{color: TEXT_COLOR_DARK, fontWeight: 'bold'}}>
                ⏳ Status diperiksa setiap 3 detik.
            </p>
            <button 
              style={secondaryButtonStyle}
              onClick={() => {
                // Biasanya membuka link invoice Xendit yang tersimpan di state atau DB,
                // tapi karena ini dummy, kita arahkan ke homepage
                router.push('/');
              }}
            >
              Lihat Detail Invoice
            </button>
          </div>
        )}

        {status === 'EXPIRED' && (
          <button 
            style={primaryButtonStyle} 
            onClick={() => router.push('/select-items')}
          >
            Buat Pesanan Baru
          </button>
        )}
      </div>
    </div>
  );
}