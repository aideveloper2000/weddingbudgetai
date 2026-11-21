import { useState } from 'react';
import SelectionCard from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';

// Port of the original Logistics tab (`jS`): guest transfers, bride/groom travel,
// ghodi & dhol, and a distance-based estimate using OSRM when possible.
const TRANSFER_MODES = ['Airport', 'Railway Station', 'Bus Stand', 'City Local'];
const VEHICLES = [
  { id: 'Innova', label: 'Innova / Crysta', perKm: 18, seats: 6 },
  { id: 'Tempo', label: 'Tempo Traveller', perKm: 28, seats: 17 },
  { id: 'Bus', label: 'Luxury Bus', perKm: 45, seats: 40 },
  { id: 'Car', label: 'Sedan', perKm: 14, seats: 3 },
];

export default function LogisticsTab({ wedding, update }) {
  const [route, setRoute] = useState(null);

  const guests = wedding.total_guests || 0;
  const outstation = wedding.outstation_guests || 0;
  const vehicle = VEHICLES.find((v) => v.id === wedding.vehicle_type) || VEHICLES[0];
  const trips = Math.ceil(outstation / (vehicle.seats || 1));
  const distance = wedding.transfer_distance_km || 25;
  const transferCost = trips * distance * (vehicle.perKm || 15) * 2;

  const dholiCost = (wedding.dholi_count || 0) * (wedding.dholi_hours || 2) * 1500;
  const ghodiCost = wedding.ghodi ? 25000 : 0;
  const total = transferCost + dholiCost + ghodiCost + (wedding.bride_travel_cost || 0) + (wedding.groom_travel_cost || 0);

  const checkRoute = async () => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${wedding.wedding_district || 'Bengaluru'};${wedding.wedding_city || 'Bengaluru'}?overview=false`
      );
      if (res.ok) {
        const data = await res.json();
        const d = data.routes?.[0]?.distance || 0;
        setRoute(Math.round(d / 1000));
        update('transfer_distance_km', Math.round(d / 1000));
      }
    } catch {}
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card">
        <SectionTitle>Guest Transfers</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          <div>
            <label className="form-label">Transfer source</label>
            <select className="form-select" value={wedding.transfer_source_type || 'Airport'} onChange={(e) => update('transfer_source_type', e.target.value)}>
              {TRANSFER_MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Vehicle type</label>
            <select className="form-select" value={wedding.vehicle_type || 'Innova'} onChange={(e) => update('vehicle_type', e.target.value)}>
              {VEHICLES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Outstation guests — {outstation}</label>
            <input type="range" className="range-slider" min="0" max={guests || 500} step="10" value={outstation} onChange={(e) => update('outstation_guests', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">One-way distance — {distance} km</label>
            <input type="range" className="range-slider" min="5" max="300" step="5" value={distance} onChange={(e) => update('transfer_distance_km', Number(e.target.value))} />
          </div>
        </div>
        <button className="btn-primary" style={{ marginTop: 14 }} onClick={checkRoute}>Check real route distance</button>
        {route != null && <span style={{ marginLeft: 12, fontSize: 13, color: '#059669', fontWeight: 700 }}>Route ≈ {route} km</span>}
      </section>

      <section className="section-card">
        <SectionTitle>Bride &amp; Groom Travel</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {['bride', 'groom'].map((who) => (
            <div key={who} style={{ padding: 16, borderRadius: 14, border: '1.5px solid #EBEBEB', background: '#fff' }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, fontSize: 12, color: '#D4537E', marginBottom: 10 }}>{who}</div>
              <select
                className="form-select"
                value={wedding[`${who}_travel_mode`] || ''}
                onChange={(e) => update(`${who}_travel_mode`, e.target.value)}
                style={{ marginBottom: 10 }}
              >
                <option value="">Travel mode…</option>
                <option>Car</option><option>Helicopter</option><option>Horse (Ghodi)</option><option>Train</option><option>Flight</option>
              </select>
              <input
                className="form-input"
                placeholder="Distance (km)"
                type="number"
                value={wedding[`${who}_travel_distance_km`] || 0}
                onChange={(e) => update(`${who}_travel_distance_km`, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontWeight: 600, fontSize: 14 }}>
          <input type="checkbox" checked={!!wedding.ghodi} onChange={(e) => update('ghodi', e.target.checked)} /> Include Ghodi (₹25,000)
        </label>
      </section>

      <section className="section-card">
        <SectionTitle>Dhol &amp; Procession</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          <div>
            <label className="form-label">Dhol players — {wedding.dholi_count || 0}</label>
            <input type="range" className="range-slider" min="0" max="10" value={wedding.dholi_count || 0} onChange={(e) => update('dholi_count', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Hours — {wedding.dholi_hours || 2}</label>
            <input type="range" className="range-slider" min="1" max="8" value={wedding.dholi_hours || 2} onChange={(e) => update('dholi_hours', Number(e.target.value))} />
          </div>
        </div>
      </section>

      <section className="section-card">
        <SectionTitle>Logistics Summary</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {[
            ['Transfers', transferCost],
            ['Baraat (Ghodi)', ghodiCost],
            ['Dhol', dholiCost],
            ['Bride travel', wedding.bride_travel_cost || 0],
            ['Groom travel', wedding.groom_travel_cost || 0],
          ].map(([label, val]) => (
            <div key={label} style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{val ? `₹${Math.round(val).toLocaleString('en-IN')}` : '—'}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: 16, borderRadius: 14, background: 'linear-gradient(135deg,#FBE8EF,#fff)', border: '1.5px solid #F2C4D4', fontSize: 15, fontWeight: 800, color: '#B83A64' }}>
          Total logistics: ₹{Math.round(total).toLocaleString('en-IN')}
        </div>
      </section>
    </div>
  );
}
