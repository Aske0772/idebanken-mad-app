import { Home, Minus, Plus } from './icons.jsx';

// − n + for anything you buy. At its lowest, − either removes the item or, for a
// dish's ingredient, moves it to "Har hjemme" – the house shows which.
// label: what is counted ("agurk"). atMin: 'remove' | 'home' | 'stop'.
export function Qty({ n, label, atMin = 'remove', accent = false, onStep }) {
  const last = n <= 1;
  const minus = last && atMin === 'home'
    ? { icon: <Home size={16} />, aria: `Har ${label} hjemme` }
    : { icon: <Minus size={16} />, aria: last ? `Fjern ${label}` : `Én ${label} mindre` };
  return (
    <span className={`qty ${accent ? 'is-accent' : ''}`}>
      <button type="button" aria-label={minus.aria} disabled={last && atMin === 'stop'} onClick={() => onStep(-1)}>
        {minus.icon}
      </button>
      <span className="qty-n" aria-live="polite">{n}</span>
      <button type="button" aria-label={`Én ${label} mere`} onClick={() => onStep(1)}>
        <Plus size={16} />
      </button>
    </span>
  );
}
