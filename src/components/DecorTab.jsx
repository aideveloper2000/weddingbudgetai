import { useEffect, useState } from 'react';
import SelectionCard from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';
import { DECOR_ITEMS } from '../data/index.js';

// Faithful port of the original Decor AI tab (`pS`): upload + rule-based estimate,
// then a selectable decor library with predicted costs.
const BASE_COST = {
  Mandap: 250000,
  Entrance: 65000,
  'Table Decor': 45000,
  Ceiling: 120000,
  Backdrop: 85000,
  Stage: 350000,
  Lighting: 45000,
  'Photo Booth': 70000,
  Aisle: 35000,
  Pillars: 400000,
};
const COMPLEXITY = { Low: 0.65, Medium: 1, High: 1.75 };
const STYLE_MULT = { Luxury: 1.6, Whimsical: 1.25, Romantic: 1.15, Modern: 1.1, Rustic: 1.05 };

export default function DecorTab({ wedding, update, updateMany }) {
  const [meta, setMeta] = useState({ function_type: '', style: '', complexity: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const runEstimate = async () => {
    if (!meta.function_type || !meta.style || !meta.complexity) {
      setMessage('Please select Type, Style and Complexity first.');
      return;
    }
    setMessage('');
    setBusy(true);
    setResult(null);
    try {
      if (file) {
        const form = new FormData();
        form.append('file', file);
        form.append('function_type', meta.function_type);
        form.append('style', meta.style);
        form.append('complexity', { Low: 1, Medium: 3, High: 5 }[meta.complexity] ?? 3);
        const res = await fetch('https://wedddingbudget-ai.onrender.com/api/decor/predict-upload', { method: 'POST', body: form });
        if (res.ok) {
          const data = await res.json();
          if (data && data.method !== 'rejected' && data.predicted_mid != null) {
            const mid = data.predicted_mid ?? data.predicted_cost;
            setResult({
              predicted_cost: mid,
              range: [data.predicted_low || Math.round(mid * 0.8), data.predicted_high || Math.round(mid * 1.25)],
              confidence: data.confidence,
              source: data.method === 'ml' ? 'Gradient Boosting AI' : 'Rule-based',
              message: data.message,
              detected_category: data.detected_category,
            });
            setBusy(false);
            return;
          }
          if (data.method === 'rejected') {
            setMessage(' Please upload a decor/venue image');
            setBusy(false);
            return;
          }
        }
      }
      // rule-based fallback (mirrors the original)
      const base = BASE_COST[meta.function_type] || 85000;
      const mult = COMPLEXITY[meta.complexity] || 1;
      const styleMult = STYLE_MULT[meta.style] || 1;
      const total = Math.round(base * mult * styleMult);
      setResult({
        predicted_cost: total,
        range: [Math.round(total * 0.8), Math.round(total * 1.25)],
        confidence: 'medium',
        source: 'Rule-based',
        message: `Estimated ${meta.function_type} cost for a ${meta.style.toLowerCase()} setup.`,
        detected_category: meta.function_type,
      });
    } catch {
      setMessage('Could not reach the estimator. Using local rules.');
      const base = BASE_COST[meta.function_type] || 85000;
      const total = Math.round(base * (COMPLEXITY[meta.complexity] || 1));
      setResult({ predicted_cost: total, range: [Math.round(total * 0.8), Math.round(total * 1.25)], confidence: 'low', source: 'Rule-based', message: 'Offline estimate.', detected_category: meta.function_type });
    } finally {
      setBusy(false);
    }
  };

  const toggleDecor = (id) => {
    const selected = wedding.selected_decor || [];
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    update('selected_decor', next);
    updateMany({ selected_decor: next });
  };

  const groups = {};
  for (const item of DECOR_ITEMS) {
    (groups[item.function_type] ||= []).push(item);
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card">
        <SectionTitle>AI Decor Suggester</SectionTitle>
        <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>Upload a reference photo or describe the setup — the model predicts a realistic cost band.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 16 }}>
          <select className="form-select" value={meta.function_type} onChange={(e) => setMeta({ ...meta, function_type: e.target.value })}>
            <option value="">Function type…</option>
            {Object.keys(BASE_COST).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <select className="form-select" value={meta.style} onChange={(e) => setMeta({ ...meta, style: e.target.value })}>
            <option value="">Style…</option>
            {Object.keys(STYLE_MULT).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <select className="form-select" value={meta.complexity} onChange={(e) => setMeta({ ...meta, complexity: e.target.value })}>
            <option value="">Complexity…</option>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />
          <button className="btn-primary" onClick={runEstimate} disabled={busy}>
            {busy ? 'Analysing…' : 'Get AI Estimate'}
          </button>
        </div>

        {message && <div className="validation-banner" style={{ marginTop: 16, color: '#C53030', fontWeight: 600 }}>{message}</div>}

        {result && (
          <div style={{ marginTop: 20, padding: 20, borderRadius: 16, background: 'linear-gradient(165deg,#111,#1a1a1a)', color: '#fff' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(247,124,131,.1)', borderRadius: 50, border: '1px solid rgba(247,124,131,.3)', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#f77c83', letterSpacing: 2 }}>PREDICTED COST</span>
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'Inter,sans-serif' }}>
              ₹{(result.predicted_cost / 100000).toFixed(1)}L
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>Range ₹{(result.range[0] / 100000).toFixed(1)}L – ₹{(result.range[1] / 100000).toFixed(1)}L · {result.source}</div>
            <p style={{ marginTop: 12, fontSize: 13, color: '#ccc' }}>{result.message}</p>
          </div>
        )}
      </section>

      {Object.entries(groups).map(([type, items]) => (
        <section className="section-card" key={type}>
          <SectionTitle>{type}</SectionTitle>
          <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
            {items.map((item) => (
              <SelectionCard
                key={item.id}
                item={{
                  ...item,
                  label: item.name,
                  badge: item.function_type,
                  budget: `₹${(item.base_cost / 100000).toFixed(1)}L base`,
                  actionLabel: (wedding.selected_decor || []).includes(item.id) ? 'Selected' : 'Add to Plan',
                }}
                selected={(wedding.selected_decor || []).includes(item.id)}
                onClick={toggleDecor}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
