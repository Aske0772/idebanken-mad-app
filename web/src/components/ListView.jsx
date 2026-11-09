import { useState } from 'react';
import { Check, Share, Undo } from './icons.jsx';
import { Qty } from './Qty.jsx';
import { isExact } from '../lib/pricing.js';
import { kr, packSize, productSize, capitalize, sourceParts, updatedLabel } from '../lib/format.js';
import { AddItem } from './AddItem.jsx';

export function ListView({ data, list, checked, stores, countOf, onCheck, onStep, onStepProduct, onBackHome }) {
  const storesById = Object.fromEntries(data.stores.map((s) => [s.id, s]));
  const [toast, setToast] = useState('');

  // What one pack is, as printed: "Letmælk · 1 l". The stepper shows how many.
  const pack = (i) => {
    if (i.extra) return productSize(i.extra.amount, i.extra.unit);
    const o = i.source.offer;
    const size = o?.size ? productSize(o.size, o.sizeUnit) : packSize(i.source.packSize, i.ing);
    // The product name only when it says more than the ingredient ("Letmælk" under Mælk, not "Agurk" under Agurk).
    const title = o && o.title.toLocaleLowerCase('da-DK') !== i.ing.name.toLocaleLowerCase('da-DK') ? o.title : null;
    return [title, size].filter(Boolean).join(' · ');
  };
  // "i alt 2 kg" when more than one pack is bought.
  const totalOf = (i) => {
    const n = i.source.packs;
    if (n <= 1) return '';
    const o = i.extra ?? i.source.offer;
    const amount = i.extra ? o.amount : o?.size;
    const unit = i.extra ? o.unit : o?.sizeUnit;
    if (amount > 0 && unit !== 'pcs') return `i alt ${productSize(amount * n, unit)}`;
    return '';
  };
  const product = (i) => `${i.source.packs} × ${pack(i)}`;
  const nameOf = (i) => (i.extra ? i.extra.title : capitalize(i.ing.name));

  const share = async () => {
    const text = list.groups.map((g) => {
      const name = g.key === 'other' ? 'Øvrige varer' : storesById[g.key]?.name;
      return `${name}\n${g.items.map((i) => `• ${nameOf(i)}: ${product(i)}`).join('\n')}`;
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
        <div className="empty"><p>Listen fyldes, når du tilføjer retter til ugen eller selv tilføjer varer.</p></div>
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

      <AddItem stores={stores} storesById={storesById} ingredients={data.ingredients} countOf={countOf} onStep={onStepProduct} />

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
                      aria-label={`${nameOf(i)} ${on ? 'købt' : 'ikke købt'}`}
                      onClick={() => onCheck(i.id)}
                    >
                      {on && <Check size={15} />}
                    </button>
                    <span className="shop-text">
                      <span className="shop-name">{nameOf(i)}</span>
                      <span className="shop-product">{[pack(i), totalOf(i)].filter(Boolean).join(' · ')}</span>
                      <span className={`shop-kind ${i.source.kind}`}>{store ? note : [where, note].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span className="shop-side">
                      <span className="shop-price">{isExact(i.source) ? '' : 'ca. '}{kr(i.source.cost)}</span>
                      <Qty
                        n={i.source.packs} label={i.extra ? i.extra.title : i.ing.name}
                        atMin={i.extra ? 'remove' : i.ing.staple ? 'stop' : 'home'} onStep={(d) => onStep(i, d)}
                      />
                    </span>
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
