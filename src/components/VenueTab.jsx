import { useEffect, useState } from 'react';
import { CITY_VENUES, FALLBACK_VENUES, cityRatesFor, venueTypeOf } from '../data/index.js';
import SelectionCard, { formatINR } from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';

// Faithful port of the original Venue tab (`lS`) — 3 sub-steps:
// Select Destination -> Configure Setup -> Discover Venues.
export default function VenueTab({ wedding, update, updateMany }) {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState([]);

  const destinations = Object.keys(CITY_VENUES).filter((c) => c !== '_generic');
  const filtered = destinations.filter(
    (c) =>
      c.toLowerCase().includes(query.toLowerCase()) ||
      (CITY_VENUES[c]?.[0]?.state || '').toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!wedding.wedding_district || step !== 3) return;
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const res = await fetch(
          `https://wedddingbudget-ai.onrender.com/api/venues/?city=${encodeURIComponent(wedding.wedding_district)}&venue_type=${encodeURIComponent(wedding.venue_type || '')}`
        );
        let data = [];
        if (res.ok) data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('empty');
        if (!cancelled) setVenues(data.map((v) => ({ ...v, id: v.id || v.place_id })));
      } catch {
        if (!cancelled) {
          const key = Object.keys(CITY_VENUES).find(
            (c) => wedding.wedding_district && (wedding.wedding_district.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(wedding.wedding_district.toLowerCase()))
          );
          const list = (key ? CITY_VENUES[key] : FALLBACK_VENUES.Bengaluru) || [];
          setVenues(
            list.map((v) => ({
              ...v,
              price: v.cost_per_day || 250000,
              pax: `${Math.round(v.capacity * 0.8)} - ${v.capacity}`,
              rating: 4.8,
              reviews: 1200 + (v.name?.length || 0) * 10,
              badges: ['Verified'],
              imageUrl: v.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
              id: v.id || `fallback_${v.name}`,
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [wedding.wedding_district, wedding.venue_type, step]);

  const steps = ['Select Destination', 'Configure Setup', 'Discover Venues'];
  const isMobile = window.innerWidth < 960;

  const selectVenue = (venue) => {
    updateMany({
      mandapam_id: venue.place_id || venue.id,
      mandapam_name: venue.name,
      mandapam_cost_per_day: venue.price || venue.cost_per_day || 150000,
      wedding_district: venue.city || wedding.wedding_district,
    });
    window.dispatchEvent(new CustomEvent('weddingGoToTab', { detail: 2 }));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 100, paddingLeft: window.innerWidth < 640 ? 16 : 24, paddingRight: window.innerWidth < 640 ? 16 : 24, fontFamily: "'Open Sans', sans-serif", width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* progress */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? 12 : 60, marginBottom: isMobile ? 24 : 50, padding: isMobile ? '10px 0' : '20px 0', width: '100%', flexWrap: 'wrap' }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => step > n && setStep(n)}>
            <div style={{
              width: window.innerWidth < 480 ? 28 : isMobile ? 32 : 44, height: window.innerWidth < 480 ? 28 : isMobile ? 32 : 44,
              borderRadius: '50%', background: step === n || step > n ? '#e91e63' : '#eee', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
              fontSize: window.innerWidth < 480 ? 12 : isMobile ? 14 : 16, transition: 'all 0.3s',
              boxShadow: step === n ? '0 0 0 6px #F472B620' : 'none', position: 'relative', zIndex: 2,
            }}>
              {step > n ? '✓' : n}
            </div>
            <div style={{ fontSize: window.innerWidth < 480 ? 8 : 10, fontWeight: 800, color: step === n ? '#e91e63' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: window.innerWidth < 480 ? 0.5 : 1, textAlign: 'center', whiteSpace: window.innerWidth < 480 ? 'normal' : 'nowrap', wordBreak: 'break-word', width: '100%', lineHeight: 1.2 }}>
              {steps[n - 1]}
            </div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: window.innerWidth < 640 ? 32 : 48, fontWeight: 900, color: '#A12B5E', marginBottom: 12, fontFamily: "'EB Garamond', serif", wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              Where are you saying "I Do"?
            </h2>
            <p style={{ color: '#4D4D4D', fontSize: window.innerWidth < 640 ? 16 : 18 }}>Select a destination for your luxury celebration</p>
            <input
              type="text"
              placeholder="Search city or state..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', maxWidth: 600, padding: '20px 32px', borderRadius: 100, border: '1.5px solid #E5E7EB', outline: 'none', fontSize: 16, marginTop: 20 }}
            />
          </div>
          <div className="premium-card-grid">
            {filtered.map((city) => {
              const sample = (CITY_VENUES[city] || [])[0];
              const rate = cityRatesFor(city);
              return (
                <div
                  key={city}
                  onClick={() => { update('wedding_district', city); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="premium-venue-card"
                  style={{ textAlign: 'left' }}
                >
                  <div className="premium-image-wrapper">
                    <img src={sample?.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'} alt={city} />
                    <span className="badge-venue" style={{ position: 'absolute', top: 10, left: 10 }}>{(CITY_VENUES[city] || []).length} venues</span>
                  </div>
                  <div className="premium-card-body">
                    <div className="premium-card-top">
                      <div className="premium-venue-name">{city}</div>
                    </div>
                    <div className="premium-venue-loc">{(sample?.state || rate.label || 'India').toUpperCase()}</div>
                    <div className="premium-info-row">
                      <div className="premium-info-box">
                        <div className="info-box-label">Base Price</div>
                        <div className="info-box-val">{formatINR(sample?.cost_per_day || 250000)}</div>
                      </div>
                      <div className="premium-info-box">
                        <div className="info-box-label">Capacity</div>
                        <div className="info-box-val">{sample?.capacity ? `${sample.capacity} pax` : '500+'}</div>
                      </div>
                    </div>
                    <button className="premium-action-btn">View Venues →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="section-card" style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionTitle>Configure Your Setup</SectionTitle>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <label className="form-label">Venue Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                {['Hotel', 'Resort', 'Palace', 'Banquet Hall'].map((t) => (
                  <button
                    key={t}
                    onClick={() => update('venue_type', wedding.venue_type === t ? '' : t)}
                    style={{
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                      border: wedding.venue_type === t ? '2px solid #e91e63' : '1.5px solid #EBEBEB',
                      background: wedding.venue_type === t ? '#FDF2F8' : '#fff', color: wedding.venue_type === t ? '#e91e63' : '#333',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="form-input" placeholder="e.g. Karnataka" value={wedding.wedding_state || ''} onChange={(e) => update('wedding_state', e.target.value)} />
            </div>
            <div>
              <label className="form-label">District / City</label>
              <input className="form-input" placeholder="e.g. Bengaluru" value={wedding.wedding_district || ''} onChange={(e) => update('wedding_district', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Total Guests — {wedding.total_guests || 0}</label>
              <input type="range" className="range-slider" min="50" max="2000" step="50" value={wedding.total_guests || 0} onChange={(e) => update('total_guests', Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn-primary" style={{ background: '#fff', color: '#e91e63', border: '1.5px solid #F472B6' }} onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" style={{ background: '#e91e63' }} onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Discover Venues →</button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: window.innerWidth < 640 ? 28 : 40, fontWeight: 800, color: '#111' }}>
                Venues in {wedding.wedding_district || 'your city'}
              </h2>
              <p style={{ color: '#777', fontSize: 14 }}>{venues.length} curated options · live pricing</p>
            </div>
            <button className="btn-primary" onClick={() => setStep(2)}>← Refine</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#e91e63', fontWeight: 700 }}>Finding the perfect venues…</div>
          ) : (
            <div className="premium-card-grid">
              {venues.map((v) => (
                <div key={v.id || v.place_id}>
                  <SelectionCard
                    item={{
                      ...v,
                      label: v.name,
                      badge: venueTypeOf(v),
                      capacity: v.pax || (v.capacity ? `${v.capacity} pax` : ''),
                      budget: v.price ? `From ${formatINR(v.price)}` : v.cost_range || '',
                      actionLabel: 'Select Venue',
                    }}
                    selected={wedding.mandapam_id === (v.place_id || v.id)}
                    onClick={(id) => selectVenue(v)}
                    hasAnySelected={!!wedding.mandapam_id && wedding.mandapam_id !== (v.place_id || v.id)}
                    location={v.vicinity || v.area || wedding.wedding_district}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
