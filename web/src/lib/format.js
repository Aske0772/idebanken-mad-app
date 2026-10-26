const kr0 = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 1 });

export const kr = (n) => `${kr0.format(Math.round(n))} kr`;

// Per-portion prices are small, so keep one decimal below 10 kr.
export const krSmall = (n) => (n < 10 ? `${num1.format(n)} kr` : kr(n));

// A recipe quantity in kitchen language: "450 g", "1,2 kg", "2 spsk", "3 fed".
export function qty(need, ing) {
  if (ing.unit === 'g') {
    if (ing.staple && need <= 12) return need <= 3 ? 'en knivspids' : `${num1.format(need / 5)} tsk`;
    if (need >= 1000) return `${num1.format(need / 1000)} kg`;
    return `${Math.max(5, Math.round(need / 5) * 5)} g`;
  }
  if (ing.unit === 'ml') {
    if (need <= 45) return need < 10 ? `${num1.format(need / 5)} tsk` : `${num1.format(need / 15)} spsk`;
    if (need >= 1000) return `${num1.format(need / 1000)} l`;
    return `${num1.format(need / 100)} dl`;
  }
  const n = Math.ceil(need * 2 - 1e-9) / 2;
  const label = ing.label ?? 'stk';
  return `${num1.format(n)} ${label}`;
}

// Size of one pack as printed in the avis.
export function packSize(amount, ing) {
  if (ing.unit === 'g') return amount >= 1000 ? `${num1.format(amount / 1000)} kg` : `${Math.round(amount)} g`;
  if (ing.unit === 'ml') return amount >= 1000 ? `${num1.format(amount / 1000)} l` : `${Math.round(amount / 10) / 10} dl`;
  return `${num1.format(amount)} ${ing.label ?? 'stk'}`;
}

// The last day a price is valid. Tjek stores end times like 22:59 UTC (23:59 Danish
// time), so the local date is the day the offer is last valid.
export function untilLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `til ${d.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'numeric' })}`;
}

// Where a price comes from, in a few words.
export function sourceLabel(source, storesById) {
  const store = source.offer ? storesById[source.offer.store]?.name : null;
  switch (source.kind) {
    case 'tilbud': return `${store} · tilbud ${untilLabel(source.offer.until)}`;
    case 'fast': return `${store} · fast pris`;
    case 'hylde': return `${store} · hyldepris`;
    case 'reference': return `vejledende · ${store}`;
    default: return 'anslået pris';
  }
}

// Same information split for a compact box: where to buy it, and what kind of price it is.
export function sourceParts(source, storesById) {
  const store = source.offer ? storesById[source.offer.store]?.name : null;
  switch (source.kind) {
    case 'tilbud': {
      const day = new Date(source.offer.until).toLocaleDateString('da-DK', { weekday: 'short' });
      return { store, note: `tilbud til ${day}` };
    }
    case 'fast': return { store, note: 'fast pris' };
    case 'hylde': return { store, note: 'hyldepris' };
    case 'reference': return { store, note: 'vejledende' };
    default: return { store: null, note: 'anslået' };
  }
}

// "i dag kl. 10.15", "i går kl. 18.02" or "24.10 kl. 09.00"
export function updatedLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const time = d.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  const day = days === 0 ? 'i dag' : days === 1 ? 'i går' : d.toLocaleDateString('da-DK', { day: 'numeric', month: 'numeric' });
  return `${day} kl. ${time}`;
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
