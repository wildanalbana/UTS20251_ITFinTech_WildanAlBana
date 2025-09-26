import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    padding: '20px',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0',
    boxSizing: 'border-box',
    position: 'relative'
  };

  const backgroundElements = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none'
  };

  const floatingElement1 = {
    position: 'absolute',
    top: '80px',
    left: '80px',
    width: '128px',
    height: '128px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    filter: 'blur(40px)'
  };

  const floatingElement2 = {
    position: 'absolute',
    bottom: '80px',
    right: '80px',
    width: '96px',
    height: '96px',
    background: 'rgba(252,211,77,0.2)',
    borderRadius: '50%',
    filter: 'blur(20px)'
  };

  const floatingElement3 = {
    position: 'absolute',
    top: '50%',
    right: '40px',
    width: '64px',
    height: '64px',
    background: 'rgba(251,207,232,0.15)',
    borderRadius: '50%',
    filter: 'blur(15px)'
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    maxWidth: '420px',
    width: '100%',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    position: 'relative'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #10b981, #059669, #047857)',
    padding: '48px 32px',
    textAlign: 'center',
    color: 'white',
    position: 'relative'
  };

  const decorativeStyle1 = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    fontSize: '24px',
    color: 'rgba(255,255,255,0.3)'
  };

  const decorativeStyle2 = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    fontSize: '24px',
    color: 'rgba(255,255,255,0.3)'
  };

  const mainIconStyle = {
    fontSize: '64px',
    marginBottom: '16px'
  };

  const h1Style = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '12px',
    margin: '0 0 12px 0',
    lineHeight: '1.2'
  };

  const headerPStyle = {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
    margin: '0',
    lineHeight: '1.4'
  };

  const contentStyle = {
    padding: '32px',
  };

  const welcomeStyle = {
    textAlign: 'center',
    marginBottom: '24px'
  };

  const descriptionStyle = {
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '24px',
    fontSize: '15px'
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px'
  };

  const featureCardStyle = {
    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    padding: '16px',
    borderRadius: '16px',
    textAlign: 'center'
  };

  const featureIconStyle = {
    fontSize: '24px',
    marginBottom: '8px'
  };

  const featureTextStyle = {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  };

  const productsPreviewStyle = {
    background: '#f9fafb',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px'
  };

  const productsHeaderStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  };

  const productsListStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const productItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const productIconStyle = {
    fontSize: '18px'
  };

  const productTextStyle = {
    fontSize: '12px',
    color: '#6b7280'
  };

  const buttonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    fontWeight: '600',
    padding: '16px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '24px'
  };

  const buttonContentStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const securityBadgeStyle = {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
    marginBottom: '16px'
  };

  const securityHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '4px'
  };

  const securityTitleStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#15803d'
  };

  const securityDescStyle = {
    fontSize: '12px',
    color: '#16a34a'
  };

  const footerStyle = {
    textAlign: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6'
  };

  const footerTextStyle = {
    fontSize: '12px',
    color: '#9ca3af'
  };

  const brandStyle = {
    fontWeight: '600',
    color: '#6b7280'
  };

  const ratingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '4px'
  };

  const ratingTextStyle = {
    fontSize: '12px',
    color: '#9ca3af'
  };

  const starsStyle = {
    fontSize: '12px',
    color: '#fbbf24'
  };

  return (
    <div style={containerStyle}>
      {/* Floating background elements */}
      <div style={backgroundElements}>
        <div style={floatingElement1}></div>
        <div style={floatingElement2}></div>
        <div style={floatingElement3}></div>
      </div>

      {/* Main Card */}
      <div style={cardStyle}>
        
        {/* Header Section */}
        <div style={headerStyle}>
          {/* Decorative elements */}
          <div style={decorativeStyle1}>🌿</div>
          <div style={decorativeStyle2}>🌱</div>
          
          {/* Main icon */}
          <div style={mainIconStyle}>🥗</div>
          
          <h1 style={h1Style}>Natural Nosh</h1>
          <p style={headerPStyle}>
            Nutrisi alami terbaik untuk hewan kesayangan
          </p>
        </div>

        {/* Content Section */}
        <div style={contentStyle}>
          
          {/* Welcome Message */}
          <div style={welcomeStyle}>
            <p style={descriptionStyle}>
              Berikan nutrisi terbaik untuk sahabat berbulu Anda dengan produk premium pilihan
            </p>
          </div>

          {/* Features Grid */}
          <div style={featuresGridStyle}>
            <div style={featureCardStyle}>
              <div style={featureIconStyle}>💳</div>
              <div style={featureTextStyle}>Bayar Aman</div>
            </div>
            <div style={{...featureCardStyle, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)'}}>
              <div style={featureIconStyle}>⚡</div>
              <div style={featureTextStyle}>Super Cepat</div>
            </div>
            <div style={{...featureCardStyle, background: 'linear-gradient(135deg, #fffbeb, #fef3c7)'}}>
              <div style={featureIconStyle}>🚚</div>
              <div style={featureTextStyle}>Kirim Gratis</div>
            </div>
          </div>

          {/* Popular Products Preview */}
          <div style={productsPreviewStyle}>
            <h3 style={productsHeaderStyle}>Makanan Alami Favorit</h3>
            <div style={productsListStyle}>
              <div style={productItemStyle}>
                <span style={productIconStyle}>🥩</span>
                <span style={productTextStyle}>Organik Kucing</span>
              </div>
              <div style={productItemStyle}>
                <span style={productIconStyle}>🥕</span>
                <span style={productTextStyle}>Sayur Anjing</span>
              </div>
              <div style={productItemStyle}>
                <span style={productIconStyle}>🌾</span>
                <span style={productTextStyle}>Gandum Kelinci</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            style={buttonStyle}
            onClick={() => window.location.href = '/select-items'}
          >
            <div style={buttonContentStyle}>
              <span>🛍️</span>
              <span>Mulai Belanja</span>
              <span style={{fontSize: '18px'}}>→</span>
            </div>
          </button>

          {/* Security Badge */}
          <div style={securityBadgeStyle}>
            <div style={securityHeaderStyle}>
              <span style={{color: '#10b981'}}>🔐</span>
              <span style={securityTitleStyle}>100% Aman & Terpercaya</span>
            </div>
            <p style={securityDescStyle}>Transaksi dilindungi enkripsi bank</p>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <p style={footerTextStyle}>
              Powered by <span style={brandStyle}>Xendit</span>
            </p>
            <div style={ratingStyle}>
              <span style={ratingTextStyle}>Dipercaya</span>
              <span style={starsStyle}>⭐⭐⭐⭐⭐</span>
              <span style={ratingTextStyle}>1000+ pelanggan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}