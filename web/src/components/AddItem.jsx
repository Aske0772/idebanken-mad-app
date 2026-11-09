import { useMemo, useState } from 'react';
import { fetchCatalog } from '../lib/api.js';
import { krPrice, productSize, unitPrice, sourceParts } from '../lib/format.js';
import { Plus } from './icons.jsx';
import { Qty } from './Qty.jsx';

const LIMIT = 30;
const norm = (s) => s.toLocaleLowerCase('da-DK');

// "Tilføj vare": search every food item in your stores this week and put it on
// the list yourself, for what no recipe covers (coffee, oats, a snack).
// countOf(product) → { n, home }: how many are on the list, also as part of a dish line.
export function AddItem({ stores, storesById, countOf, onStep }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  // The catalog is big, so it is fetched the first time the field is used.
  const load = () => {
    if (items) return;
    setError('');
    fetchCatalog().then((c) => setItems(c.items)).catch((e) => setError(e.message));
  };

  const words = norm(query).split(/\s+/).filter(Boolean);
  const { hits, more } = useMemo(() => {
    if (!items || words.length === 0) return { hits: [], more: 0 };
    const found = items.filter((i) => stores.includes(i.store) && words.every((w) => norm(i.title).includes(w)));
    // Names that start with the search first, then tilbud, then the lowest price per kg/l.
    const starts = (i) => (norm(i.title).startsWith(words[0]) ? 0 : 1);
    const per = (i) => (i.amount > 0 && (i.unit === 'kg' || i.unit === 'l') ? i.price / i.amount : i.price);
    found.sort((a, b) => starts(a) - starts(b) || (a.kind !== 'tilbud') - (b.kind !== 'tilbud') || per(a) - per(b));
    return { hits: found.slice(0, LIMIT), more: Math.max(0, found.length - LIMIT) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, stores]);


  return (
    <section className="add-item" aria-label="Tilføj vare">
      <h2 className="shop-group-title"><span>Tilføj vare</span></h2>
      <input
        type="search" className="add-search" placeholder="Søg fx kaffe, havregryn, æg"
        aria-label="Søg efter en vare i dine butikker" enterKeyHint="search" autoComplete="off"
        value={query} onFocus={load} onChange={(e) => { setQuery(e.target.value); load(); }}
      />
      {error && <p className="shop-group-hint">{error}</p>}
      {words.length > 0 && !items && !error && <p className="shop-group-hint">Henter varer …</p>}
      {items && words.length > 0 && hits.length === 0 && (
        <p className="shop-group-hint">Ingen varer i dine butikker hedder noget med "{query}".</p>
      )}
      {hits.length > 0 && (
        <ul className="shop-items">
          {hits.map((i) => {
            const { n, home } = countOf(i);
            const { store, note } = sourceParts({ kind: i.kind, offer: i }, storesById);
            return (
              <li key={i.id} className="shop-item">
                <span className="shop-text">
                  <span className="shop-name">{i.title}</span>
                  <span className="shop-product">
                    {[productSize(i.amount, i.unit), unitPrice(i.price, i.amount, i.unit)].filter(Boolean).join(' · ')}
                  </span>
                  <span className={`shop-kind ${i.kind}`}>{[store, note].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="shop-price">{krPrice(i.price)}</span>
                {n ? (
                  <Qty n={n} label={i.title} atMin={home ? 'home' : 'remove'} accent onStep={(d) => onStep(i, d)} />
                ) : (
                  <button type="button" className="add-btn" onClick={() => onStep(i, 1)} aria-label={`Tilføj ${i.title} til listen`}>
                    <Plus size={18} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {more > 0 && <p className="shop-group-hint">{more} varer mere. Skriv mere for at finde den rigtige.</p>}
    </section>
  );
}
