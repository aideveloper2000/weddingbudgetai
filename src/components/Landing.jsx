import { useEffect, useRef, useState } from 'react';
import {
  FEATURES, DESTINATIONS, VENUE_STYLES, TESTIMONIALS, SITE, M, Pe, yt,
} from '../data/index.js';

const HEART_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4081" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.41 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.59 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke="#ff4081" strokeWidth="1" />
  </svg>
);

function Header({ onStart, onVendor, scrolled }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = (label, tab) => (
    <a
      href="#"
      key={label}
      className="nav-link"
      onClick={(e) => { e.preventDefault(); onStart(tab); }}
      style={M.navLink}
    >
      {label}
    </a>
  );
  return (
    <header
      id="header"
      style={{ ...M.header, ...(scrolled ? M.headerScrolled : {}) }}
    >
      <div className="header-inner" style={M.headerInner}>
        <a
          href="/"
          style={{ ...M.logo, textDecoration: 'none', cursor: 'pointer' }}
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <span style={{ display: window.innerWidth < 960 ? 'none' : 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <span className="nav-logo-text" style={{ ...M.logoText, fontWeight: 800 }}>
            {SITE.logoText}<span style={M.logoAI}>{SITE.logoAI}</span>
          </span>
        </a>
        <nav className="nav" id="main-nav" style={M.nav}>
          {nav('Style', 0)}
          {nav(' Decor AI', 2)}
          {nav(' Food', 3)}
          {nav(' Artists', 4)}
          {nav(' Budget', 7)}
          {nav(' Wishlist', 10)}
        </nav>
        <div style={M.headerActions}>
          <button
            className="btn-ghost landing-btn-secondary"
            style={M.btnGhost}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Guide
          </button>
          <button
            className="btn-ghost landing-btn-secondary"
            style={{ ...M.btnGhost, color: '#e91e8c', fontWeight: 600, fontSize: '0.75rem', padding: '6px 12px' }}
            onClick={onStart}
          >
            Admin
          </button>
          <button
            className="btn-ghost landing-btn-secondary"
            style={{ ...M.btnGhost, color: '#e91e8c', border: '1px solid #fce4ec', background: '#fdf2f8' }}
            onClick={onVendor}
          >
            Be a Vendor
          </button>
          <button className="btn-primary landing-btn-primary" style={M.btnPrimary} onClick={() => onStart(0)}>
            Start Planning
          </button>
          <button
            className="landing-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            style={{ ...M.hamburger, display: mobileOpen || window.innerWidth <= 960 ? 'flex' : 'none' }}
            aria-label="Menu"
          >
            <span style={{ ...M.hamburgerSpan, transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ ...M.hamburgerSpan, opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ ...M.hamburgerSpan, transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Style', 'Decor AI', 'Food', 'Artists', 'Budget', 'Wishlist'].map((label, i) => (
            <button key={label} onClick={() => { setMobileOpen(false); onStart([0, 2, 3, 4, 7, 10][i]); }} style={{ ...M.navLink, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    class P {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233, 30, 140, ${this.opacity})`;
        ctx.fill();
      }
    }
    const pts = Array.from({ length: 80 }, () => new P());
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={M.canvas} id="particle-canvas" />;
}

const COUNTERS = [
  { target: 50000, suffix: '+', label: 'Weddings Planned' },
  { target: 98, suffix: '%', label: 'Satisfaction Rate' },
  { target: 500, suffix: 'Cr+', label: 'Budget Managed (₹)', isCrore: true },
  { target: 6, suffix: '+', label: 'Wedding Cultures' },
];

function Stats() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        COUNTERS.forEach((c, i) => {
          let k = 0;
          const step = c.target / 60;
          const t = setInterval(() => {
            k += step;
            if (k >= c.target) { k = c.target; clearInterval(t); }
            setCounts((prev) => { const next = [...prev]; next[i] = Math.floor(k); return next; });
          }, 30);
        });
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);
  return (
    <section className="stats" ref={ref} style={M.stats}>
      <div style={M.statsInner}>
        {COUNTERS.map((c, i) => (
          <div key={c.label} style={M.statItem}>
            <div style={{ display: 'inline-block' }}>
              <span style={M.statNumber}>{counts[i].toLocaleString()}</span>
              <span style={M.statUnit}>{c.suffix}</span>
            </div>
            <div style={M.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const dots = [
    { top: '45%', left: '-8%' }, { top: '30%', left: '-5%' }, { top: '15%', left: '2%' },
    { top: '4%', left: '15%' }, { top: '-2%', left: '35%' }, { top: '-4%', left: '50%' },
    { top: '-2%', left: '65%' }, { top: '4%', left: '85%' }, { top: '15%', left: '98%' },
    { top: '30%', left: '105%' }, { top: '45%', left: '108%' },
  ];
  const colors = ['#ff4081', '#ffc107', '#e91e63', '#ffeb3b', '#f06292'];
  return (
    <section style={yt.section}>
      <h2 style={yt.title}>Customers love what our planners do</h2>
      <div style={yt.grid}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={yt.card}>
            <div style={yt.archWrapper}>
              {dots.map((d, j) => <div key={j} style={{ ...yt.dot, ...d, backgroundColor: colors[j % colors.length] }} />)}
              <div style={yt.archFrame}><img src={t.image} alt={t.names} style={yt.image} /></div>
              <div style={yt.badge}>Total Saving <span style={{ fontWeight: 700, marginLeft: 8 }}>{t.saving}</span></div>
            </div>
            <div style={yt.content}>
              <p style={yt.quote}>{t.quote}</p>
              <div style={yt.heartIcon}>{HEART_ICON}</div>
              <h3 style={yt.names}>{t.names}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ onVendor, onStart }) {
  return (
    <footer style={Pe.footer}>
      <div style={Pe.footerTop}>
        <h2 style={Pe.footerHeading}>Let's plan something beautiful together</h2>
        <p style={Pe.footerDesc}>{SITE.description}</p>
        <div style={Pe.footerGrid}>
          <div>
            <h4 style={Pe.footerColH4}>Company</h4>
            {(SITE.links?.company || []).map((l) => (
              <a key={l.label} href="#" style={Pe.footerColA} onClick={(e) => { e.preventDefault(); l.action === 'vendorRegister' && onVendor(); }}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <h4 style={Pe.footerColH4}>Explore</h4>
            {(SITE.links?.explore || []).map((l) => (
              <a key={l.label} href="#" style={Pe.footerColA} onClick={(e) => e.preventDefault()}>{l.label}</a>
            ))}
          </div>
          <div>
            <h4 style={Pe.footerColH4}>Contact Us</h4>
            <div style={Pe.contactItem}><span style={Pe.contactIcon}>📞</span><span>{SITE.contact.phone.label}<br/>{SITE.contact.phone.number}</span></div>
            <div style={Pe.contactItem}><span style={Pe.contactIcon}>✉️</span><span>{SITE.contact.email.label}<br/>{SITE.contact.email.address}</span></div>
            <div style={Pe.contactItem}><span style={Pe.contactIcon}>📍</span><span>{SITE.contact.address.label}<br/>{SITE.contact.address.line1}<br/>{SITE.contact.address.line2}</span></div>
          </div>
          <div>
            <h4 style={Pe.footerColH4}>Follow Us On</h4>
            <div style={Pe.socialLinks}>
              {(SITE.socials || []).map((s) => (
                <a key={s.name} href={s.url} style={Pe.socialItem}>
                  <span style={{ ...Pe.socialCircle, background: s.color }}>{s.name[0]}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={Pe.footerBottom}>
        <p style={Pe.disclaimer}>{SITE.disclaimer}</p>
        <p>© {new Date().getFullYear()} WeddingBudget.AI. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function Landing({ onStart, onVendor, onVenueExplore }) {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState('venue');
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [activeHotspot, setActiveHotspot] = useState(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const venueData = {
    venue: {
      title: 'Royal Ballroom',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2000&q=90',
      description: 'Experience the grand architecture of Amita Rasa. High ceilings, panoramic windows, and natural light that breathes life into your celebration.',
      hotspots: [
        { id: 1, x: '30%', y: '40%', label: 'Panoramic Views', detail: 'Floor-to-ceiling glass walls offering a 270° view of the Nandi Hills.' },
        { id: 2, x: '70%', y: '60%', label: 'Italian Marble', detail: 'Premium hand-polished marble flooring for a regal walk down the aisle.' },
      ],
    },
    decor: {
      title: 'Crystal Bloom',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2000&q=90',
      description: "Our signature 'Crystal Bloom' setup. Hand-picked flowers, artisanal lighting, and a custom-designed stage that transforms the space.",
      hotspots: [
        { id: 3, x: '40%', y: '25%', label: 'Silk Cascades', detail: 'Imported Thai silk drapes with embedded micro-LEDs.' },
        { id: 4, x: '60%', y: '75%', label: 'Floral Centerpieces', detail: 'Zero-waste fresh floral arrangements curated by international artists.' },
      ],
    },
  };
  const view = venueData[mode];

  const onMouseMove = (e) => {
    if (!viewerRef.current) return;
    const r = viewerRef.current.getBoundingClientRect();
    setCursor({ x: ((e.clientX - r.left) / r.width - 0.5) * 20, y: ((e.clientY - r.top) / r.height - 0.5) * 20 });
  };

  return (
    <div style={M.page}>
      <ParticleCanvas />
      <style>{`
        @keyframes sparkle { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .cta-emoji-anim { animation: sparkle 2s ease-in-out infinite; }
        @media (max-width: 960px) {
          #main-nav { display: ${mobileNavOpenGlobal ? 'flex' : 'none'} !important; position: fixed; top: 64px; left: 0; right: 0; background: white; flex-direction: column; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border-bottom: 1px solid #eee; z-index: 99; }
          .landing-btn-secondary { display: none !important; }
        }
        @media (max-width: 900px) {
          .vendor-section { grid-template-columns: 1fr !important; text-align: center !important; gap: 40px !important; padding: 60px 24px !important; }
          .vendor-section > div { text-align: center !important; margin: 0 auto !important; }
          .vendor-images { height: 350px !important; }
        }
      `}</style>
      <Header onStart={onStart} onVendor={onVendor} scrolled={scrolled} />

      <section className="hero" style={M.hero}>
        <div style={M.heroBadge}>NEXT-GEN WEDDING PLANNING</div>
        <h1 style={M.heroTitle}>
          Plan your wedding.<br />
          <span style={M.heroHighlight}>Brilliantly.</span>
        </h1>
        <p style={M.heroSubtitle}>
          The world's most intuitive AI budget tool for Indian weddings.<br />
          Hindu, Muslim, Christian — we've got you covered.
        </p>
        <div style={M.heroActions}>
          <button style={{ ...M.btnPrimary, ...M.btnLarge }} onClick={() => onStart(0)}>Start Planning — It's Free →</button>
          <button style={{ ...M.btnOutline, ...M.btnLarge }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>See how it works</button>
        </div>
      </section>

      <section className="features" id="features" style={M.features}>
        <div style={M.featuresLabel}>HOW IT WORKS</div>
        <h2 style={M.featuresTitle}>
          Everything you need to plan the <em style={M.featuresTitleEm}>perfect</em> wedding
        </h2>
        <div style={M.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={M.featureCard}>
              <div style={M.featureImageWrap}><img src={f.image} alt={f.title} style={M.featureImage} loading="lazy" /></div>
              <div style={M.featureTitle}>{f.title}</div>
              <div style={M.featureDesc}>{f.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="destinations" style={M.destinationsSection}>
        <div style={M.featuresLabel}>TOP DESTINATIONS</div>
        <h2 style={M.featuresTitle}>Explore Venues by <em style={M.featuresTitleEm}>Location</em></h2>
        <div style={M.destinationsGrid}>
          {DESTINATIONS.map((d) => (
            <div key={d.name} style={M.destinationCard} onClick={() => onVenueExplore?.(d.name)}>
              <img src={d.img} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={M.destinationOverlay}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={M.destinationVibe}>{d.vibe}</div>
                </div>
                <div style={M.destinationName}>{d.name}</div>
                <div style={{ ...M.destinationVibe, opacity: 0.6 }}>{d.state}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="venue-types" style={M.destinationsSection}>
        <div style={M.featuresLabel}>VENUE STYLES</div>
        <h2 style={M.featuresTitle}>Find Your <em style={M.featuresTitleEm}>Vibe</em></h2>
        <div style={M.venueTypesGrid}>
          {VENUE_STYLES.map((v) => (
            <div key={v.id} style={M.venueTypeCard} onClick={() => onVenueExplore?.()}>
              <img src={v.img} alt={v.label} style={M.venueTypeImage} />
              <div style={M.venueTypeContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={M.venueTypeTitle}>{v.label}</div>
                </div>
                <div style={M.venueTypeDesc}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <button
            style={{ ...M.btnOutline, color: '#e91e8c', borderColor: '#e91e8c', padding: '16px 40px', fontSize: '1.1rem', fontWeight: 700 }}
            onClick={() => onVenueExplore?.()}
          >
            Explore all venues — Redirect to venue page
          </button>
        </div>
      </section>

      <Stats />

      <section className="vendor-section" style={M.vendorSection}>
        <div style={M.vendorContent}>
          <h2 style={M.vendorTitle}>Are you a vendor?</h2>
          <p style={M.vendorDesc}>Want to list your venue or wedding services here? Join us today!</p>
          <button
            style={{ ...M.btnOutline, color: '#e91e8c', borderColor: '#e91e8c', fontSize: '1.1rem', padding: '16px 36px', display: 'inline-flex', alignItems: 'center', gap: 12, fontWeight: 700, background: 'rgba(233, 30, 140, 0.02)' }}
            onClick={onVendor}
          >
            Join us <span>›</span>
          </button>
        </div>
        <div style={M.vendorImages}>
          <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80" alt="Venue" style={M.vImg1} />
          <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80" alt="Wedding Decor" style={M.vImg3} />
          <img src="https://images.unsplash.com/photo-1595152430642-49168b3fec3d?auto=format&fit=crop&w=800&q=80" alt="Bride" style={M.vImg2} />
        </div>
      </section>

      <section style={{ padding: '120px 24px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 40, display: 'flex', gap: 10, alignItems: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Venue Discovery</span><span style={{ opacity: 0.3 }}>/</span><span>Bengaluru</span><span style={{ opacity: 0.3 }}>/</span><span style={{ color: '#e91e63' }}>Amita Rasa</span>
          </div>
          <div style={{ display: 'flex', flexDirection: window.innerWidth < 960 ? 'column' : 'row', alignItems: window.innerWidth < 960 ? 'flex-start' : 'flex-end', justifyContent: 'space-between', marginBottom: 60, gap: 30 }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: window.innerWidth < 960 ? '2.2rem' : '3.5rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>Amita Rasa</h2>
              <div style={{ display: 'flex', gap: 8, color: '#f59e0b', marginTop: 12, alignItems: 'center' }}>
                {'★★★★★'.split('').map((s, i) => <span key={i} style={{ fontSize: '1.2rem' }}>{s}</span>)}
                <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: 12, fontWeight: 600 }}>TWC Elite Partner · 450+ Reviews</span>
              </div>
            </div>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 6, borderRadius: 16, gap: 4 }}>
              {['venue', 'decor'].map((m) => (
                <button key={m} onClick={() => setMode(m)} style={{ padding: '10px 24px', borderRadius: 12, border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#e91e63' : '#64748b' }}>
                  {m === 'venue' ? 'The Venue' : 'The Decor'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 960 ? '1fr' : 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: window.innerWidth < 960 ? 40 : 80, alignItems: 'center' }}>
            <div ref={viewerRef} style={{ position: 'relative', borderRadius: window.innerWidth < 960 ? 24 : 32, height: window.innerWidth < 960 ? 350 : 600, overflow: 'hidden', cursor: window.innerWidth < 960 ? 'default' : 'none', boxShadow: '0 40px 80px -20px rgba(15, 23, 42, 0.2)', background: '#000' }} onMouseMove={onMouseMove} onMouseLeave={() => { setCursor({ x: 0, y: 0 }); setActiveHotspot(null); }}>
              <img src={view.image} alt={view.title} style={{ width: '110%', height: '110%', position: 'absolute', top: '-5%', left: '-5%', objectFit: 'cover', filter: 'brightness(0.9)', pointerEvents: 'none', transform: `translate(${cursor.x}px, ${cursor.y}px)` }} />
              {view.hotspots.map((h) => (
                <button key={h.id} title={h.label} onClick={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)} style={{ position: 'absolute', left: h.x, top: h.y, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 15px #fff' }} />
                </button>
              ))}
              {activeHotspot && (
                <div style={{ position: 'absolute', left: '50%', bottom: 30, transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.95)', color: '#111', padding: '12px 20px', borderRadius: 16, maxWidth: '80%', zIndex: 30, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{view.hotspots.find((h) => h.id === activeHotspot)?.label}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{view.hotspots.find((h) => h.id === activeHotspot)?.detail}</div>
                </div>
              )}
              {!window.innerWidth < 960 && (
                <div style={{ position: 'fixed', width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.8)', pointerEvents: 'none', zIndex: 100, display: 'none' }}>Explore</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16, color: '#F77C83', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 40, height: 1, background: '#F77C83' }} />
                  Currently Viewing
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: window.innerWidth < 960 ? '2.5rem' : '3.8rem', lineHeight: 1.1, color: '#0f172a', fontWeight: 800, margin: 0 }}>
                  Real Immersive <span style={{ background: 'linear-gradient(120deg, #e91e63, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venue & Decor</span>
                </h2>
                <p style={{ fontSize: window.innerWidth < 960 ? '1rem' : '1.25rem', color: '#475569', lineHeight: 1.6, marginTop: 20 }}>{view.description}</p>
              </div>
              <button style={{ background: '#111', color: '#fff', border: 'none', padding: '16px 28px', borderRadius: 50, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }} onClick={() => onVenueExplore?.()}>
                Full 360° Interaction Tour ↗
              </button>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-primary" style={M.btnPrimary} onClick={() => onStart(0)}>Get Free Quote</button>
                <button style={M.btnOutline} onClick={() => onStart(1)}>Check Date</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" style={M.aboutSection} id="about">
        <div style={M.aboutCurve} />
        <div style={M.aboutInner}>
          <h2 style={M.aboutTitle}>About WeddingBudget.AI</h2>
          <h3 style={M.aboutSubTitle}>Best Wedding Services in India</h3>
          <p style={M.aboutText}>
            WeddingBudget.AI is here to help you plan your perfect wedding and make sure that your wedding dream doesn't just remain a dream; we will make it a reality.
          </p>
          <p style={M.aboutText}>
            Being India's largest wedding planning company, we understand that planning a wedding can be overwhelming and stress-inducing. Our <span style={{ color: '#e91e8c', fontWeight: 600 }}>end-to-end wedding services</span> make sure you enjoy your special day of your life without any problem.
            {expanded && (
              <>
                <br /><br />
                We already have done more than 1,000+ weddings and have launched different types of wedding services like venue booking, decorator booking, photographers, mehendi artists, etc. Our team of experts is dedicated to bringing your vision to life with precision and passion.
              </>
            )}
          </p>
          <button style={M.readMore} onClick={() => setExpanded((v) => !v)}>{expanded ? 'Read less' : 'Read more'}</button>
        </div>
      </section>

      <Testimonials />

      <section className="cta-section" style={M.ctaSection}>
        <div style={M.ctaInner}>
          <div className="cta-emoji-anim" style={M.ctaEmojis}>💍 ✨ 💐 🎊 🥂</div>
          <h2 style={M.ctaH2}>Ready to plan your dream wedding?</h2>
          <p style={M.ctaP}>Join thousands of couples who planned their perfect day with WeddingBudget.AI</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{ ...M.btnPrimary, ...M.btnLarge, background: '#e91e8c' }} onClick={() => onStart(0)}>Start Planning — It's Free</button>
            <button style={{ ...M.btnOutline, ...M.btnLarge, color: '#e91e8c', borderColor: '#e91e8c' }} onClick={onVendor}>Register as a Vendor</button>
          </div>
        </div>
      </section>

      <Footer onVendor={onVendor} onStart={onStart} />
    </div>
  );
}

let mobileNavOpenGlobal = false;
