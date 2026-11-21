import { useEffect, useState } from 'react';
import SelectionCard from './SelectionCard.jsx';
import { SectionTitle } from './ui.jsx';
import { FOOD_CATEGORIES, BAR_TYPES, SPECIALTY_COUNTERS, FOOD_BUDGET_TIERS, DISH_MAP, DISH_PRICES } from '../data/index.js';

// Faithful port of the original Food tab (`mS`): category + bar + budget tier,
// then per-event meal/dish selection with a live food cost estimate.
export default function FoodTab({ wedding, update, updateMany }) {
  const [rates, setRates] = useState({ catering_staff_rate: 1500, crockery_rental_rate: 150, linen_rental_rate: 100 });

  useEffect(() => {
    fetch('https://wedddingbudget-ai.onrender.com/api/budget/global-rates')
      .then((r) => r.json())
      .then((d) => { if (d && d.catering_staff_rate) setRates(d); })
      .catch(() => {});
  }, []);

  // auto-select defaults the first time events exist (mirrors original behaviour)
  useEffect(() => {
    const hasDishes = Object.keys(wedding.food_dishes || {}).some((ev) =>
      Object.keys(wedding.food_dishes[ev] || {}).some((meal) =>
        Object.values(wedding.food_dishes[ev][meal] || {}).some((arr) => arr.length > 0)
      )
    );
    if (!hasDishes && (wedding.events || []).length > 0 && !wedding.food_auto_selected) {
      const next = {};
      let changed = false;
      if (!wedding.food_budget_tier) { next.food_budget_tier = 'Modest'; changed = true; }
      if (!wedding.food_categories || wedding.food_categories.length === 0) { next.food_categories = ['Veg']; changed = true; }
      if (!wedding.bar_type) { next.bar_type = 'Dry Event'; changed = true; }
      const dishes = JSON.parse(JSON.stringify(wedding.food_dishes || {}));
      const meals = JSON.parse(JSON.stringify(wedding.food_meals_per_event || {}));
      const cats = next.food_categories || wedding.food_categories || ['Veg'];
      (wedding.events || []).forEach((ev) => {
        if (!meals[ev] || meals[ev].length === 0) meals[ev] = ['Dinner'];
        (meals[ev] || []).forEach((meal) => {
          dishes[ev] ||= {};
          dishes[ev][meal] ||= {};
          cats.forEach((cat) => {
            dishes[ev][meal][cat] = (DISH_MAP[meal]?.[cat] || []).slice(0, 5);
          });
        });
      });
      next.food_dishes = dishes;
      next.food_meals_per_event = meals;
      next.food_auto_selected = true;
      if (changed) updateMany(next);
    }
  }, [wedding.events, wedding.food_budget_tier]);

  const toggleMeal = (eventId, meal) => {
    const meals = { ...(wedding.food_meals_per_event || {}) };
    const list = meals[eventId] || [];
    meals[eventId] = list.includes(meal) ? list.filter((m) => m !== meal) : [...list, meal];
    update('food_meals_per_event', meals);
  };

  const toggleDish = (eventId, meal, cat, dish) => {
    const all = { ...(wedding.food_dishes || {}) };
    const byEvent = { ...(all[eventId] || {}) };
    const byMeal = { ...(byEvent[meal] || {}) };
    const list = byMeal[cat] || [];
    byMeal[cat] = list.includes(dish) ? list.filter((d) => d !== dish) : [...list, dish];
    byEvent[meal] = byMeal;
    all[eventId] = byEvent;
    update('food_dishes', all);
  };

  const toggleCategory = (id) => {
    const list = wedding.food_categories || [];
    update('food_categories', list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const guests = wedding.total_guests || 0;
  const days = wedding.num_days || 1;

  // local food cost estimate
  let dishTotal = 0;
  Object.values(wedding.food_dishes || {}).forEach((byEvent) => {
    Object.values(byEvent || {}).forEach((byMeal) => {
      Object.entries(byMeal || {}).forEach(([cat, dishes]) => {
        (dishes || []).forEach((d) => { dishTotal += (DISH_PRICES[d] || 0); });
      });
    });
  });
  const tierMult = { Minimalist: 0.8, Modest: 1, High: 1.6, Modern: 2.4, Extravaganza: 2.2 }[wedding.food_budget_tier] || 1;
  const foodCost = Math.round(((dishTotal * tierMult * guests * days) + (guests * rates.catering_staff_rate * 0.05)) / 100) * 100;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card">
        <SectionTitle>Food Categories</SectionTitle>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Select all that apply — multi-select</p>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {FOOD_CATEGORIES.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={(wedding.food_categories || []).includes(item.id)}
              onClick={toggleCategory}
              badge="CATEGORY"
              actionLabel="Add Category"
            />
          ))}
        </div>
      </section>

      <section className="section-card">
        <SectionTitle>Bar Type</SectionTitle>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {BAR_TYPES.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={wedding.bar_type === item.id}
              onClick={(id) => update('bar_type', wedding.bar_type === id ? '' : id)}
              hasAnySelected={!!wedding.bar_type && wedding.bar_type !== item.id}
              showCost
              badge="BAR"
              actionLabel="Choose Bar"
            />
          ))}
        </div>
      </section>

      <section className="section-card">
        <SectionTitle>Food Budget Tier</SectionTitle>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {FOOD_BUDGET_TIERS.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={wedding.food_budget_tier === item.id}
              onClick={(id) => update('food_budget_tier', wedding.food_budget_tier === id ? '' : id)}
              hasAnySelected={!!wedding.food_budget_tier && wedding.food_budget_tier !== item.id}
              badge="TIER"
              actionLabel="Choose Tier"
            />
          ))}
        </div>
      </section>

      {(wedding.events || []).map((eventId) => (
        <section className="section-card" key={eventId}>
          <SectionTitle>{labelForEvent(eventId)} — Meals &amp; Dishes</SectionTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map((meal) => {
              const active = (wedding.food_meals_per_event?.[eventId] || []).includes(meal);
              return (
                <button
                  key={meal}
                  onClick={() => toggleMeal(eventId, meal)}
                  style={{
                    padding: '9px 18px', borderRadius: 50, border: `1.5px solid ${active ? '#D4537E' : '#EBEBEB'}`,
                    background: active ? '#FBE8EF' : '#fff', color: active ? '#B83A64' : '#555',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  {meal}
                </button>
              );
            })}
          </div>
          {(wedding.food_meals_per_event?.[eventId] || []).map((meal) => (
            <div key={meal} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#D4537E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{meal}</div>
              {(wedding.food_categories || ['Veg']).map((cat) => {
                const dishes = DISH_MAP[meal]?.[cat] || [];
                if (!dishes.length) return null;
                const chosen = wedding.food_dishes?.[eventId]?.[meal]?.[cat] || [];
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: cat === 'Veg' ? '#047857' : cat === 'Non-Veg' ? '#B91C1C' : '#7C3AED', marginBottom: 6 }}>{cat}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {dishes.map((dish) => {
                        const on = chosen.includes(dish);
                        return (
                          <button
                            key={dish}
                            onClick={() => toggleDish(eventId, meal, cat, dish)}
                            style={{
                              padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              border: `1.5px solid ${on ? '#D4537E' : '#E5E7EB'}`,
                              background: on ? '#D4537E' : '#fff', color: on ? '#fff' : '#444',
                            }}
                          >
                            {dish} {DISH_PRICES[dish] ? `· ₹${DISH_PRICES[dish]}` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ))}

      <section className="section-card">
        <SectionTitle>Specialty Counters</SectionTitle>
        <div className="image-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {SPECIALTY_COUNTERS.map((item) => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={(wedding.specialty_counters || []).includes(item.id)}
              onClick={(id) => {
                const list = wedding.specialty_counters || [];
                update('specialty_counters', list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
              }}
              showCost
              badge="COUNTER"
              actionLabel="Add Counter"
            />
          ))}
        </div>
        <div style={{ marginTop: 18, padding: 16, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
          Estimated food &amp; beverage cost: <span style={{ color: '#D4537E' }}>{guests ? `₹${foodCost.toLocaleString('en-IN')}` : 'Add guests to estimate'}</span>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginTop: 4 }}>Based on selected dishes × {guests || 0} guests × {days} day(s)</div>
        </div>
      </section>
    </div>
  );
}

function labelForEvent(id) {
  const map = {
    Haldi: 'Haldi', Mehendi: 'Mehendi', Sangeet: 'Sangeet', 'Wedding Day Ceremony': 'Ceremony',
    Reception: 'Reception', Engagement: 'Engagement', 'Pre Wedding Cocktail': 'Cocktail',
    Tilak: 'Tilak', Grihapravesh: 'Grihapravesh',
  };
  return map[id] || id.replace(/^custom_/, '') || 'Event';
}
