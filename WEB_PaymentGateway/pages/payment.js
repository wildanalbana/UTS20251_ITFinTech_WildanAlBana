import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentStatus() {
  const router = useRouter();
  const { external_id } = router.query;
  const [status, setStatus] = useState('LOADING');

  const PRIMARY_GREEN_LIGHT = '#10b981';
  const PRIMARY_GREEN_DARK = '#059669';
  const PRIMARY_BG_GRADIENT = `linear-gradient(135deg, ${PRIMARY_GREEN_LIGHT} 0%, ${PRIMARY_GREEN_DARK} 100%)`;
  const TEXT_COLOR_DARK = '#374151';

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);
  // -------------------------------------------------------------------


  useEffect(() => {
    if (!external_id) return;
    
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/payment/status?external_id=${external_id}`);
        const d = await r.json();
        
        const currentStatus = d.status || 'PENDING';
        setStatus(currentStatus);
        
        if (currentStatus === 'PAID' || currentStatus === 'EXPIRED') {
          clearInterval(iv);
          if (currentStatus === 'PAID') {
            localStorage.removeItem('cart');
          }
        }
      } catch (error) {
        console.error("Failed to fetch payment status:", error);
      }
    }, 3000);

    return () => clearInterval(iv);
  }, [external_id]);

  
  let statusDisplay = {
    emoji: '⏳',
    color: '#fbbf24', 
    title: 'Menunggu Pembayaran',
    description: 'Kami sedang menunggu konfirmasi dari sistem pembayaran. Silakan cek invoice Xendit Anda.',
  };
  
  if (status === 'PAID') {
    statusDisplay = {
      emoji: '🎉',
      color: PRIMARY_GREEN_LIGHT, 
      title: 'Pembayaran Berhasil!',
      description: 'Terima kasih! Pesanan Anda telah dikonfirmasi dan akan segera diproses.',
    };
  } else if (status === 'EXPIRED' || status === 'FAILED') {
    statusDisplay = {
      emoji: '❌',
      color: '#ef4444', 
      title: 'Pembayaran Gagal/Kedaluwarsa',
      description: 'Waktu pembayaran telah habis atau gagal. Silakan buat pesanan baru untuk melanjutkan.',
    };
  }

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    width: '100vw', 
    minHeight: '100vh',
    background: PRIMARY_BG_GRADIENT,
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
  
  const statusIconContainerStyle = { 
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  }

  const statusIconStyle = {
    fontSize: '5em',
    color: statusDisplay.color,
    transition: 'color 0.5s ease',
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
    wordBreak: 'break-all',
    margin: '10px 0'
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
    boxShadow: `0 5px 15px rgba(16, 185, 129, 0.4)`,
    transition: 'all 0.3s ease'
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
        
        <div style={statusIconContainerStyle}> 
            <span style={statusIconStyle}>{statusDisplay.emoji}</span>
        </div>

        <h1 style={statusTitleStyle}>{statusDisplay.title}</h1>
        <p style={statusDescStyle}>{statusDisplay.description}</p>
        
        <p style={orderIdStyle}>
          Order ID: {external_id || 'N/A'}
        </p>

        <p style={{fontSize: '1.5em', fontWeight: 'bold', color: TEXT_COLOR_DARK, margin: '20px 0 10px 0'}}>
            Status: <span style={{color: statusDisplay.color}}>{status}</span>
        </p>

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
            <p style={{color: TEXT_COLOR_DARK, fontWeight: 'bold', fontSize: '0.9em'}}>
                ⏳ Status diperiksa setiap 3 detik. Jangan tutup halaman ini.
            </p>
            <button 
              style={secondaryButtonStyle}
              onClick={() => router.push('/select-items')} 
            >
              Cek Produk Lain
            </button>
          </div>
        )}

        {(status === 'EXPIRED' || status === 'FAILED') && (
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