import { useRef, useState } from 'react';

// Faithful port of the original `hn` selection card component.
export default function SelectionCard({
  item,
  selected,
  onClick,
  showCost = false,
  hasAnySelected = false,
  badge = '',
  location = '',
  capacity = '',
  capacityLabel = 'Capacity',
  budget = '',
  actionLabel = 'View Price & Details',
}) {
  const [imgError, setImgError] = useState(false);
  const fallbackColor = item.fallbackColor || '#f8f9fa';
  const label = item.label || item.name || item.business || '';
  const loc = location || item.area || item.city || '';
  const tag = badge || item.category || (item.id && !item.label ? 'OPTION' : '');
  const cap = capacity || (item.capacity ? `${item.capacity} pax` : '');
  const cost =
    budget ||
    item.cost ||
    item.price_range ||
    (item.cost_per_day ? `From ${formatINR(item.cost_per_day)}` : '');
  const imageUrl = item.imageUrl || item.image_url || '';

  return (
    <div
      className={`premium-image-card ${selected ? 'selected' : ''} ${hasAnySelected && !selected ? 'dimmed' : ''}`}
      onClick={() => onClick(item.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        border: selected ? '2px solid #F77C83' : '1px solid #F3F4F6',
        boxShadow: selected ? '0 12px 30px rgba(247,124,131,0.15)' : '0 10px 30px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        height: '100%',
        padding: '12px',
      }}
    >
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: fallbackColor, borderRadius: '16px', marginBottom: '16px' }}>
        {!imageUrl || imgError ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: 'linear-gradient(135deg,#fdf2f8,#fbcfe8)' }}>
            {item.emoji || '✨'}
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={label}
            onError={() => setImgError(true)}
            className="card-main-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
          />
        )}
        {selected && (
          <div
            style={{
              position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px',
              borderRadius: '50%', background: '#F77C83', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 800,
              boxShadow: '0 4px 15px rgba(247,124,131,0.4)', zIndex: 3,
              animation: 'checkSpring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}
          >
            ✓
          </div>
        )}
      </div>

      <div style={{ padding: '0 4px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
          <h3
            style={{
              fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0, lineHeight: 1.2,
              fontFamily: 'Plus Jakarta Sans, sans-serif', minHeight: '66px',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}
          >
            {label}
          </h3>
          {tag && (
            <span style={{ fontSize: '10px', fontWeight: 800, background: '#0F172A', color: '#fff', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>
              {tag}
            </span>
          )}
        </div>

        <div className="card-location-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{loc || 'India'}</span>
        </div>

        {(cap || cost) && (
          <div className="card-info-boxes" style={{ display: 'flex', gap: '10px', marginBottom: '20px', minHeight: '64px' }}>
            {cap && (
              <div style={{ flex: 1, background: '#F8FAFC', padding: '10px 12px', borderRadius: '14px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{capacityLabel}</div>
                <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700, lineHeight: 1.2 }}>{cap}</div>
              </div>
            )}
            {cost && (
              <div style={{ flex: 1, background: '#F8FAFC', padding: '10px 12px', borderRadius: '14px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {showCost ? 'Cost' : 'Budget'}
                </div>
                <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700, lineHeight: 1.2 }}>{cost}</div>
              </div>
            )}
          </div>
        )}

        <button
          style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: '#F77C83', opacity: selected ? 0.9 : 1, color: '#fff',
            fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', cursor: 'pointer',
            transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(247,124,131,0.25)', marginTop: 'auto',
          }}
        >
          {selected ? 'Selected' : actionLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function formatINR(value) {
  if (value == null || isNaN(value) || value === 0) return '₹0';
  const n = Math.abs(parseFloat(value));
  let out;
  if (n >= 1e7) out = `₹${(n / 1e7).toFixed(2)} Cr`;
  else if (n >= 1e5) out = `₹${(n / 1e5).toFixed(2)} L`;
  else if (n >= 1e3) out = `₹${(n / 1e3).toFixed(1)} K`;
  else out = `₹${Math.round(n)}`;
  return parseFloat(value) < 0 ? '-' + out : out;
}
