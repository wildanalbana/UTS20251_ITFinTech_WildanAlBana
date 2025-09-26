// pages/payment.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentStatus() {
  const router = useRouter();
  const { external_id } = router.query;
  const [status, setStatus] = useState('LOADING');

  useEffect(() => {
    if (!external_id) return;
    const iv = setInterval(async () => {
      const r = await fetch(`/api/payment/status?external_id=${external_id}`);
      const d = await r.json();
      setStatus(d.status || 'PENDING');
      if (d.status === 'PAID' || d.status === 'EXPIRED') clearInterval(iv);
    }, 3000);
    return () => clearInterval(iv);
  }, [external_id]);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Status Pembayaran</h1>
      <p>Order ID: {external_id}</p>
      <p>Status: {status}</p>
    </div>
  );
}
