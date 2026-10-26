import { useEffect, useMemo, useRef, useState } from 'react';
import { DishArt, StoreDot } from './ui.jsx';
import { X, Heart, Minus, Plus, Clock, Tag } from './icons.jsx';
import { DIET_LABEL } from './SwipeView.jsx';
import { priceDish, isExact } from '../lib/pricing.js';
import { kr, krSmall, qty, capitalize, sourceLabel } from '../lib/format.js';

// Full-screen dish view: the photo fills the screen and a frosted glass panel
// holds everything about the dish. mode: 'add' (from the deck) or 'edit' (from the week).
export function DishDetail({ data, recipe, item, mode, prefs, saved, onToggleSave, onConfirm, onRemove, onClose }) {
  const [days, setDays] = useState(item?.days ?? 1);
  const [people, setPeople] = useState(item?.people ?? prefs.people);
  const [staples, setStaples] = useState(item?.staples ?? []);
  const [tab, setTab] = useState('ingredienser');
  const closeRef = useRef(null);
  const storesById = useMemo(() => Object.fromEntries(data.stores.map((s) => [s.id, s])), [data]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const price = priceDish(data, recipe, { people, days, staples, atHome: prefs.atHome, stores: prefs.stores });
  const bought = price.lines.filter((l) => !l.staple);
  const stapleLines = price.lines.filter((l) => l.staple);
  const toggleStaple = (id) => setStaples((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={recipe.title}>
      <DishArt recipe={recipe} className="detail-photo" />
      <div className="detail-bar">
        <button ref={closeRef} type="button" className="glass-btn" aria-label="Luk" onClick={onClose}>
          <X size={20} />
        </button>
        <button
          type="button" className={`glass-btn ${saved ? 'is-saved' : ''}`} aria-pressed={saved}
          aria-label={saved ? 'Fjern fra gemte' : 'Gem retten'} onClick={onToggleSave}
        >
          <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="glass-panel">
        <h2 className="detail-title">{recipe.title}</h2>
        <p className="detail-blurb">{recipe.blurb}</p>
        <div className="detail-chips">
          <span className="glass-chip">{DIET_LABEL[recipe.diet]}</span>
          <span className="glass-chip"><Clock size={14} /> {recipe.minutes} min</span>
          <span className="glass-chip"><Tag size={14} /> {price.onOffer} af {price.bought} på tilbud</span>
        </div>

        <div className="detail-pills">
          <Counter label="Dage" value={days} max={7} onChange={setDays} />
          <Counter label="Personer" value={people} max={12} onChange={setPeople} />
        </div>

        <div className="detail-price" aria-live="polite">
          <span className="detail-total">{kr(price.total)}</span>
          <span className="detail-per">
            <strong>{krSmall(price.perMeal)}</strong> pr. person pr. måltid · {price.meals} måltider
          </span>
          {price.approx > 0 && <span className="detail-approx">heraf ca. {kr(price.approx)} for varer uden pris i dine butikker</span>}
        </div>

        <div className="segmented" role="tablist" aria-label="Indhold">
          {['ingredienser', 'opskrift'].map((t) => (
            <button
              key={t} type="button" role="tab" aria-selected={tab === t}
              className={tab === t ? 'is-on' : ''} onClick={() => setTab(t)}
            >
              {capitalize(t)}
            </button>
          ))}
        </div>

        {tab === 'ingredienser' ? (
          <div role="tabpanel">
            <ul className="ing-grid">
              {bought.map((l) => (
                <li key={l.id} className={l.source ? '' : 'is-muted'}>
                  <span className="ing-row">
                    <span className="ing-name">{capitalize(l.ing.name)}</span>
                    <span className="ing-qty">{qty(l.need, l.ing)}</span>
                  </span>
                  <span className={`ing-src ${l.source && !isExact(l.source) ? 'is-approx' : ''}`}>
                    {l.source && isExact(l.source) && <StoreDot color={storesById[l.source.offer.store]?.color} />}
                    {l.source ? `${sourceLabel(l.source, storesById)} · ${isExact(l.source) ? '' : 'ca. '}${kr(l.source.cost)}` : 'har hjemme'}
                  </span>
                </li>
              ))}
            </ul>
            {stapleLines.length > 0 && (
              <div className="detail-staples">
                <span>Basisvarer er ikke med. Mangler du noget?</span>
                <div className="chips-wrap">
                  {stapleLines.map((l) => (
                    <button
                      key={l.id} type="button" className={`glass-chip as-button ${staples.includes(l.id) ? 'is-on' : ''}`}
                      aria-pressed={staples.includes(l.id)} onClick={() => toggleStaple(l.id)}
                    >
                      {l.ing.name}{l.source ? ` · ${kr(l.source.cost)}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ol className="detail-steps" role="tabpanel">
            {recipe.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        )}
      </div>

      <div className="detail-actions">
        {mode === 'edit' && (
          <button type="button" className="glass-btn wide-text" onClick={onRemove}>Fjern</button>
        )}
        <button type="button" className="primary wide" onClick={() => onConfirm({ days, people, staples })}>
          {mode === 'edit' ? 'Gem ændringer' : 'Tilføj til ugen'} · {kr(price.total)}
        </button>
      </div>
    </div>
  );
}

// Compact −/+ pill, like the "30 mins / 180° / Oven" pills in the panel.
function Counter({ label, value, min = 1, max, onChange }) {
  return (
    <div className="counter">
      <span className="counter-label">{label}</span>
      <div className="counter-controls">
        <button type="button" aria-label={`Færre ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          <Minus size={16} />
        </button>
        <span className="counter-value" aria-live="polite">{value}</span>
        <button type="button" aria-label={`Flere ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
