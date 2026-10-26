import { useState } from 'react';
import { Check, Home, Share, Undo } from './icons.jsx';
import { isExact } from '../lib/pricing.js';
import { kr, packSize, capitalize, sourceParts, updatedLabel } from '../lib/format.js';

export function ListView({ data, list, checked, onCheck, onAtHome, onBackHome }) {
  const storesById = Object.fromEntries(data.stores.map((s) => [s.id, s]));
  const [toast, setToast] = useState('');

  const product = (i) =>
    i.source.offer ? `${i.source.packs} × ${i.source.offer.title}` : `${i.source.packs} × ${packSize(i.source.packSize, i.ing)}`;

  const share = async () => {
    const text = list.groups.map((g) => {
      const name = g.key === 'other' ? 'Øvrige varer' : storesById[g.key]?.name;
      return `${name}\n${g.items.map((i) => `• ${capitalize(i.ing.name)}: ${product(i)}`).join('\n')}`;
    }).join('\n\n');
    try {
      if (navigator.share) await navigator.share({ title: 'Indkøbsliste', text });
      else {
        await navigator.clipboard.writeText(text);
        setToast('Kopieret');
        setTimeout(() => setToast(''), 1600);
      }
    } catch {
      /* user cancelled share */
    }
  };

  const empty = list.groups.length === 0;
  const items = list.groups.flatMap((g) => g.items);
  const done = items.filter((i) => checked.includes(i.id)).length;

  return (
    <div className="page">
      <header className="page-head">
        <h1>Indkøb</h1>
        {!empty && (
          <button type="button" className="round" aria-label="Del listen" onClick={share}>
            <Share size={20} />
          </button>
        )}
      </header>

      {empty ? (
        <div className="empty"><p>Listen fyldes, når du tilføjer retter til ugen.</p></div>
      ) : (
        <div className="summary">
          <div className="summary-total">{kr(list.total)}</div>
          <div className="summary-sub"><strong>{done}</strong> af {items.length} varer i kurven</div>
          <div
            className="shop-progress" role="progressbar" aria-label="Varer i kurven"
            aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done}
          >
            <span style={{ width: `${(done / items.length) * 100}%` }} />
          </div>
          <div className="summary-fresh">
            Priser opdateret {updatedLabel(data.refreshedAt)}
            {list.approx > 0 && ` · heraf ca. ${kr(list.approx)} vejledende`}
          </div>
        </div>
      )}

      {list.groups.map((g) => {
        const store = storesById[g.key];
        return (
          <section key={g.key} className="shop-group" aria-label={store ? store.name : 'Øvrige varer'}>
            <h2 className="shop-group-title">
              <span>{store ? store.name : 'Øvrige varer'}</span>
              <span>{store ? '' : 'ca. '}{kr(g.total)}</span>
            </h2>
            {!store && (
              <p className="shop-group-hint">Ingen pris i dine butikker. Prisen er REMA 1000's hyldepris eller et skøn.</p>
            )}
            <ul className="shop-items">
              {g.items.map((i) => {
                const on = checked.includes(i.id);
                // The store is already the section title; only "Øvrige varer" names it per item.
                const { store: where, note } = sourceParts(i.source, storesById);
                return (
                  <li key={i.id} className={`shop-item ${on ? 'is-done' : ''}`}>
                    <button
                      type="button" className="shop-check" aria-pressed={on}
                      aria-label={`${capitalize(i.ing.name)} ${on ? 'købt' : 'ikke købt'}`}
                      onClick={() => onCheck(i.id)}
                    >
                      {on && <Check size={15} />}
                    </button>
                    <span className="shop-text">
                      <span className="shop-name">{capitalize(i.ing.name)}</span>
                      <span className="shop-product">{product(i)}</span>
                      <span className={`shop-kind ${i.source.kind}`}>{store ? note : [where, note].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span className="shop-price">{isExact(i.source) ? '' : 'ca. '}{kr(i.source.cost)}</span>
                    {!i.ing.staple && (
                      <button type="button" className="shop-home" aria-label={`Har ${i.ing.name} hjemme`} onClick={() => onAtHome(i.id)}>
                        <Home size={17} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {list.home.length > 0 && (
        <section className="shop-group" aria-label="Har hjemme">
          <h2 className="shop-group-title"><span>Har hjemme</span></h2>
          <p className="shop-group-hint">Tryk for at købe det alligevel.</p>
          <ul className="shop-home-list">
            {list.home.map((i) => (
              <li key={i.id}>
                <button type="button" className="shop-pill" aria-label={`Køb ${i.ing.name} alligevel`} onClick={() => onBackHome(i.id)}>
                  {capitalize(i.ing.name)} <Undo size={14} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
