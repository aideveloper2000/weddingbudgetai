import { useEffect, useState } from 'react';
import StyleTab from './StyleTab.jsx';
import VenueTab from './VenueTab.jsx';
import DecorTab from './DecorTab.jsx';
import FoodTab from './FoodTab.jsx';
import ArtistsTab from './ArtistsTab.jsx';
import SundriesTab from './SundriesTab.jsx';
import LogisticsTab from './LogisticsTab.jsx';
import BudgetTab from './BudgetTab.jsx';
import ChecklistTab from './ChecklistTab.jsx';
import PaymentsTab from './PaymentsTab.jsx';
import WishlistTab from './WishlistTab.jsx';

const TABS = [
  { id: 0, label: 'Style', short: 'Style' },
  { id: 1, label: 'Venue', short: 'Venue' },
  { id: 2, label: 'Decor AI', short: 'Decor' },
  { id: 3, label: 'Food', short: 'Food' },
  { id: 4, label: 'Artists', short: 'Artists' },
  { id: 5, label: 'Sundries', short: 'Sundries' },
  { id: 6, label: 'Logistics', short: 'Logistics' },
  { id: 7, label: 'Budget', short: 'Budget' },
  { id: 8, label: 'Checklist', short: 'Checklist' },
  { id: 9, label: 'Payments', short: 'Payments' },
  { id: 10, label: 'Wishlist', short: 'Wishlist' },
];

