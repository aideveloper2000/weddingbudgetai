import { useEffect, useState } from 'react';
import { CHECKLIST_PHASES, CHECKLIST_TASKS } from '../data/index.js';
import { SectionTitle } from './ui.jsx';

// Port of the original Checklist tab (`LS`): phase-grouped tasks persisted to
// localStorage under a date-keyed key, with progress and print support.
export default function ChecklistTab({ wedding }) {
  const storageKey = `checklist_${wedding.wedding_date || 'default'}`;
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return CHECKLIST_TASKS;
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(tasks)); } catch {}
  }, [tasks, storageKey]);

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const monthsLeft = wedding.wedding_date ? Math.max(0, Math.ceil((new Date(wedding.wedding_date) - new Date()) / (1000 * 60 * 60 * 24 * 30.4))) : null;

  const toggle = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="checklist-print-root" style={{ maxWidth: 1300, margin: '0 auto', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <section className="section-card checklist-header">
        <SectionTitle>Wedding Checklist</SectionTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#111' }}>{pct}%</div>
            <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{done} of {tasks.length} tasks complete{monthsLeft != null ? ` · ${monthsLeft} months to go` : ''}</div>
          </div>
          <button className="print-btn btn-primary" onClick={() => window.print()}>Print Checklist</button>
        </div>
        <div style={{ height: 10, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#059669,#34d399)', transition: 'width .5s ease' }} />
        </div>
      </section>

      {CHECKLIST_PHASES.map((phase) => {
        const list = tasks.filter((t) => t.phase === phase.id);
        const phaseDone = list.filter((t) => t.done).length;
        return (
          <section className="section-card" key={phase.id}>
            <div className="phase-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <SectionTitle>{phase.title} <span style={{ color: '#D4537E', fontWeight: 800 }}>— {phase.subtitle}</span></SectionTitle>
              <span style={{ fontSize: 12, color: '#999', fontWeight: 700 }}>{phaseDone}/{list.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {list.map((task) => (
                <label key={task.id} className="task-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: task.done ? '#F0FDF4' : '#FAFAFA', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!task.done} onChange={() => toggle(task.id)} style={{ width: 18, height: 18, accentColor: '#059669' }} />
                  <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#9CA3AF' : '#333', fontSize: 14, fontWeight: task.done ? 500 : 600 }}>
                    {task.task}
                  </span>
                </label>
              ))}
            </div>
          </section>
        );
      })}
      <style>{`@media print { .print-btn { display:none } .section-card { box-shadow:none; border-color:#ddd } }`}</style>
    </div>
  );
}
