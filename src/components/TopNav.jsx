import { useEffect, useRef, useState } from 'react';
import { TABS, SITE } from '../data/index.js';

// Port of the original sticky top tab bar (`c5`).
export default function TopNav({ activeTab, allTabs, goTo, isMobile, wedding }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const visible = allTabs.filter((t) => !t.adminOnly);

  return (
    <nav
      className="top-nav"
      style={{
        position: 'sticky', bottom: 'auto', top: 0, zIndex: 200, background: '#ffffff',
        borderBottom: isMobile ? 'none' : '1px solid #EBEBEB', borderTop: isMobile ? '1px solid #EBEBEB' : 'none',
        height: isMobile ? 60 : 56, padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16,
        boxShadow: isMobile ? '0 -2px 10px rgba(0,0,0,0.05)' : scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.2s', fontFamily: "'DM Sans','Inter',sans-serif", width: '100%', overflow: 'hidden',
      }}
    >
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (wedding.finalised) window.location.href = '/';
          else window.dispatchEvent(new CustomEvent('triggerRetention'));
        }}
        className="logo-wrapper"
        style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, textDecoration: 'none', cursor: 'pointer' }}
      >
        <span style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center' }}>
          <svg width={isMobile ? 22 : 26} height={isMobile ? 22 : 26} viewBox="0 0 24 24" fill="none" stroke="#D4537E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
        <span className="logo-text" style={{ fontWeight: 800, fontSize: isMobile ? 12 : 15, color: '#111', letterSpacing: '-0.3px', display: isMobile ? 'none' : 'block' }}>
          {SITE.logoText}<span style={{ color: '#D4537E' }}>{SITE.logoAI}</span>
        </span>
      </a>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0, margin: 0 }}>
        <div className="nav-tab-strip" style={{ display: 'flex', gap: isMobile ? 12 : 2, padding: 3, background: isMobile ? 'transparent' : '#ffffff', borderRadius: 10, overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: 'auto', maxWidth: '100%', flexWrap: 'nowrap' }}>
          <style>{`.nav-tab-strip::-webkit-scrollbar{display:none}`}</style>
          {visible.map((t) => {
            const active = activeTab === t.id;
            const color = active ? '#D4537E' : '#888';
            return (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                className="nav-tab-btn"
                style={{
                  position: 'relative', padding: isMobile ? '6px 10px' : '5px 11px', borderRadius: 7, border: 'none',
                  cursor: 'pointer', fontSize: isMobile ? 18 : 12, fontWeight: active ? 700 : 500,
                  color: active ? '#111' : '#888', background: 'transparent', whiteSpace: 'nowrap', flexShrink: 0,
                  zIndex: 1, minHeight: isMobile ? 44 : 32, transition: 'color 0.2s',
                  fontFamily: "'DM Sans','Inter',sans-serif",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#333'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#888'; }}
              >
                {active && (
                  <span style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 7, boxShadow: '0 1px 4px rgba(0,0,0,0.10)', zIndex: -1 }} />
                )}
                {isMobile ? (
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: active ? '2px' : '0' }}>
                    {tabIcon(t.id, color, isMobile ? 24 : 18)}
                  </span>
                ) : (
                  <span className="nav-tab-label" style={{ position: 'relative', zIndex: 1 }}>{t.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="nav-right-chips" style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
        {!isMobile && wedding.wedding_type && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#FBE8EF', color: '#D4537E', border: '1px solid #F2C4D4', whiteSpace: 'nowrap' }}>
            {wedding.wedding_type}
          </span>
        )}
        {!isMobile && wedding.total_guests > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0', whiteSpace: 'nowrap' }}>
            {wedding.total_guests} guests
          </span>
        )}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openGuide'))}
          style={{
            background: isMobile ? 'transparent' : 'rgba(233,30,140,0.1)', color: '#e91e8c',
            border: isMobile ? 'none' : '1px solid rgba(233,30,140,0.2)', padding: isMobile ? '4px' : '4px 12px',
            borderRadius: 50, fontSize: isMobile ? 20 : 11, fontWeight: 700, cursor: 'pointer', marginLeft: 4,
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isMobile ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          ) : 'Guide'}
        </button>
      </div>
    </nav>
  );
}

function tabIcon(id, color, size) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 0: return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>;
    case 1: return <svg {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case 2: return <svg {...props}><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
    case 3: return <svg {...props}><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></svg>;
    case 4: return <svg {...props}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
    default: return <span style={{ fontSize: size * 0.7 }}>•</span>;
  }
}