export default function Planner({ wedding, update, updateMany, activeTab, setActiveTab, onExit }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const required = (tab) => {
    const e = [];
    if (tab === 0) {
      if (!wedding.wedding_date) e.push('Select a wedding date');
      if (!wedding.wedding_type) e.push('Select a wedding type');
      if (!wedding.budget_tier) e.push('Select a budget style');
      if (!(wedding.events || []).length) e.push('Select at least one event');
    }
    if (tab === 1) {
      if (!wedding.venue_type) e.push('Select a venue type');
      if (!wedding.wedding_state) e.push('Select the wedding state');
      if (!wedding.wedding_district) e.push('Select the wedding district');
      if (!wedding.total_guests || wedding.total_guests < 1) e.push('Enter the number of guests');
    }
    if (tab === 2 && !(wedding.selected_decor || []).length) e.push('Select at least one decor item from the gallery');
    if (tab === 3) {
      if (!(wedding.food_categories || []).length) e.push('Select food category (Veg / Non-Veg / Jain)');
      if (!wedding.food_budget_tier) e.push('Select a food budget tier');
      if (!wedding.bar_type) e.push('Select bar type');
    }
    if (tab === 4 && !(wedding.selected_artists || []).length)
      e.push('Select at least one artist / entertainment option');
    return e;
  };

  const goNext = () => {
    const errs = required(activeTab);
    if (errs.length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setActiveTab(Math.min(TABS.length - 1, activeTab + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        // no-op guard for Enter handling inside tabs
      }
    };
    return () => {};
  }, []);

  useEffect(() => {
    const handler = () => goNext();
    window.addEventListener('weddingNextTab', handler);
    return () => window.removeEventListener('weddingNextTab', handler);
  });

  const tabProps = { wedding, update, updateMany };
  const renderTab = () => {
    switch (activeTab) {
      case 0:
        return <StyleTab {...tabProps} />;
      case 1:
        return <VenueTab {...tabProps} />;
      case 2:
        return <DecorTab {...tabProps} />;
      case 3:
        return <FoodTab {...tabProps} />;
      case 4:
        return <ArtistsTab {...tabProps} />;
      case 5:
        return <SundriesTab {...tabProps} />;
      case 6:
        return <LogisticsTab {...tabProps} />;
      case 7:
        return <BudgetTab {...tabProps} />;
      case 8:
        return <ChecklistTab {...tabProps} />;
      case 9:
        return <PaymentsTab {...tabProps} />;
      case 10:
        return <WishlistTab {...tabProps} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <TopNavLite
        activeTab={activeTab}
        goTo={setActiveTab}
        isMobile={isMobile}
        wedding={wedding}
        onExit={onExit}
      />
      <div style={{ width: '100%', height: 3, background: '#EBEBEB' }}>
        <div
          style={{
            height: '100%',
            background: '#D4537E',
            width: `${(activeTab / (TABS.length - 1)) * 100}%`,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
      <div style={{ flex: 1, paddingBottom: 120 }}>
        {errors.length > 0 && (
          <div
            style={{
              background: '#FFF5F5',
              border: '1px solid #FED7D7',
              borderRadius: 16,
              padding: '16px 20px',
              margin: '20px auto',
              maxWidth: 1300,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 4px 12px rgba(229, 62, 62, 0.05)',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#F56565',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              !
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#C53030' }}>Information Required</div>
              <div style={{ fontSize: 12, color: '#E53E3E', opacity: 0.9 }}>{errors[0]}</div>
            </div>
            <button
              onClick={() => setErrors([])}
              style={{ border: 'none', background: 'none', color: '#FEB2B2', cursor: 'pointer', fontSize: 18 }}
            >
              ×
            </button>
          </div>
        )}
        <div key={activeTab}>{renderTab()}</div>

        <div
          style={{
            maxWidth: 1300,
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1.5px solid #8ecae6',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <button
            onClick={() => {
              setErrors([]);
              setActiveTab(Math.max(0, activeTab - 1));
            }}
            disabled={activeTab === 0}
            style={{
              padding: '11px 26px',
              borderRadius: 12,
              border: '2px solid #8ecae6',
              background: 'white',
              cursor: activeTab === 0 ? 'not-allowed' : 'pointer',
              color: '#023047',
              fontWeight: 700,
              fontSize: 15,
              flex: isMobile ? 1 : 'unset',
            }}
          >
            ← Back
          </button>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              order: isMobile ? -1 : 0,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <div style={{ fontSize: 13, color: '#4a7a94', fontWeight: 600, textAlign: 'center' }}>
              Step {activeTab + 1} of {TABS.length}
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#10b981',
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 8 }}>●</span> PROGRESS AUTO-SAVED
            </div>
          </div>
          {activeTab < TABS.length - 1 ? (
            <button
              className="btn-primary"
              onClick={goNext}
              style={{ flex: isMobile ? 1 : 'unset' }}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => update('finalised', true)}
              style={{
                background: wedding.finalised ? '#059669' : 'linear-gradient(135deg,#059669,#047857)',
                color: 'white',
                flex: isMobile ? 1 : 'unset',
                opacity: wedding.finalised ? 0.8 : 1,
              }}
            >
              {wedding.finalised ? 'Finalised ✓' : 'Finalise'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TopNavLite({ activeTab, goTo, isMobile, wedding, onExit }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav
      className="top-nav"
      style={{
        position: 'sticky',
        bottom: 'auto',
        top: 0,
        zIndex: 200,
        background: '#ffffff',
        borderBottom: isMobile ? 'none' : '1px solid #EBEBEB',
        borderTop: isMobile ? '1px solid #EBEBEB' : 'none',
        height: isMobile ? 60 : 56,
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 16,
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        fontFamily: "'DM Sans','Inter',sans-serif",
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, textDecoration: 'none', cursor: 'pointer' }}>
        <svg
          width={isMobile ? 22 : 26}
          height={isMobile ? 22 : 26}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D4537E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: isMobile ? 'none' : 'block' }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span
          className="logo-text"
          style={{
            fontWeight: 800,
            fontSize: isMobile ? 12 : 15,
            color: '#111',
            letterSpacing: '-0.3px',
            display: isMobile ? 'none' : 'block',
          }}
          onClick={onExit}
        >
          WeddingBudget<span style={{ color: '#D4537E' }}>.AI</span>
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <div
          className="nav-tab-strip"
          style={{
            display: 'flex',
            gap: isMobile ? 12 : 2,
            padding: 3,
            background: isMobile ? 'transparent' : '#ffffff',
            borderRadius: 10,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            maxWidth: '100%',
            flexWrap: 'nowrap',
          }}
        >
          <style>{`.nav-tab-strip::-webkit-scrollbar { display: none; }`}</style>
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                className="nav-tab-btn"
                style={{
                  position: 'relative',
                  padding: isMobile ? '6px 10px' : '5px 11px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? 18 : 12,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#111' : '#888',
                  background: active ? '#FBE8EF' : 'transparent',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minHeight: isMobile ? 44 : 32,
                  fontFamily: "'DM Sans','Inter',sans-serif",
                }}
              >
                {isMobile ? '' : t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="nav-right-chips" style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
        {!isMobile && wedding.wedding_type && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              background: '#FBE8EF',
              color: '#D4537E',
              border: '1px solid #F2C4D4',
              whiteSpace: 'nowrap',
            }}
          >
            {wedding.wedding_type}
          </span>
        )}
        {!isMobile && wedding.total_guests > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              background: '#DCFCE7',
              color: '#16A34A',
              border: '1px solid #BBF7D0',
              whiteSpace: 'nowrap',
            }}
          >
            {wedding.total_guests} guests
          </span>
        )}
        <button
          onClick={onExit}
          style={{
            background: isMobile ? 'transparent' : 'rgba(233, 30, 140, 0.1)',
            color: '#e91e8c',
            border: isMobile ? 'none' : '1px solid rgba(233, 30, 140, 0.2)',
            padding: isMobile ? '4px' : '4px 12px',
            borderRadius: 50,
            fontSize: isMobile ? 20 : 11,
            fontWeight: 700,
            cursor: 'pointer',
            marginLeft: 4,
          }}
        >
          {isMobile ? '⌂' : 'Home'}
        </button>
      </div>
    </nav>
  );
}
