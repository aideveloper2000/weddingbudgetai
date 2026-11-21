import { WEDDING_TYPES, BUDGET_TIERS, EVENTS } from '../data/index.js';

const API = 'https://wedddingbudget-ai.onrender.com/api';
import { useEffect, useRef, useState } from 'react';
import SelectionCard, { formatINR } from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';

// Faithful port of the original Style tab (`Xj`).
export default function StyleTab({ wedding, update, updateMany }) {
  const [customName, setCustomName] = useState('');
  const [icon, setIcon] = useState('💍');

  const ICONS = ['💍', '🤵', '👰', '🪔', '🎊', '🌸', '🥂', '🎶', '📿', '✨'];

  const saveLead = async () => {
    if (wedding.user_name && wedding.user_name.trim().length >= 2) {
      try {
        await fetch(`${API}/admin/crm/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: wedding.user_name,
            source: 'Wizard Start',
            status: 'New',
            wedding_date: wedding.wedding_date || '',
            budget: 0,
            notes: 'User started the wizard.',
          }),
        });
      } catch {}
    }
  };

  const onDateChange = (e) => {
    const value = e.target.value;
    const day = new Date(value).getDay();
    update('wedding_date', value);
    update('is_weekend', day === 0 || day === 6);
  };

  const pickType = (id) => update('wedding_type', wedding.wedding_type === id ? '' : id);
  const pickTier = (id) => update('budget_tier', wedding.budget_tier === id ? '' : id);

  const toggleEvent = (id) => {
    const found = EVENTS.find((x) => x.id === id);
    if (found && found.isCustom) {
      const custom = wedding.custom_events || [];
      if (!custom.find((v) => v.id === id)) {
        update('custom_events', [...custom, { id, label: found.label, emoji: found.icon }]);
      }
    }
    const events = wedding.events || [];
    update('events', events.includes(id) ? events.filter((y) => y !== id) : [...events, id]);
  };

  const addCustomEvent = () => {
    const value = customName.trim();
    if (!value) return;
    const custom = wedding.custom_events || [];
    if (!custom.find((v) => v.label.toLowerCase() === value.toLowerCase())) {
      const id = 'custom_' + Date.now();
      update('custom_events', [...custom, { id, label: value, emoji: icon }]);
      update('events', [...(wedding.events || []), id]);
      setCustomName('');
      setIcon('💍');
    }
  };

  const removeCustom = (id) => {
    update('custom_events', (wedding.custom_events || []).filter((x) => x.id !== id));
    update('events', (wedding.events || []).filter((x) => x !== id));
  };

  const eventOptions = [
    ...EVENTS,
    ...(wedding.custom_events || [])
      .filter((x) => !EVENTS.find((e) => e.id === x.id))
      .map((x) => ({
        id: x.id,
        icon: x.emoji,
        label: x.label,
        imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
        fallbackColor: '#334155',
        isUserCustom: true,
      })),
  ];

  const today = new Date().toISOString().split('T')[0];
  const events = wedding.events || [];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card" data-section="user-name">
        <SectionTitle>
          Hey! What's your name? <span style={{ color: '#E01A22' }}>*</span>
        </SectionTitle>
        <input
          type="text"
          className="form-input"
          value={wedding.user_name || ''}
          onChange={(e) => update('user_name', e.target.value)}
          placeholder="Enter your name..."
          style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #EBEBEB', borderRadius: 12, fontSize: 16, color: '#111', background: '#fff', outline: 'none', fontWeight: 600, transition: 'border-color 0.2s' }}
          onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
          onBlur={(e) => { e.target.style.borderColor = '#EBEBEB'; saveLead(); }}
        />
      </section>

      <section className="section-card" data-section="wedding-date">
        <SectionTitle>
          Wedding Date <span style={{ color: '#E01A22' }}>*</span>
        </SectionTitle>
        <input
          type="date"
          className="form-input"
          value={wedding.wedding_date || ''}
          min={today}
          onChange={onDateChange}
          style={{ padding: '10px 16px', border: '1.5px solid #EBEBEB', borderRadius: 10, fontSize: 15, color: '#111', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
        />
        {wedding.wedding_date && (
          <div
            style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px',
              borderRadius: 8, background: wedding.is_weekend ? '#FEF3C7' : '#DCFCE7',
              color: wedding.is_weekend ? '#92400E' : '#166534', fontSize: 12, fontWeight: 700,
            }}
          >
            {wedding.is_weekend ? ' Weekend — +15% surcharge applies' : ' Weekday — Regular pricing'}
          </div>
        )}
      </section>

      <section className="section-card" data-section="wedding-type" style={{ background: '#ffffff' }}>
        <SectionTitle>
          Wedding Type <span style={{ color: '#E01A22' }}>*</span>
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {WEDDING_TYPES.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={wedding.wedding_type === item.id}
              onClick={pickType}
              hasAnySelected={!!wedding.wedding_type && wedding.wedding_type !== item.id}
              badge="TYPE"
              actionLabel="Select Type"
            />
          ))}
        </div>
      </section>

      <section className="section-card" data-section="budget-style">
        <SectionTitle>
          Budget Style <span style={{ color: '#E01A22' }}>*</span>
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {BUDGET_TIERS.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={wedding.budget_tier === item.id}
              onClick={pickTier}
              hasAnySelected={!!wedding.budget_tier && wedding.budget_tier !== item.id}
              badge="TIER"
              budget={item.desc}
              actionLabel="Choose Tier"
            />
          ))}
        </div>
      </section>

      <section className="section-card" data-section="events">
        <SectionTitle>
          Events &amp; Ceremonies <span style={{ color: '#E01A22' }}>*</span>
        </SectionTitle>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Select all events you'll celebrate — multi-select</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
          {eventOptions.map((item) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <SelectionCard
                item={item}
                selected={events.includes(item.id)}
                onClick={toggleEvent}
                hasAnySelected={false}
                badge="EVENT"
                actionLabel="Add Event"
              />
              {item.isUserCustom && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeCustom(item.id); }}
                  style={{
                    position: 'absolute', top: -6, left: -6, width: 24, height: 24, borderRadius: '50%',
                    background: '#fee2e2', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {events.length > 0 && (
          <div style={{ padding: '10px 16px', borderRadius: 10, background: '#FBE8EF', border: '1px solid #F2C4D4', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12, fontWeight: 700, color: '#B83A64' }}>
            {events.length} event{events.length !== 1 ? 's' : ''} selected{events.length > 4 ? ` +${events.length - 4} more` : ''}
          </div>
        )}

        <div style={{ padding: '18px 20px', border: '1.5px dashed #EBEBEB', borderRadius: 14, background: '#fff', boxShadow: '0 1px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10 }}>+ Add your own event</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5B5B5B' }}>Choose an icon</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    style={{
                      width: 30, height: 30, border: `1.5px solid ${icon === ic ? '#D4537E' : '#EBEBEB'}`,
                      borderRadius: 7, background: icon === ic ? '#FBE8EF' : 'white', cursor: 'pointer', fontSize: 15,
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-input"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomEvent()}
                placeholder="e.g. Ring Ceremony, Tilak, Griha Pravesh…"
                style={{ flex: 1, minWidth: 180, padding: '10px 14px', border: '1.5px solid #EBEBEB', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', color: '#111' }}
              />
              <button onClick={addCustomEvent} style={{ padding: '10px 20px', borderRadius: 10, background: '#111', color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <div style={{ position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'center', zIndex: 50, marginTop: '4rem', paddingBottom: '20px' }}>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('weddingNextTab'))}
            style={{
              background: '#111', color: '#fff', border: 'none', borderRadius: '10px', padding: '16px 48px',
              fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: window.innerWidth < 640 ? '90%' : 'auto',
            }}
          >
            Next: Venue &amp; Guests
          </button>
        </div>
      )}

      {(wedding.wedding_type || wedding.budget_tier || events.length > 0) && (
        <div style={{ padding: '16px 22px', borderRadius: 14, background: 'linear-gradient(135deg,#FBE8EF,#fff)', border: '1.5px solid #F2C4D4', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {wedding.wedding_type && <span style={{ padding: '5px 12px', borderRadius: 20, background: '#D4537E', color: 'white', fontSize: 12, fontWeight: 700 }}> {wedding.wedding_type}</span>}
          {wedding.budget_tier && <span style={{ padding: '5px 12px', borderRadius: 20, background: '#111', color: 'white', fontSize: 12, fontWeight: 700 }}>{wedding.budget_tier}</span>}
          {events.length > 0 && <span style={{ padding: '5px 12px', borderRadius: 20, background: '#FDE8F0', color: '#B83A64', border: '1px solid #F2C4D4', fontSize: 12, fontWeight: 700 }}> {events.length} events</span>}
          <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>
            {[wedding.wedding_type, wedding.budget_tier, events.length > 0].filter(Boolean).length}/3 sections complete
          </span>
        </div>
      )}
    </div>
  );
}



