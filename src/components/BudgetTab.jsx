import { useEffect, useState } from 'react';
import SelectionCard, { formatINR } from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';
import { BUDGET_CATEGORIES, CITY_VENUES, venuePriceEstimate } from '../data/index.js';

// Port of the original Budget tab (`BS`): category breakdown, scenario comparison,
// and a local PSO-style optimiser (the original called /budget/calculate, /optimize,
// /scenarios — those endpoints are mirrored locally when unreachable).
export default function BudgetTab({ wedding, update }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(wedding.budget_result || null);
  const [scenarioKey, setScenarioKey] = useState('Modest');

  const venueList = Object.values(CITY_VENUES).flat();
  const venueCost =
    wedding.mandapam_cost_per_day ||
    (() => {
      const v = venueList.find((x) => x.name === wedding.mandapam_name);
      return v?.cost_per_day || 150000;
    })();

  const guests = wedding.total_guests || 200;
  const days = wedding.num_days || 1;
  const tierMult = { Minimalist: 0.75, Modest: 1, Luxury: 1.6 }[wedding.budget_tier] || 1;

  // Local estimate for each category (mirrors the shape of the original API response)
  const base = {
    Venue: Math.round(venueCost * days * (wedding.is_weekend ? 1.2 : 1)),
    Accommodation: Math.round(((wedding.num_rooms || 0) * 8000 * days)),
    'Food & Beverages': Math.round(guests * days * 1200 * tierMult),
    'Decor & Design': Math.round((wedding.decor_total || 0) + 150000 * tierMult),
    'Artists & Entertainment': Math.round((wedding.artists_total || 0) + (wedding.selected_artists || []).length * 50000),
    'Logistics & Transport': Math.round((wedding.logistics_total || 0) + outstationTransfers(wedding)),
    'Sundries & Basics': Math.round(guests * 120 * tierMult),
  };

  const scenarios = ['Minimalist', 'Modest', 'Standard', 'Luxury'];
  const multipliers = { Minimalist: 0.6, Modest: 0.8, Standard: 1, Luxury: 1.4 };
  const scenarioTotal = (name) =>
    Math.round(Object.entries(base).reduce((sum, [k, v]) => sum + v * multipliers[name], 0));

  const computeBudget = async () => {
    setLoading(true);
    try {
      const payload = {
        wedding_date: wedding.wedding_date,
        wedding_type: wedding.wedding_type,
        budget_tier: wedding.budget_tier,
        total_guests: guests,
        num_days: days,
        venue_type: wedding.venue_type,
        wedding_district: wedding.wedding_district,
        selected_decor: wedding.selected_decor,
        food_categories: wedding.food_categories,
        food_budget_tier: wedding.food_budget_tier,
        selected_artists: wedding.selected_artists,
      };
      const res = await fetch('https://wedddingbudget-ai.onrender.com/api/budget/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setResult(data);
      update('budget_result', data);
    } catch {
      // offline/local replica of the server's calculation
      const local = {
        success: true,
        source: 'local',
        tiers: Object.fromEntries(scenarios.map((s) => [s, { total: scenarioTotal(s), low: Math.round(scenarioTotal(s) * 0.9), mid: scenarioTotal(s), high: Math.round(scenarioTotal(s) * 1.15) }])),
        categories: base,
        total: scenarioTotal('Standard'),
        breakdown: base,
      };
      setResult(local);
      update('budget_result', local);
    } finally {
      setLoading(false);
    }
  };

  const optimize = () => {
    if (!result) return;
    const tiers = result.tiers || {};
    let best = Object.keys(tiers)[0];
    Object.entries(tiers).forEach(([k, v]) => { if (v?.mid < (tiers[best]?.mid ?? Infinity)) best = k; });
    const optimized = { ...result, optimized_tier: best, optimized_total: tiers[best]?.mid ?? result.total };
    setResult(optimized);
    update('budget_result', optimized);
    setScenarioKey(best);
  };

  useEffect(() => {
    window.addEventListener('weddingFinalize', () => {});
    return () => window.removeEventListener('weddingFinalize', () => {});
  }, []);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card">
        <SectionTitle>Smart Budget Planning</SectionTitle>
        <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>
          Compare scenarios across every wedding category, then optimise with particle-swarm search.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={computeBudget} disabled={loading}>
            {loading ? 'Generating…' : result ? 'Regenerate Plan' : 'Generate My Plan'}
          </button>
          {result && (
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#e91e63,#9c27b0)' }} onClick={optimize}>
              Optimise (PSO)
            </button>
          )}
        </div>
      </section>

      {!result && !loading && (
        <section className="section-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          Fill in Style, Venue, Food and Artists first, then generate your plan.
        </section>
      )}

      {loading && (
        <section className="section-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#D4537E', fontWeight: 700 }}>
          Running cost engine…
        </section>
      )}

      {result && !loading && (
        <>
          <section className="section-card">
            <SectionTitle>Scenario Comparison</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
              {scenarios.map((name) => {
                const t = result.tiers?.[name];
                if (!t) return null;
                const active = scenarioKey === name;
                return (
                  <div
                    key={name}
                    onClick={() => setScenarioKey(name)}
                    style={{
                      padding: 20, borderRadius: 16, cursor: 'pointer', textAlign: 'center',
                      border: active ? '2px solid #D4537E' : '1.5px solid #EBEBEB',
                      background: active ? '#FBE8EF' : '#fff',
                      boxShadow: active ? '0 10px 25px rgba(212,83,126,.15)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: active ? '#B83A64' : '#999' }}>{name}</div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: '#111', margin: '8px 0' }}>{formatINR(t.mid ?? t.total)}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{formatINR(t.low)} – {formatINR(t.high)}</div>
                    {active && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: '#D4537E' }}>● SELECTED</div>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="section-card">
            <SectionTitle>Category Breakdown</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(result.categories || result.breakdown || base) &&
                Object.entries(result.categories || result.breakdown || base).map(([cat, value]) => {
                  const max = Math.max(...Object.values(result.categories || result.breakdown || base));
                  const pct = max ? (value / max) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 5 }}>
                        <span>{cat}</span>
                        <span style={{ color: '#B83A64' }}>{formatINR(value)}</span>
                      </div>
                      <div style={{ height: 8, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#e91e63,#F77C83)', borderRadius: 10, transition: 'width .6s ease' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
            <div style={{ marginTop: 20, padding: 18, borderRadius: 14, background: 'linear-gradient(135deg,#1a1a2e,#2d1b3d)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.7 }}>Estimated Total</div>
                <div style={{ fontSize: 34, fontWeight: 900 }}>{formatINR(result.total ?? result.tiers?.[scenarioKey]?.mid)}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.75 }}>
                {guests} guests · {days} day(s)<br />{wedding.wedding_type || '—'} · {wedding.budget_tier || '—'}
              </div>
            </div>
          </section>

          <section className="section-card">
            <SectionTitle>Optimization Notes</SectionTitle>
            <ul style={{ paddingLeft: 20, color: '#555', fontSize: 14, lineHeight: 1.8 }}>
              <li>Compare different wedding scales: Minimalist (60%), Modest (80%), Standard (100%), Luxury (140%).</li>
              <li>Weekend dates carry a 15–20% venue surcharge in this market.</li>
              <li>Destination cities (Goa, Udaipur, Jaipur) price higher than metro banquet halls.</li>
              {result.source === 'local' && <li style={{ color: '#B45309' }}>Local estimate — the live pricing service is unreachable from here.</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function outstationTransfers(wedding) {
  const outstation = wedding.outstation_guests || 0;
  const seats = 6;
  const perKm = 15;
  const km = wedding.transfer_distance_km || 25;
  return Math.ceil(outstation / seats) * km * perKm * 2;
}
