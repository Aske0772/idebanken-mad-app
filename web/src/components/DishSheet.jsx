import { useMemo, useState } from 'react';
import { Sheet, Stepper, DishArt, StoreDot } from './ui.jsx';
import { Clock, Tag } from './icons.jsx';
import { priceDish, isExact } from '../lib/pricing.js';
import { kr, krSmall, qty, capitalize, sourceLabel } from '../lib/format.js';

// One sheet for everything about a dish: choose days and people, see the price,
// read the recipe. mode: 'add' (after a right swipe or tap) or 'edit' (from the week).
export function DishSheet({ data, recipe, item, mode, prefs, onConfirm, onRemove, onClose }) {
  const [days, setDays] = useState(item?.days ?? 1);
  const [people, setPeople] = useState(item?.people ?? prefs.people);
  const [staples, setStaples] = useState(item?.staples ?? []);
  const [showRecipe, setShowRecipe] = useState(false);
  const storesById = useMemo(() => Object.fromEntries(data.stores.map((s) => [s.id, s])), [data]);

  const price = priceDish(data, recipe, { people, days, staples, atHome: prefs.atHome, stores: prefs.stores });
  const stapleLines = price.lines.filter((l) => l.staple);
  const toggleStaple = (id) =>
    setStaples((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Sheet open onClose={onClose} label={recipe.title}>
      <div className="dish-head">
        <DishArt recipe={recipe} className="dish-thumb" />
        <div>
          <h2 className="dish-title">{recipe.title}</h2>
          <p className="muted small"><Clock size={14} /> {recipe.minutes} min · {recipe.blurb}</p>
        </div>
      </div>

      <div className="steppers">
        <Stepper label="Dage" value={days} max={7} onChange={setDays} />
        <Stepper label="Personer" value={people} max={12} onChange={setPeople} />
      </div>

      {stapleLines.length > 0 && (
        <div className="staples">
          <span className="small muted">Basisvarer er ikke med. Mangler du noget?</span>
          <div className="chips-wrap">
            {stapleLines.map((l) => (
              <button
                key={l.id} type="button" className={`chip small ${staples.includes(l.id) ? 'is-on' : ''}`}
                aria-pressed={staples.includes(l.id)} onClick={() => toggleStaple(l.id)}
              >
                {l.ing.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="price-box" aria-live="polite">
        <div className="price-total">{kr(price.total)}</div>
        <div className="price-sub">
          <strong>{krSmall(price.perMeal)}</strong> pr. person pr. måltid
          <span className="muted"> · {price.meals} måltider</span>
        </div>
        <div className="price-offers small">
          <Tag size={14} /> {price.onOffer} af {price.bought} varer på tilbud
        </div>
        {price.approx > 0 && (
          <div className="price-approx small">heraf ca. {kr(price.approx)} for varer uden pris i dine butikker</div>
        )}
      </div>

      <div className="sheet-actions">
        {mode === 'edit' && (
          <button type="button" className="secondary danger" onClick={onRemove}>Fjern</button>
        )}
        <button type="button" className="primary wide" onClick={() => onConfirm({ days, people, staples })}>
          {mode === 'edit' ? 'Gem' : 'Tilføj til ugen'}
        </button>
      </div>

      <button type="button" className="link-btn" onClick={() => setShowRecipe((v) => !v)} aria-expanded={showRecipe}>
        {showRecipe ? 'Skjul opskrift' : 'Se ingredienser og opskrift'}
      </button>

      {showRecipe && (
        <div className="recipe">
          <ul className="ing-list">
            {price.lines.map((l) => (
              <li key={l.id} className={l.source ? '' : 'is-muted'}>
                <span className="ing-qty">{qty(l.need, l.ing)}</span>
                <span className="ing-name">
                  {capitalize(l.ing.name)}
                  {l.source && (
                    <span className={`ing-src ${isExact(l.source) ? '' : 'is-approx'}`}>
                      {isExact(l.source) && <StoreDot color={storesById[l.source.offer.store]?.color} />}
                      {sourceLabel(l.source, storesById)}
                    </span>
                  )}
                  {!l.source && <span className="ing-src">{l.staple ? 'basisvare' : 'har hjemme'}</span>}
                </span>
                <span className="ing-price">
                  {l.source ? `${isExact(l.source) ? '' : 'ca. '}${kr(l.source.cost)}` : '–'}
                </span>
              </li>
            ))}
          </ul>
          <ol className="steps">
            {recipe.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}
    </Sheet>
  );
}
