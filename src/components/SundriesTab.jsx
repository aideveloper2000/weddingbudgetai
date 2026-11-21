import { useState } from 'react';
import SelectionCard from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';

// Port of the original Sundries tab (`vS`): room basket, welcome kits and misc basics.
const SUNDRY_ITEMS = [
  { id: 'room_basket', label: 'Room Basket', cost: '₹800/room', desc: 'Mineral water, snacks & essentials' },
  { id: 'welcome_kit', label: 'Welcome Kit', cost: '₹450/guest', desc: 'Itinerary, snacks, gratitude note' },
  { id: 'gift_hampers', label: 'Gift Hampers', cost: '₹1,200/piece', desc: 'Return gifts for family' },
  { id: 'pooja_samagri', label: 'Pooja Samagri Kit', cost: '₹3,500', desc: 'Complete ritual set per ceremony' },
  { id: 'mehendi_kit', label: 'Mehendi Kit', cost: '₹600/guest', desc: 'Henna, cotton & finishing spray' },
  { id: 'turmeric_pack', label: 'Haldi Turmeric Pack', cost: '₹900/event', desc: 'Organic haldi + utensils' },
  { id: 'safety_kit', label: 'Safety & First Aid', cost: '₹2,500', desc: 'On-site first-aid station' },
  { id: 'signage', label: 'Signage & Welcome Boards', cost: '₹12,000', desc: 'Directional & welcome signage' },
  { id: 'power_backup', label: 'Power Backup (silent)', cost: '₹18,000/day', desc: 'DG set with operator' },
  { id: 'wifi', label: 'Dedicated Wi-Fi', cost: '₹6,000/day', desc: 'High-speed guest internet' },
];

export default function SundriesTab({ wedding, update }) {
  const [overrides, setOverrides] = useState(wedding.sundry_overrides || {});

  const selected = Object.keys(overrides).filter((k) => overrides[k]);
  const total = selected.reduce((sum, id) => {
    const item = SUNDRY_ITEMS.find((x) => x.id === id);
    if (!item) return sum;
    const n = Number((item.cost.match(/\d[\d,]*/) || ['0'])[0].replace(/,/g, '')) || 0;
    if (/room/.test(item.cost)) return sum + n * (wedding.num_rooms || 0);
    if (/guest/.test(item.cost)) return sum + n * (wedding.total_guests || 0);
    if (/day/.test(item.cost)) return sum + n * (wedding.num_days || 1);
    return sum + n;
  }, 0);

  const toggle = (id) => {
    const next = { ...overrides, [id]: !overrides[id] };
    setOverrides(next);
    update('sundry_overrides', next);
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card">
        <SectionTitle>Sundries &amp; Basics</SectionTitle>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Everything that makes guests comfortable.</p>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
          {SUNDRY_ITEMS.map((item) => (
            <SelectionCard
              key={item.id}
              item={{
                ...item,
                imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=250&fit=crop',
                badge: 'BASIC',
                budget: item.cost,
                actionLabel: overrides[item.id] ? 'Selected' : 'Add Item',
              }}
              selected={!!overrides[item.id]}
              onClick={toggle}
            />
          ))}
        </div>
        <div style={{ marginTop: 18, padding: 16, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
          Sundries subtotal: <span style={{ color: '#D4537E' }}>{selected.length ? `₹${total.toLocaleString('en-IN')}` : 'No items selected'}</span>
        </div>
      </section>
    </div>
  );
}
