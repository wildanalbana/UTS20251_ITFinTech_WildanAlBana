import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UserMenu } from '../components/UserMenu';

export default function SelectItems() {
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);
  const router = useRouter();

  const GRADIENT_START = '#10b981';
  const GRADIENT_END = '#047857';
  const PRIMARY_BUTTON_LIGHT = '#10b981';
  const PRIMARY_BUTTON_DARK = '#059669';

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Ambil keranjang dari localStorage saat pertama kali render
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(stored);
    } catch (e) {
      setCart([]);
    }
  }, []);

  // Fetch produk dari API (coba beberapa endpoint)
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      const endpoints = ['/api/products', '/api/product', '/api/admin/product'];
      for (let ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (!res.ok) continue;
          const data = await res.json();
          if (cancelled) return;

          if (Array.isArray(data)) {
            setProducts(data);
            return;
          }
          if (data && Array.isArray(data.products)) {
            setProducts(data.products);
            return;
          }
        } catch (err) {
          // coba endpoint lain
        }
      }
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  // Simpan keranjang ke localStorage
  function saveCart(next) {
    setCart(next);
    try { localStorage.setItem('cart', JSON.stringify(next)); } catch (e) {}
  }

  // Cek autentikasi dengan server (memanfaatkan cookie HttpOnly)
  async function isAuthenticated() {
    try {
      setCheckingAuth(true);
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      setCheckingAuth(false);
      return res.ok;
    } catch (err) {
      setCheckingAuth(false);
      return false;
    }
  }

  // Add to cart: asinkron karena perlu cek session di server
  async function addToCart(p) {
    const auth = await isAuthenticated();
    if (!auth) {
      alert('⚠️ Silakan login terlebih dahulu sebelum menambahkan produk ke keranjang.');
      router.push('/auth/login');
      return;
    }

    const title = p.title || p.name || 'Unknown';
    const exists = cart.find(i => i.name === title);
    let next;
    if (exists) {
      next = cart.map(i => i.name === title ? { ...i, qty: i.qty + 1 } : i);
    } else {
      next = [...cart, { product: p._id, name: title, price: p.price || 0, qty: 1 }];
    }
    saveCart(next);
  }

  // Kurangi / hapus item dari keranjang
  function removeFromCart(productName) {
    const exists = cart.find(i => i.name === productName);
    if (!exists) return;
    let next;
    if (exists.qty === 1) {
      next = cart.filter(i => i.name !== productName);
    } else {
      next = cart.map(i => i.name === productName ? { ...i, qty: i.qty - 1 } : i);
    }
    saveCart(next);
  }

  function getItemQuantity(productName) {
    const item = cart.find(i => i.name === productName);
    return item ? item.qty : 0;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${PRIMARY_BUTTON_DARK} 50%, ${GRADIENT_END} 100%)`,
    margin: '0',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const headerStyle = { textAlign: 'center', marginBottom: '40px' };
  const titleStyle = { color: 'white', fontSize: '2.5em', marginBottom: '25px', textShadow: '0 3px 6px rgba(0,0,0,0.3)', margin: '0 0 25px 0', fontWeight: '700' };
  const cartButtonStyle = {
    background: `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`,
    color: 'white',
    padding: '15px 35px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '1.2em',
    fontWeight: '700',
    display: 'inline-block',
    boxShadow: `0 6px 20px #10b98166`,
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

  const productNameStyle = { fontSize: '1.4em', fontWeight: '700', color: '#2c3e50', marginBottom: '10px', margin: '0 0 10px 0' };
  const productCategoryStyle = { color: '#6b7280', fontSize: '0.9em', marginBottom: '15px', backgroundColor: '#f9fafb', padding: '6px 15px', borderRadius: '20px', display: 'inline-block', fontWeight: '500' };
  const productPriceStyle = { fontSize: '1.4em', fontWeight: '800', color: PRIMARY_BUTTON_DARK, marginBottom: '20px' };
  const quantityControlStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '15px' };
  const quantityButtonStyle = { width: '40px', height: '40px', borderRadius: '50%', border: 'none', fontSize: '1.2em', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const minusButtonStyle = { ...quantityButtonStyle, background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', color: 'white' };
  const plusButtonStyle = { ...quantityButtonStyle, background: `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`, color: 'white' };
  const quantityDisplayStyle = { fontSize: '1.3em', fontWeight: '700', color: '#2c3e50', minWidth: '50px', textAlign: 'center' };
  const addToCartButtonStyle = { background: `linear-gradient(135deg, ${PRIMARY_BUTTON_LIGHT}, ${PRIMARY_BUTTON_DARK})`, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', fontSize: '1.1em', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'all 0.3s ease', boxShadow: `0 4px 15px rgba(16, 185, 129, 0.3)` };
  const pawIconStyle = { fontSize: '2em', marginBottom: '15px', color: 'white' };
  const totalItemsStyle = { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontSize: '1.1em', fontWeight: '600', marginBottom: '20px', display: 'inline-block' };
  const emptyStateStyle = { textAlign: 'center', color: 'white', fontSize: '1.2em', marginTop: '50px' };

  const getProductIcon = (category) => {
    switch (String(category || '').toLowerCase()) {
      case 'pet food': return '🍖';
      case 'cat food': return '🐱';
      case 'dog food': return '🐕';
      case 'bird food': return '🐦';
      default: return '🍽️';
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom: '40px' }}>
  <div style={{ textAlign:'center' }}>
    <h1 style={titleStyle}>Natural Nosh Store</h1>
  </div>

  <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', gap:12 }}>
    <a href="/checkout" style={cartButtonStyle}>🛒 CHECKOUT ({totalItems})</a>
    <UserMenu />
  </div>
</div>

      {products.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '3em', marginBottom: '20px' }}>🐾</div>
          <p>Loading produk amazing...</p>
        </div>
      ) : (
        <div style={productsGridStyle}>
          {products.map(p => {
            const title = p.title || p.name || 'Untitled';
            const category = p.category || p.categoryName || p.type || '';
            const price = p.price || 0;
            const quantity = getItemQuantity(title);

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
                  {getProductIcon(category)}
                </div>

                <h3 style={productNameStyle}>{title}</h3>
                <p style={productCategoryStyle}>{category}</p>
                <p style={productPriceStyle}>Rp {Number(price).toLocaleString()}</p>

                {quantity > 0 ? (
                  <div>
                    <div style={quantityControlStyle}>
                      <button
                        onClick={() => removeFromCart(title)}
                        style={minusButtonStyle}
                      >
                        −
                      </button>
                      <span style={quantityDisplayStyle}>{quantity}</span>
                      <button
                        onClick={() => addToCart({ ...p, title })}
                        style={plusButtonStyle}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.9em', color: '#059669', fontWeight: '600' }}>
                      ✅ Added to cart
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart({ ...p, title })}
                    style={addToCartButtonStyle}
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
