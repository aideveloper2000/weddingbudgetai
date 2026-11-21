import { useMemo, useState } from 'react';
import { decodeData, loadWishlist, saveWishlist, makeId, blessingUrl } from '../wishlist.js';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function GuestWishlist() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('wishlist') || '';
  const hash = window.location.hash;

  const snapshot = useMemo(() => {
    if (hash.startsWith('#w=')) return decodeData(hash.slice(3));
    if (hash.startsWith('#b=')) return decodeData(hash.slice(3));
    return null;
  }, [hash]);

  const local = id ? loadWishlist(id) : null;
  const couple = snapshot?.couple || local?.couple || 'The happy couple';
  const wishes = snapshot?.wishes || local?.wishes || [];

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [wishId, setWishId] = useState('');
  const [type, setType] = useState('blessing');
  const [amount, setAmount] = useState('');
  const [sent, setSent] = useState(null);

  const inputStyle = {
    width: '100%', padding: '13px 16px', border: '1.5px solid #EBEBEB',
    borderRadius: 12, fontSize: 15, outline: 'none', background: '#fff', color: '#111',
    fontFamily: "'DM Sans','Inter',sans-serif",
  };

  const submit = (e) => {
    e.preventDefault();
    const wish = wishes.find((w) => w.id === wishId);
    const blessing = {
      id: makeId(),
      name: name.trim() || 'A guest',
      message: message.trim(),
      type,
      wishId,
      wishTitle: wish?.title || '',
      amount: type === 'pledge' ? Number(amount) || 0 : 0,
      time: new Date().toISOString(),
    };
    if (local) {
      saveWishlist(id, { ...local, blessings: [blessing, ...(local.blessings || [])] });
    }
    setSent(blessing);
  };

  const link = sent ? blessingUrl(id, sent) : '';
  const whatsapp = sent
    ? `https://wa.me/?text=${encodeURIComponent(`A blessing for ${couple} 💝\n${link}`)}`
    : '';

  return (
    <div style={{ minHeight: '100vh', background: '#fffbfd', fontFamily: "'DM Sans','Inter',sans-serif", padding: '60px 20px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💍</div>
          <div style={{ fontSize: 12, letterSpacing: 3, color: '#D4537E', fontWeight: 800, marginBottom: 10 }}>WEDDING WISHLIST</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,6vw,3.2rem)', color: '#1a1a2e', marginBottom: 12 }}>
            Help make {couple}'s dreams come true
          </h1>
          <p style={{ color: '#666', lineHeight: 1.7, maxWidth: 620, margin: '0 auto' }}>
            Every wish here is something the couple is dreaming of — a honeymoon, a new home, a memory to keep.
            Choose to help fulfil a wish, or simply leave a blessing and a few words. Every gesture means the world.
          </p>
        </div>

        {sent ? (
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #F2C4D4', padding: 40, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.08)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>💌</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, marginBottom: 10 }}>Thank you, {sent.name}!</h2>
            <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 24 }}>
              {local
                ? 'Your message has been saved to the couple’s private blessing board.'
                : 'Your blessing is ready. Send it to the couple using the button below — only they will see it.'}
            </p>
            <div style={{ background: '#FBE8EF', color: '#B83A64', borderRadius: 14, padding: 18, marginBottom: 24, fontSize: 14, textAlign: 'left' }}>
              <strong>{sent.type === 'pledge' ? `You chose to help with ${money(sent.amount)}` : 'You sent a blessing'}</strong>
              {sent.wishTitle && <div style={{ marginTop: 4 }}>For: {sent.wishTitle}</div>}
              {sent.message && <div style={{ marginTop: 8, fontStyle: 'italic' }}>“{sent.message}”</div>}
            </div>
            {!local && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '14px 28px', borderRadius: 12, textDecoration: 'none', fontSize: 15 }}>
                  Send blessing to the couple on WhatsApp ↗
                </a>
                <button onClick={() => { try { navigator.clipboard.writeText(link); } catch {} }} style={{ background: 'none', border: 'none', color: '#D4537E', fontWeight: 700, cursor: 'pointer' }}>
                  Copy private blessing link
                </button>
                <div style={{ fontSize: 11, color: '#aaa', wordBreak: 'break-all', maxWidth: 560 }}>{link}</div>
              </div>
            )}
            <button onClick={() => { setSent(null); setMessage(''); setAmount(''); }} style={{ marginTop: 20, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13 }}>
              ← Send another blessing
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 36 }}>
              {wishes.map((w) => (
                <div key={w.id} style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: 20, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,.04)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{w.emoji}</div>
                  <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>{w.title}</div>
                  {w.note && <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>{w.note}</div>}
                  {w.target > 0 && <div style={{ fontSize: 12, color: '#D4537E', fontWeight: 700 }}>Dream budget {money(w.target)}</div>}
                </div>
              ))}
              {wishes.length === 0 && <div style={{ color: '#999' }}>The couple is still adding their wishes. Check back soon.</div>}
            </div>

            <form onSubmit={submit} style={{ background: '#fff', borderRadius: 24, border: '1px solid #F2C4D4', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.06)' }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, marginBottom: 20 }}>Leave your mark on their day</h2>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                <select value={wishId} onChange={(e) => setWishId(e.target.value)} style={inputStyle}>
                  <option value="">General blessing (no wish)</option>
                  {wishes.map((w) => <option key={w.id} value={w.id}>{w.emoji} {w.title}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                <button type="button" onClick={() => setType('blessing')} style={{ flex: 1, minWidth: 180, padding: 14, borderRadius: 12, border: type === 'blessing' ? '2px solid #D4537E' : '1.5px solid #EBEBEB', background: type === 'blessing' ? '#FBE8EF' : '#fff', fontWeight: 700, cursor: 'pointer', color: '#B83A64' }}>
                  💌 Just send a blessing
                </button>
                <button type="button" onClick={() => setType('pledge')} style={{ flex: 1, minWidth: 180, padding: 14, borderRadius: 12, border: type === 'pledge' ? '2px solid #D4537E' : '1.5px solid #EBEBEB', background: type === 'pledge' ? '#FBE8EF' : '#fff', fontWeight: 700, cursor: 'pointer', color: '#B83A64' }}>
                  🎁 Help fulfil a wish
                </button>
              </div>
              {type === 'pledge' && (
                <input required type="number" min="1" placeholder="Amount you'd like to contribute (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />
              )}
              <textarea required placeholder="Write your blessing or a few kind words…" value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, minHeight: 120, marginBottom: 18 }} />
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, fontSize: 16 }}>
                {type === 'pledge' ? 'Send my gift & blessing' : 'Send my blessing'} →
              </button>
              <div style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 12 }}>
                Your message goes privately to the couple. Nothing is shared with other guests.
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
