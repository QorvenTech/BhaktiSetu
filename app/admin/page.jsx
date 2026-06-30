'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { Eye, Lock, LogOut, Share2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { getAccess } from '@/lib/access';

const shareText = (row) => `Name: ${row.devoteeName || 'Devotee'}\nGotra: ${row.gotra || 'Not provided'}`;

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opsRows, setOpsRows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ops');

  const access = useMemo(() => getAccess(profile), [profile]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setProfile(null);
      if (nextUser) {
        const snap = await getDoc(doc(db, 'users', nextUser.uid));
        setProfile(snap.exists() ? snap.data() : null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!access.canOpenAdmin) return;
      setError('');
      try {
        const opsSnap = await getDocs(collection(db, 'bookingOpsShares'));
        setOpsRows(opsSnap.docs.map((row) => ({ id: row.id, ...row.data() })));
        if (access.canManageAllData) {
          const bookingSnap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
          setBookings(bookingSnap.docs.map((row) => ({ id: row.id, ...row.data() })));
        }
      } catch (err) {
        setError(err.message || 'Could not load admin data.');
      }
    };
    load();
  }, [access.canOpenAdmin, access.canManageAllData]);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  const forward = async (row) => {
    const message = shareText(row);
    if (navigator.share) await navigator.share({ text: message });
    else await navigator.clipboard.writeText(message);
  };

  if (loading) return <main className="centerShell">Loading...</main>;

  if (!user) {
    return (
      <main className="centerShell">
        <form className="loginBox" onSubmit={login}>
          <Link href="/" className="brand">BhaktiSetu</Link>
          <h1>Team Login</h1>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button className="primaryBtn">Login</button>
          {error ? <p className="formMessage error">{error}</p> : null}
        </form>
      </main>
    );
  }

  if (!access.canOpenAdmin) {
    return (
      <main className="centerShell">
        <div className="loginBox">
          <Lock size={28} />
          <h1>Access Restricted</h1>
          <p>Your account does not have owner or operations access.</p>
          <button className="secondaryBtn" onClick={() => signOut(auth)}>Logout</button>
        </div>
      </main>
    );
  }

  const tabs = access.canManageAllData ? ['ops', 'bookings'] : ['ops'];

  return (
    <main>
      <header className="topbar">
        <Link href="/" className="brand">BhaktiSetu</Link>
        <nav>
          <span className="rolePill">{access.canManageAllData ? 'Owner' : 'Ops only'}</span>
          <button className="iconButton" onClick={() => signOut(auth)}><LogOut size={16} /> Logout</button>
        </nav>
      </header>
      <section className="adminShell">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">Secure dashboard</p>
            <h1>Admin Panel</h1>
          </div>
          <div className="tabs">{tabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab === 'ops' ? 'Ops View' : 'Bookings'}</button>)}</div>
        </div>
        {error ? <p className="formMessage error">{error}</p> : null}

        {activeTab === 'ops' ? (
          <div className="adminGrid">
            {opsRows.map((row) => (
              <article className="opsCard" key={row.id}>
                <Eye size={18} />
                <h3>{row.devoteeName || 'Devotee'}</h3>
                <p>Gotra: {row.gotra || 'Not provided'}</p>
                <button className="cardBtn" onClick={() => forward(row)}><Share2 size={15} /> Forward Name & Gotra</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="tableShell">
            <table>
              <thead><tr><th>Order</th><th>Puja</th><th>User</th><th>Phone</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>{bookings.map((row) => <tr key={row.id}><td>{row.orderId || row.id}</td><td>{row.pujaName}</td><td>{row.userName}</td><td>{row.userPhone}</td><td>Rs {Number(row.amount || 0).toLocaleString()}</td><td>{row.status}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
