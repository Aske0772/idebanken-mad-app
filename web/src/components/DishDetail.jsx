import { useEffect, useMemo, useRef, useState } from 'react';
import { DishArt } from './ui.jsx';
import { X, Heart, Minus, Plus, Clock, Tag, Check } from './icons.jsx';
import { DIET_LABEL } from './SwipeView.jsx';
import { priceDish, isExact } from '../lib/pricing.js';
import { kr, krSmall, qty, capitalize, sourceParts } from '../lib/format.js';

// Order of ingredient groups in the dish view (keys from server CATEGORIES).
const CATEGORY_ORDER = ['kod', 'fisk', 'gront', 'mejeri', 'brod', 'kolonial', 'frost'];

const isTilbud = (line) => line.source?.kind === 'tilbud';

const groupByCategory = (lines) =>
  CATEGORY_ORDER
    .map((cat) => ({ cat, lines: lines.filter((l) => l.ing.cat === cat) }))
    .filter((g) => g.lines.length > 0);

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
    const opener = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      // Give focus back to whatever opened the view (the card or a week row).
      if (opener?.isConnected) opener.focus();
    };
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
          <div role="tabpanel" className="ing-groups">
            {groupByCategory(bought).map((g) => (
              <section key={g.cat} className="ing-group" aria-label={data.categories[g.cat]}>
                <h3 className="ing-group-title">{data.categories[g.cat]}</h3>
                <ul className="ing-boxes">
                  {g.lines.map((l) => (
                    <li key={l.id} className={`ing-box ${l.source ? '' : 'is-home'} ${isTilbud(l) ? 'is-tilbud' : ''}`}>
                      <IngredientBody line={l} storesById={storesById} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {stapleLines.length > 0 && (
              <section className="ing-group" aria-label="Basisvarer">
                <h3 className="ing-group-title">Basisvarer</h3>
                <p className="ing-group-hint">Ikke med i prisen. Tryk på det, du mangler.</p>
                <ul className="ing-boxes">
                  {stapleLines.map((l) => {
                    const on = staples.includes(l.id);
                    return (
                      <li key={l.id}>
                        <button
                          type="button" className={`ing-box as-button ${on ? 'is-on' : ''} ${on && isTilbud(l) ? 'is-tilbud' : ''}`}
                          aria-pressed={on} onClick={() => toggleStaple(l.id)}
                        >
                          {on ? (
                            <IngredientBody line={l} storesById={storesById} />
                          ) : (
                            <>
                              <span className="box-name">{capitalize(l.ing.name)}</span>
                              <span className="box-note">Har det hjemme</span>
                            </>
                          )}
                          <span className="box-check" aria-hidden="true">{on ? <Check size={14} /> : <Plus size={14} />}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
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

// One ingredient: name, amount, where to buy it and what it costs.
function IngredientBody({ line, storesById }) {
  const { source } = line;
  if (!source) {
    return (
      <>
        <span className="box-name">{capitalize(line.ing.name)}</span>
        <span className="box-qty">{qty(line.need, line.ing)}</span>
        <span className="box-note">Har hjemme</span>
      </>
    );
  }
  const { store, note } = sourceParts(source, storesById);
  const exact = isExact(source);
  return (
    <>
      <span className="box-name">{capitalize(line.ing.name)}</span>
      <span className="box-qty">{qty(line.need, line.ing)}</span>
      <span className="box-foot">
        <span className={`box-src ${exact ? '' : 'is-approx'}`}>
          {store && <span className="box-store">{store}</span>}
          <span className="box-kind">{note}</span>
        </span>
        <span className="box-price">{exact ? '' : 'ca. '}{kr(source.cost)}</span>
      </span>
    </>
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
