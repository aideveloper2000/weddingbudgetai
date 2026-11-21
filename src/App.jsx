import { useEffect, useState } from 'react';
import Landing from './components/Landing.jsx';
import Planner from './components/Planner.jsx';
import GuestWishlist from './components/GuestWishlist.jsx';
import { DEFAULT_WEDDING } from './data/index.js';

function loadWedding() {
  try {
    const raw = localStorage.getItem('weddingState');
    if (raw) return { ...DEFAULT_WEDDING, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_WEDDING };
}

export default function App() {
  const initialParams = new URLSearchParams(window.location.search);
  const isCoupleImport = initialParams.get('to') === 'couple';
  const [wedding, setWedding] = useState(loadWedding);
  const [view, setView] = useState(isCoupleImport ? 'planner' : 'landing');
  const [activeTab, setActiveTab] = useState(isCoupleImport ? 10 : 0);
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', phone: '', business: '' });
  const [vendorSent, setVendorSent] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('weddingState', JSON.stringify(wedding)); } catch {}
  }, [wedding]);

  const update = (key, value) => setWedding((w) => ({ ...w, [key]: value }));
  const updateMany = (obj) => setWedding((w) => ({ ...w, ...obj }));

  const start = (tab = 0) => {
    setActiveTab(typeof tab === 'number' ? tab : 0);
    setView('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (initialParams.has('wishlist') && initialParams.get('to') !== 'couple') {
    return <GuestWishlist />;
  }

  if (view === 'planner') {
    return (
      <Planner
        wedding={wedding}
        update={update}
        updateMany={updateMany}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExit={() => setView('landing')}
      />
    );
  }

  if (view === 'vendor') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', padding: '60px 20px', fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <button onClick={() => setView('landing')} style={{ background: 'none', border: 'none', color: '#D4537E', fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>← Back</button>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.5rem', marginBottom: 12 }}>Register as a Vendor</h1>
          <p style={{ color: '#666', marginBottom: 32 }}>Want to list your venue or wedding services here? Join us today!</p>
          {vendorSent ? (
            <div style={{ background: '#DCFCE7', color: '#166534', padding: 24, borderRadius: 16, fontWeight: 700 }}>
              Thank you! Our team will contact you shortly.
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await fetch('https://wedddingbudget-ai.onrender.com/api/vendors/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vendorForm),
                  });
                } catch {}
                setVendorSent(true);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {[
                ['name', 'Your Name'],
                ['email', 'Email Address'],
                ['phone', 'Phone Number'],
                ['business', 'Business / Venue Name'],
              ].map(([key, label]) => (
                <input
                  key={key}
                  required
                  placeholder={label}
                  value={vendorForm[key]}
                  onChange={(e) => setVendorForm({ ...vendorForm, [key]: e.target.value })}
                  style={{ padding: '14px 16px', border: '1.5px solid #EBEBEB', borderRadius: 12, fontSize: 15, outline: 'none' }}
                />
              ))}
              <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: 12, fontSize: 15 }}>Submit Registration</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <Landing
      onStart={start}
      onVendor={() => setView('vendor')}
      onVenueExplore={(city) => {
        if (city) update('wedding_district', city);
        start(1);
      }}
    />
  );
}
