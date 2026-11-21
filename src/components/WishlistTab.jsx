import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { SectionTitle } from './ui.jsx';
import {
  encodeData, decodeData, makeId, emptyWishlist, loadWishlist, saveWishlist,
  guestUrl, blessingUrl,
} from '../wishlist.js';

const EMOJIS = ['🏔️', '🛋️', '📸', '🍽️', '🧺', '🏡', '✈️', '💍', '🎁', '🌸', '🎶', '🕯️'];

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function WishlistTab({ wedding }) {
  const [id, setId] = useState(() => {
    try {
      const existing = localStorage.getItem('wishlist_current_id');
      if (existing) return existing;
      const fresh = makeId();
      localStorage.setItem('wishlist_current_id', fresh);
      return fresh;
    } catch { return makeId(); }
  });
  const [data, setData] = useState(() => {
    const couple = wedding.user_name || 'The couple';
    return loadWishlist(id) || { ...emptyWishlist(couple), couple };
  });
  const [form, setForm] = useState({ emoji: '🎁', title: '', note: '', target: '' });
  const [qr, setQr] = useState('');
  const [board, setBoard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { saveWishlist(id, data); }, [id, data]);

  const link = useMemo(() => guestUrl(id, data), [id, data]);

  useEffect(() => {
    QRCode.toDataURL(link, { width: 420, margin: 2, color: { dark: '#111111', light: '#ffffff' } })
      .then(setQr).catch(() => setQr(''));
  }, [link]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const b = params.get('to');
    const hash = window.location.hash;
    if (b === 'couple' && hash.startsWith('#b=')) {
      const blessing = decodeData(hash.slice(3));
      if (blessing && blessing.id) {
        setData((d) => d.blessings.some((x) => x.id === blessing.id) ? d : { ...d, blessings: [blessing, ...d.blessings] });
        setNotice('A new blessing was added to your private board.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const addWish = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    setData((d) => ({
      ...d,
      wishes: [...d.wishes, {
        id: makeId(), emoji: form.emoji, title,
        note: form.note.trim(), target: Number(form.target) || 0,
      }],
    }));
    setForm({ emoji: '🎁', title: '', note: '', target: '' });
  };

  const removeWish = (wid) => setData((d) => ({ ...d, wishes: d.wishes.filter((w) => w.id !== wid) }));

  const toggleApprove = (bid) => setData((d) => ({
    ...d,
    approved: d.approved.includes(bid) ? d.approved.filter((x) => x !== bid) : [...d.approved, bid],
  }));

  const copy = (text) => {
    try { navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const importBlessings = () => {
    let imported = 0;
    setData((d) => {
      const next = { ...d };
      importText.split('\n').map((s) => s.trim()).filter(Boolean).forEach((url) => {
        try {
          const u = new URL(url);
          const h = u.hash;
          if (h.startsWith('#b=')) {
            const b = decodeData(h.slice(3));
            if (b && b.id && !next.blessings.some((x) => x.id === b.id)) {
              next.blessings = [b, ...next.blessings];
              imported += 1;
            }
          }
        } catch {}
      });
      return next;
    });
    setImportText('');
    setNotice(imported ? `Imported ${imported} blessing${imported > 1 ? 's' : ''}.` : 'No new blessings found in those links.');
  };

  const totalTarget = data.wishes.reduce((s, w) => s + (Number(w.target) || 0), 0);
  const totalPledged = data.blessings.filter((b) => b.type === 'pledge').reduce((s, b) => s + (Number(b.amount) || 0), 0);

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #EBEBEB',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', color: '#111',
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <SectionTitle>💝 Wishlist — let your guests be part of your dreams</SectionTitle>

      <div style={{ background: 'linear-gradient(135deg,#FBE8EF,#fff)', border: '1.5px solid #F2C4D4', borderRadius: 18, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#B83A64', marginBottom: 8 }}>
          Your wish page is ready — {data.wishes.length} wishes · {money(totalTarget)} dreamt of
        </div>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          Add wishes, share the page with friends and family, and let them help fulfil a wish or simply send a blessing.
          Messages stay private to you — approved ones can shine on the digital blessing board at your venue.
        </div>
        {notice && <div style={{ marginTop: 10, fontSize: 13, color: '#059669', fontWeight: 700 }}>{notice}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1.4fr 1fr', gap: 20 }}>
        <div>
          <div className="section-card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Your wishes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
              {data.wishes.map((w) => {
                const pledged = data.blessings
                  .filter((b) => b.type === 'pledge' && b.wishId === w.id)
                  .reduce((s, b) => s + (Number(b.amount) || 0), 0);
                return (
                  <div key={w.id} style={{ border: '1.5px solid #F3F4F6', borderRadius: 16, padding: 16, background: '#fff', position: 'relative' }}>
                    <button onClick={() => removeWish(w.id)} title="Remove" style={{ position: 'absolute', top: 8, right: 8, border: 'none', background: '#fee2e2', color: '#dc2626', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>×</button>
                    <div style={{ fontSize: 30, marginBottom: 6 }}>{w.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#1E293B', marginBottom: 4 }}>{w.title}</div>
                    {w.note && <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{w.note}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 10 }}>
                      <span style={{ color: '#94A3B8' }}>Dream budget</span>
                      <span style={{ fontWeight: 700, color: '#D4537E' }}>{money(w.target)}</span>
                    </div>
                    {pledged > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#059669', fontWeight: 700 }}>
                        {money(pledged)} pledged by loved ones
                      </div>
                    )}
                  </div>
                );
              })}
              {data.wishes.length === 0 && <div style={{ color: '#999', fontSize: 13 }}>No wishes yet. Add your first dream below.</div>}
            </div>
          </div>

          <form className="section-card" onSubmit={addWish} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>+ Add a wish</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => setForm({ ...form, emoji: e })} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${form.emoji === e ? '#D4537E' : '#EBEBEB'}`, background: form.emoji === e ? '#FBE8EF' : '#fff', cursor: 'pointer', fontSize: 16 }}>{e}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <input required placeholder="Wish title — e.g. Honeymoon trip to Kashmir" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              <input placeholder="A short note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="number" min="0" placeholder="Dream amount (₹)" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} style={{ ...inputStyle, maxWidth: 220 }} />
              <button type="submit" className="btn-primary" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 14 }}>Add wish</button>
            </div>
          </form>

          <div className="section-card">
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Private blessing inbox</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Only you can see these. Approve a message to show it on the venue screen.</div>
            {data.blessings.length === 0 && <div style={{ fontSize: 13, color: '#999' }}>No blessings yet — share your page to receive them.</div>}
            {data.blessings.map((b) => (
              <div key={b.id} style={{ border: '1px solid #F0F0F0', borderRadius: 12, padding: 14, marginBottom: 10, background: data.approved.includes(b.id) ? '#F0FDF4' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{b.name || 'A guest'}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: b.type === 'pledge' ? '#FBE8EF' : '#DCFCE7', color: b.type === 'pledge' ? '#B83A64' : '#166534' }}>
                    {b.type === 'pledge' ? `Helped with ${money(b.amount)}` : 'Blessing'}
                  </span>
                </div>
                {b.wishTitle && <div style={{ fontSize: 12, color: '#D4537E', fontWeight: 600, marginTop: 4 }}>For: {b.wishTitle}</div>}
                {b.message && <div style={{ fontSize: 13, color: '#4B5563', marginTop: 8, fontStyle: 'italic' }}>“{b.message}”</div>}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, fontWeight: 700, color: '#059669', cursor: 'pointer' }}>
                  <input type="checkbox" checked={data.approved.includes(b.id)} onChange={() => toggleApprove(b.id)} />
                  Show on digital blessing board
                </label>
              </div>
            ))}
            <div style={{ marginTop: 16, borderTop: '1px dashed #EBEBEB', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Received a blessing link from a guest? Paste it here</div>
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste one blessing link per line" style={{ ...inputStyle, minHeight: 70, marginBottom: 8 }} />
              <button onClick={importBlessings} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Import blessings</button>
            </div>
          </div>
        </div>

        <div>
          <div className="section-card" style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Share your wish page</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Guests view wishes, help fulfil one, or send a blessing.</div>
            {qr && <img src={qr} alt="Wish page QR" style={{ width: 190, height: 190, borderRadius: 12, margin: '0 auto 14px', display: 'block' }} />}
            <button className="btn-primary" onClick={() => copy(link)} style={{ padding: '12px 22px', borderRadius: 10, fontSize: 14 }}>
              {copied ? 'Copied ✓' : 'Copy guest link'}
            </button>
            <div style={{ fontSize: 11, color: '#999', marginTop: 10, wordBreak: 'break-all' }}>{link}</div>
          </div>

          <div className="section-card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Digital Blessing Board</div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>
              At the venue, display this QR code. Guests scan it, send wishes from their phones, and approved messages appear on the screen.
            </div>
            <div style={{ background: '#111', color: '#fff', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 26, marginBottom: 6 }}>{data.couple || 'Our Wedding'}</div>
              <div style={{ fontSize: 12, color: '#ffb703', letterSpacing: 2, marginBottom: 16 }}>SCAN &amp; SEND A BLESSING</div>
              {qr && <img src={qr} alt="QR" style={{ width: 150, height: 150, background: '#fff', borderRadius: 8, padding: 6 }} />}
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 16 }}>
                {data.approved.length} approved message{data.approved.length === 1 ? '' : 's'} on the board
              </div>
            </div>
            <button
              onClick={() => setBoard(true)}
              style={{ width: '100%', marginTop: 12, padding: 12, borderRadius: 10, border: 'none', background: '#D4537E', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Open fullscreen display
            </button>
          </div>

          <div className="section-card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>At a glance</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span style={{ color: '#888' }}>Dream total</span><strong>{money(totalTarget)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#888' }}>Pledged by guests</span><strong style={{ color: '#059669' }}>{money(totalPledged)}</strong></div>
          </div>
        </div>
      </div>

      {board && (
        <div style={{ position: 'fixed', inset: 0, background: '#0b1020', zIndex: 10000, overflow: 'auto', padding: 40, color: '#fff' }}>
          <button onClick={() => setBoard(false)} style={{ position: 'fixed', top: 20, right: 20, background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', borderRadius: 50, padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>Exit display ✕</button>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontFamily: "'EB Garamond',serif", fontSize: 'clamp(2rem,5vw,4rem)' }}>{data.couple || 'Our Wedding'} — Blessings</div>
            <div style={{ color: '#ffb703', letterSpacing: 3, fontSize: 14 }}>SCAN THE QR TO SEND YOUR WISH</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
            {data.blessings.filter((b) => data.approved.includes(b.id)).map((b, i) => (
              <div key={b.id} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: 26, animation: `blessingIn .6s ease ${i * 0.08}s both` }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffb703', marginBottom: 12 }}>{b.name || 'A guest'}</div>
                <div style={{ fontSize: 20, fontFamily: "'EB Garamond',serif", lineHeight: 1.5 }}>“{b.message}”</div>
              </div>
            ))}
            {data.approved.length === 0 && <div style={{ color: '#8892a8', textAlign: 'center', gridColumn: '1/-1', fontSize: 18 }}>Approve blessings from your private inbox to display them here.</div>}
          </div>
          <style>{`@keyframes blessingIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
        </div>
      )}
    </div>
  );
}
