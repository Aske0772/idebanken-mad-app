import { StoreDot } from './ui.jsx';
import { Check } from './icons.jsx';

export function StorePicker({ stores, selected, onChange }) {
  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  return (
    <div className="store-grid">
      {stores.filter((s) => s.offerCount > 0).map((s) => {
        const on = selected.includes(s.id);
        return (
          <button
            key={s.id} type="button" className={`store-chip ${on ? 'is-on' : ''}`}
            aria-pressed={on} onClick={() => toggle(s.id)}
          >
            <StoreDot color={s.color} />
            <span className="store-chip-name">{s.name}</span>
            <span className="store-chip-count">{on ? <Check size={16} /> : s.offerCount}</span>
          </button>
        );
      })}
    </div>
  );
}
