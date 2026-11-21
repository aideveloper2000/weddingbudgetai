import { useEffect, useState } from 'react';

export function Reveal({ children, delay = 0, sectionId, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      data-section={sectionId}
      className="section-reveal"
      style={{
        background: 'white',
        borderRadius: 18,
        border: '1.5px solid #EBEBEB',
        padding: '20px',
        marginBottom: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        ...style,
        opacity: visible ? undefined : 0,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 16, fontFamily: "'DM Sans','Inter',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
      {children}
    </div>
  );
}
