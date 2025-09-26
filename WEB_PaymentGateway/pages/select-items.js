import { useEffect, useState } from 'react';

export default function SelectItems() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(d.products || []));
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  function addToCart(p) {
    const exists = cart.find(i => i.name === p.name);
    let next;
    if (exists) {
      next = cart.map(i => i.name === p.name ? { ...i, qty: i.qty + 1 } : i);
    } else {
      next = [...cart, { product: p._id, name: p.name, price: p.price, qty: 1 }];
    }
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  }

  return (
    <div>
      <h1>Daftar Makanan Hewan</h1>
      <a href="/checkout">Go to checkout ({cart.reduce((s, i) => s + i.qty, 0)})</a>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
        {products.map(p => (
          <div key={p._id} style={{ border: '1px solid #ddd', padding: 12 }}>
            <h3>{p.name}</h3>
            <p>{p.category}</p>
            <p>Rp {p.price.toLocaleString()}</p>
            <button onClick={() => addToCart(p)}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
