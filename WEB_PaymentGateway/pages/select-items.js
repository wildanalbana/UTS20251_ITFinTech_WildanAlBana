import { useEffect, useState } from 'react';

export default function SelectItems() {
  // Warna yang diambil dari kode Homepage
  const GRADIENT_START = '#10b981'; // Hijau Cerah
  const GRADIENT_END = '#047857';   // Hijau Gelap
  const PRIMARY_BUTTON_LIGHT = '#10b981';
  const PRIMARY_BUTTON_DARK = '#059669';

  // DUMMY DATA DENGAN OBJECTID PALSU YANG VALID (24 karakter heksadesimal)
  const initialProducts = [
    { _id: '65ffe3f1d9d7e5d8a9f0b1c2', name: 'Dog Food Premium 5kg', price: 250000, category: 'Dog Food' },
    { _id: '65ffe3f1d9d7e5d8a9f0b1c3', name: 'Cat Food Salmon 2kg', price: 150000, category: 'Cat Food' },
    { _id: '65ffe3f1d9d7e5d8a9f0b1c4', name: 'Bird Seed Mix 1kg', price: 50000, category: 'Bird Food' },
  ];

  const [products, setProducts] = useState(initialProducts); // Menggunakan dummy data awal
  const [cart, setCart] = useState([]);

  // Reset margin dan padding browser
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  useEffect(() => {
    // Di lingkungan produksi, Anda akan menggunakan fetch ini:
    /*
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(d.products || []));
    */
    
    // Ambil keranjang dari Local Storage
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  function addToCart(p) {
    const exists = cart.find(i => i.name === p.name);
    let next;
    if (exists) {
      next = cart.map(i => i.name === p.name ? { ...i, qty: i.qty + 1 } : i);
    } else {
      // Pastikan p._id (ObjectID palsu) dikirimkan di sini
      next = [...cart, { product: p._id, name: p.name, price: p.price, qty: 1 }];
    }
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  }

  function removeFromCart(productName) {
    const exists = cart.find(i => i.name === productName);
    if (!exists) return;

    let next;
    if (exists.qty === 1) {
      next = cart.filter(i => i.name !== productName);
    } else {
      next = cart.map(i => i.name === productName ? { ...i, qty: i.qty - 1 } : i);
    }
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  }

  function getItemQuantity(productName) {
    const item = cart.find(i => i.name === productName);
    return item ? item.qty : 0;
  }

  // Styles yang Disesuaikan ke Skema Hijau Homepage
  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${PRIMARY_BUTTON_DARK} 50%, ${GRADIENT_END} 100%)`,
    minHeight: '100vh',
    width: '100vw',
    margin: '0',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const titleStyle = {
    color: 'white',
    fontSize: '2.5em',
    marginBottom: '25px',
    textShadow: '0 3px 6px rgba(0,0,0,0.3)',
    margin: '0 0 25px 0',
    fontWeight: '700'
  };

  const cartButtonStyle = {
    background: `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`, 
    color: 'white', // Font Putih
    padding: '15px 35px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '1.2em',
    fontWeight: '700',
    display: 'inline-block',
    boxShadow: `0 6px 20px rgba(16, 185, 129, 0.4)`, 
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const productsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '25px',
    maxWidth: '1300px',
    margin: '0 auto'
  };

  const productCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    transition: 'all 0.3s ease',
    border: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  const productImagePlaceholderStyle = {
    width: '100%',
    height: '180px',
    background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${PRIMARY_BUTTON_DARK} 100%)`, 
    borderRadius: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3em',
    color: 'white'
  };

  const productNameStyle = {
    fontSize: '1.4em',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '10px',
    margin: '0 0 10px 0'
  };

  const productCategoryStyle = {
    color: '#6b7280', 
    fontSize: '0.9em',
    marginBottom: '15px',
    backgroundColor: '#f9fafb', 
    padding: '6px 15px',
    borderRadius: '20px',
    display: 'inline-block',
    fontWeight: '500'
  };

  const productPriceStyle = {
    fontSize: '1.4em',
    fontWeight: '800',
    color: PRIMARY_BUTTON_DARK, 
    marginBottom: '20px'
  };

  const quantityControlStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '15px'
  };

  const quantityButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '1.2em',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const minusButtonStyle = {
    ...quantityButtonStyle,
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
    color: 'white'
  };

  const plusButtonStyle = {
    ...quantityButtonStyle,
    background: `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`, 
    color: 'white'
  };

  const quantityDisplayStyle = {
    fontSize: '1.3em',
    fontWeight: '700',
    color: '#2c3e50',
    minWidth: '50px',
    textAlign: 'center'
  };

  const addToCartButtonStyle = {
    background: `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`, 
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 15px rgba(16, 185, 129, 0.3)`
  };

  const pawIconStyle = {
    fontSize: '2em',
    marginBottom: '15px',
    color: 'white'
  };

  const totalItemsStyle = {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '1.1em',
    fontWeight: '600',
    marginBottom: '20px',
    display: 'inline-block'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    color: 'white',
    fontSize: '1.2em',
    marginTop: '50px'
  };

  const getProductIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'pet food': return '🍖';
      case 'cat food': return '🐱';
      case 'dog food': return '🐕';
      case 'bird food': return '🐦';
      default: return '🍽️';
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={pawIconStyle}>🐾</div>
        <h1 style={titleStyle}>Natural Nosh Store</h1> 
        
        {totalItems > 0 && (
          <div style={totalItemsStyle}>
            📦 {totalItems} item{totalItems > 1 ? 's' : ''} di keranjang
          </div>
        )}
        
        <a 
          href="/checkout"
          style={cartButtonStyle}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
        >
          🛒 CHECKOUT ({totalItems})
        </a>
      </div>

      {products.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{fontSize: '3em', marginBottom: '20px'}}>🐾</div>
          <p>Loading produk amazing...</p>
        </div>
      ) : (
        <div style={productsGridStyle}>
          {products.map(p => {
            const quantity = getItemQuantity(p.name);
            return (
              <div 
                key={p._id} 
                style={productCardStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                }}
              >
                <div style={productImagePlaceholderStyle}>
                  {getProductIcon(p.category)}
                </div>
                
                <h3 style={productNameStyle}>{p.name}</h3>
                <p style={productCategoryStyle}>{p.category}</p>
                <p style={productPriceStyle}>Rp {p.price.toLocaleString()}</p>
                
                {quantity > 0 ? (
                  <div>
                    <div style={quantityControlStyle}>
                      <button 
                        onClick={() => removeFromCart(p.name)}
                        style={minusButtonStyle}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        −
                      </button>
                      <span style={quantityDisplayStyle}>{quantity}</span>
                      <button 
                        onClick={() => addToCart(p)}
                        style={plusButtonStyle}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{textAlign: 'center', fontSize: '0.9em', color: '#059669', fontWeight: '600'}}>
                      ✅ Added to cart
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(p)}
                    style={addToCartButtonStyle}
                    onMouseOver={(e) => {
                      e.target.style.background = `linear-gradient(135deg, ${PRIMARY_BUTTON_DARK}, ${PRIMARY_BUTTON_LIGHT})`;
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`;
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    🛍️ Add to Cart
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}