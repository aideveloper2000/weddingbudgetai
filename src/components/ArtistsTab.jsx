import { useEffect, useState } from 'react';
import SelectionCard from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';
import { ARTISTS, CELEBRITY_ARTISTS, SFX_ITEMS } from '../data/index.js';

// Faithful port of the original Artists tab (`xS`): DJ/live entertainment tiers
// plus celebrity performers and special-effects add-ons.
export default function ArtistsTab({ wedding, update }) {
  const [dbArtists, setDbArtists] = useState([]);

  useEffect(() => {
    fetch('https://wedddingbudget-ai.onrender.com/api/vendors/approved?category=Artist')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setDbArtists(d))
      .catch(() => {});
  }, []);

  const toggle = (id) => {
    const list = wedding.selected_artists || [];
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    update('selected_artists', next);
  };

  const artistTotal = (wedding.selected_artists || []).reduce((sum, id) => {
    const a = ARTISTS.find((x) => x.id === id) || CELEBRITY_ARTISTS.find((x) => x.id === id);
    if (!a) return sum;
    return sum + (a.fee_low || parseCost(a.cost) || 0);
  }, 0);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card">
        <SectionTitle>DJs &amp; Live Entertainment</SectionTitle>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Pick the acts for your sangeet, cocktail and reception.</p>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {ARTISTS.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={(wedding.selected_artists || []).includes(item.id)}
              onClick={toggle}
              showCost
              badge="ARTIST"
              actionLabel="Book Artist"
            />
          ))}
        </div>
      </section>

      <section className="section-card">
        <SectionTitle>Celebrity Performers</SectionTitle>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {CELEBRITY_ARTISTS.map((item) => (
            <SelectionCard
              key={item.id}
              item={{
                ...item,
                label: item.name,
                badge: item.genre?.toUpperCase(),
                budget: item.fee_low ? `₹${(item.fee_low / 100000).toFixed(0)}L–₹${(item.fee_high / 100000).toFixed(0)}L` : '',
                actionLabel: 'Request Booking',
              }}
              selected={(wedding.selected_artists || []).includes(item.id)}
              onClick={toggle}
              location="Pan India"
            />
          ))}
        </div>
      </section>

      <section className="section-card">
        <SectionTitle>Special Effects &amp; Moments</SectionTitle>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {SFX_ITEMS.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={(wedding.sfx_items || []).includes(item.id)}
              onClick={(id) => {
                const list = wedding.sfx_items || [];
                update('sfx_items', list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
              }}
              showCost
              badge="EFFECT"
              actionLabel="Add Effect"
            />
          ))}
        </div>
      </section>

      {dbArtists.length > 0 && (
        <section className="section-card">
          <SectionTitle>More from our partner network</SectionTitle>
          <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
            {dbArtists.slice(0, 8).map((a, i) => (
              <SelectionCard
                key={a.id || i}
                item={{
                  ...a,
                  label: a.business || a.name,
                  imageUrl: a.image_url || a.photo_url,
                  badge: 'PARTNER',
                  budget: a.cost_range || '',
                }}
                selected={(wedding.selected_artists || []).includes(a.id)}
                onClick={toggle}
                location={a.city || 'India'}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section-card">
        <div style={{ padding: 16, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
          Artists subtotal: <span style={{ color: '#D4537E' }}>{artistTotal ? `₹${artistTotal.toLocaleString('en-IN')}` : 'Select artists to estimate'}</span>
        </div>
      </section>
    </div>
  );
}

function parseCost(str) {
  if (!str) return 0;
  const nums = str.replace(/[^\d.]/g, ' ').split(/\s+/).filter(Boolean).map(Number);
  if (!nums.length) return 0;
  // "₹60K–₹2L" -> treat the low number as the base
  return nums[0] * (/L/.test(str) ? 100000 : 1000);
}
