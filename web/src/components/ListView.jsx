import { useState } from 'react';
import { StoreDot } from './ui.jsx';
import { Check, Home, Share, Undo } from './icons.jsx';
import { isExact } from '../lib/pricing.js';
import { kr, packSize, capitalize, sourceLabel, updatedLabel } from '../lib/format.js';

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
      <p className="muted small fresh">Priser opdateret {updatedLabel(data.refreshedAt)}</p>

      {empty && <div className="empty"><p>Listen fyldes, når du tilføjer retter til ugen.</p></div>}

      {list.groups.map((g) => {
        const store = storesById[g.key];
        return (
          <section key={g.key} className="list-group">
            <h2 className="list-group-head">
              {store ? <StoreDot color={store.color} /> : null}
              <span className="grow">{store ? store.name : 'Øvrige varer'}</span>
              <span className="muted">{store ? '' : 'ca. '}{kr(g.total)}</span>
            </h2>
            {!store && (
              <p className="muted small">Ingen pris i dine butikker. Prisen er REMA 1000's hyldepris eller et skøn.</p>
            )}
            <ul className="list">
              {g.items.map((i) => {
                const done = checked.includes(i.id);
                return (
                  <li key={i.id} className={done ? 'is-done' : ''}>
                    <button
                      type="button" className="check" aria-pressed={done}
                      aria-label={`${i.ing.name} ${done ? 'købt' : 'ikke købt'}`}
                      onClick={() => onCheck(i.id)}
                    >
                      {done && <Check size={16} />}
                    </button>
                    <span className="list-text">
                      <span className="list-name">{capitalize(i.ing.name)}</span>
                      <span className="muted small">{product(i)}</span>
                      <span className={`small src ${i.source.kind}`}>{sourceLabel(i.source, storesById)}</span>
                    </span>
                    <span className="list-price">{isExact(i.source) ? '' : 'ca. '}{kr(i.source.cost)}</span>
                    {i.ing.staple ? (
                      <span className="icon-btn" aria-hidden="true" />
                    ) : (
                      <button type="button" className="icon-btn" aria-label={`Har ${i.ing.name} hjemme`} onClick={() => onAtHome(i.id)}>
                        <Home size={18} />
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
        <section className="list-group">
          <h2 className="list-group-head"><Home size={16} /> <span className="grow">Har hjemme</span></h2>
          <ul className="list">
            {list.home.map((i) => (
              <li key={i.id} className="is-done">
                <span className="list-text"><span className="list-name">{capitalize(i.ing.name)}</span></span>
                <button type="button" className="icon-btn" aria-label={`Køb ${i.ing.name} alligevel`} onClick={() => onBackHome(i.id)}>
                  <Undo size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!empty && (
        <div className="list-total">
          <span>I alt</span>
          <strong>{kr(list.total)}</strong>
        </div>
      )}
      {list.approx > 0 && (
        <p className="muted small center">heraf ca. {kr(list.approx)} for varer uden pris i dine butikker</p>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
