'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { pujas } from '@/lib/pujas';

export default function BookPage() {
  const params = useSearchParams();
  const selectedId = params.get('puja') || pujas[0].id;
  const puja = useMemo(() => pujas.find((item) => item.id === selectedId) || pujas[0], [selectedId]);
  const [form, setForm] = useState({ name: '', gotra: '', phone: '', email: '', date: '', purpose: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage('Please enter devotee name.');
      return;
    }
    setSaving(true);
    setMessage('');
    const orderId = `WEB${Date.now().toString().slice(-8)}`;
    try {
      await setDoc(doc(db, 'bookings', orderId), {
        orderId,
        channel: 'website',
        pujaId: puja.id,
        pujaName: puja.name,
        temple: puja.temple,
        amount: puja.price,
        userName: form.name.trim(),
        userPhone: form.phone.trim(),
        userEmail: form.email.trim(),
        date: form.date,
        devotee: {
          name: form.name.trim(),
          gotra: form.gotra.trim(),
          phone: form.phone.trim(),
          purpose: form.purpose.trim(),
        },
        status: 'Website Request',
        paymentStatus: 'test_mode_not_collected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'bookingOpsShares', orderId), {
        devoteeName: form.name.trim(),
        gotra: form.gotra.trim(),
      });
      await addDoc(collection(db, 'adminNotifications'), {
        audience: 'admin',
        orderId,
        title: 'New website booking request',
        message: `${puja.name} requested by ${form.name.trim()}. Payment is not collected on website yet.`,
        unread: true,
        createdAt: new Date().toISOString(),
      });
      setMessage(`Request saved. Reference: ${orderId}`);
      setForm({ name: '', gotra: '', phone: '', email: '', date: '', purpose: '' });
    } catch (error) {
      setMessage(error.message || 'Could not save request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main>
      <header className="topbar">
        <Link href="/" className="brand">BhaktiSetu</Link>
        <nav><Link href="/">Home</Link><Link href="/admin">Admin</Link></nav>
      </header>
      <section className="formShell">
        <div className="formIntro">
          <img src={puja.image} alt={puja.name} />
          <p className="eyebrow">Website request mode</p>
          <h1>{puja.name}</h1>
          <p>{puja.temple}</p>
          <strong>Rs {puja.price.toLocaleString()}</strong>
          <p className="muted">Razorpay live payment will be enabled after bank/account setup. This website currently records booking requests only.</p>
        </div>
        <form className="bookingForm" onSubmit={submit}>
          <label>Name<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Devotee full name" /></label>
          <label>Gotra<input value={form.gotra} onChange={(e) => update('gotra', e.target.value)} placeholder="e.g. Bhardwaj" /></label>
          <label>Phone<input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91" /></label>
          <label>Email<input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" /></label>
          <label>Preferred Date<input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} /></label>
          <label>Purpose<textarea value={form.purpose} onChange={(e) => update('purpose', e.target.value)} placeholder="Purpose of puja" /></label>
          <button className="primaryBtn" disabled={saving}>{saving ? 'Saving...' : 'Submit Request'}</button>
          {message ? <p className="formMessage">{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
