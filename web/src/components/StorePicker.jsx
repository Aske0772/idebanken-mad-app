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
            <span className="store-chip-name">{s.name}</span>
            <span className="store-chip-count">{s.offerCount} tilbud</span>
            <span className="store-chip-check" aria-hidden="true">{on && <Check size={14} />}</span>
          </button>
        );
      })}
    </div>
  );
}
