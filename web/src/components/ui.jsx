import { useEffect } from 'react';
import { Minus, Plus } from './icons.jsx';

export function Sheet({ open, onClose, children, label }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet" role="dialog" aria-modal="true" aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        {children}
      </div>
    </div>
  );
}

export function Stepper({ label, value, min = 1, max = 12, onChange, unit }) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button
          type="button" className="round" aria-label={`Færre ${label.toLowerCase()}`}
          disabled={value <= min} onClick={() => onChange(value - 1)}
        >
          <Minus size={18} />
        </button>
        <span className="stepper-value" aria-live="polite">
          {value}
          {unit && <small> {unit(value)}</small>}
        </span>
        <button
          type="button" className="round" aria-label={`Flere ${label.toLowerCase()}`}
          disabled={value >= max} onClick={() => onChange(value + 1)}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

// Photo when we have one, otherwise a generated plate in the dish's own colour.
export function DishArt({ recipe, className = '' }) {
  if (recipe.image) {
    return <img className={`dish-art ${className}`} src={recipe.image} alt="" draggable="false" />;
  }
  const h = recipe.hue;
  return (
    <div
      className={`dish-art dish-art--gen ${className}`}
      style={{ '--h1': `${h}`, '--h2': `${(h + 28) % 360}` }}
      aria-hidden="true"
    >
      <span className="dish-emoji">{recipe.emoji}</span>
    </div>
  );
}

export function StoreDot({ color }) {
  return <span className="store-dot" style={{ background: color }} />;
}
