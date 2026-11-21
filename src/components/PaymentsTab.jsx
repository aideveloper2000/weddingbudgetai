import { useEffect, useState } from 'react';
import { SectionTitle } from './ui.jsx';
import { formatINR } from './SelectionCard.jsx';

// Port of the original Payments tab (`DS`): milestone schedule generated from the
// budget result, with paid/unpaid tracking persisted locally.
export default function PaymentsTab({ wedding, update }) {
  const payments = wedding.payments || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', vendor_name: '', amount: '' });

  const total = wedding.budget_result?.total ?? wedding.budget_result?.tiers?.Standard?.mid ?? 0;
  const paid = payments.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0);
  const pending = Math.max(0, total - paid);

  useEffect(() => {
    if (!payments.length && total > 0) {
      // generate a sensible default milestone schedule
      const milestones = [
        ['Booking Advance', 0.2, wedding.wedding_date ? shiftDate(wedding.wedding_date, -9 * 30) : ''],
        ['Planning Milestone', 0.3, wedding.wedding_date ? shiftDate(wedding.wedding_date, -4 * 30) : ''],
        ['Pre-Wedding Balance', 0.35, wedding.wedding_date ? shiftDate(wedding.wedding_date, -15) : ''],
        ['Final Settlement', 0.15, wedding.wedding_date ? wedding.wedding_date : ''],
      ];
      update('payments', milestones.map(([category, share, date], i) => ({
        id: i + 1, category, due_date: date, total_amount: Math.round(total * share), paid_amount: 0,
        vendor_name: '', status: 'Pending',
      })));
    }
  }, [total]);

  const addPayment = () => {
    if (!form.category || !form.amount) return;
    const next = [...payments, {
      id: payments.length + 1,
      category: form.category,
      vendor_name: form.vendor_name,
      due_date: '',
      total_amount: Number(form.amount),
      paid_amount: 0,
      status: 'Pending',
    }];
    update('payments', next);
    setForm({ category: '', vendor_name: '', amount: '' });
    setShowForm(false);
  };

  const markPaid = (id) => {
    update('payments', payments.map((p) => (p.id === id ? { ...p, paid_amount: p.total_amount, status: 'Paid' } : p)));
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card">
        <SectionTitle>Payment Schedule</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
          {[
            ['Total Budget', total],
            ['Paid', paid],
            ['Pending', pending],
          ].map(([label, val]) => (
            <div key={label} style={{ padding: 16, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: label === 'Pending' ? '#B83A64' : '#0F172A' }}>{formatINR(val)}</div>
            </div>
          ))}
        </div>

        {!payments.length && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            Generate your budget plan first to build a payment schedule.
          </div>
        )}

        {payments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {payments.map((p) => {
              const pct = p.total_amount ? Math.min(100, Math.round(((p.paid_amount || 0) / p.total_amount) * 100)) : 0;
              return (
                <div key={p.id} className="task-card" style={{ padding: 14, borderRadius: 14, border: '1.5px solid #EBEBEB', background: '#fff', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{p.category}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{p.vendor_name || 'Vendor TBD'}{p.due_date ? ` · due ${p.due_date}` : ''}</div>
                  </div>
                  <div style={{ minWidth: 140, flex: 2 }}>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: p.status === 'Paid' ? '#059669' : '#F77C83', transition: 'width .4s ease' }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{formatINR(p.paid_amount || 0)} of {formatINR(p.total_amount)} · {pct}%</div>
                  </div>
                  <button
                    className="btn-primary"
                    disabled={p.status === 'Paid'}
                    onClick={() => markPaid(p.id)}
                    style={{ background: p.status === 'Paid' ? '#059669' : '#F77C83', padding: '9px 16px', fontSize: 13 }}
                  >
                    {p.status === 'Paid' ? 'Paid ✓' : 'Mark Paid'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section-card">
        <SectionTitle>Record a Payment</SectionTitle>
        {!showForm ? (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Payment</button>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, alignItems: 'end' }}>
            <input className="form-input" placeholder="Category e.g. Decor" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="form-input" placeholder="Vendor name" value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} />
            <input className="form-input" placeholder="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={addPayment}>Save</button>
              <button className="btn-primary" style={{ background: '#fff', color: '#111', border: '1.5px solid #EBEBEB' }} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
