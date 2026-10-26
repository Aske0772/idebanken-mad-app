import { useEffect, useMemo, useRef, useState } from 'react';
import { DishArt } from './ui.jsx';
import { X, Heart, Undo, Clock, Store } from './icons.jsx';
import { heroOffers, portionPrice } from '../lib/pricing.js';
import { krSmall } from '../lib/format.js';

const FILTERS = [
  { id: 'alle', label: 'Alle' },
  { id: 'kod', label: 'Kød' },
  { id: 'fisk', label: 'Fisk' },
  { id: 'vegetar', label: 'Vegetar' }
];

export function SwipeView({ data, prefs, setPrefs, seen, onSkip, onLike, onUndo, canUndo, onOpen, onStores, onReset }) {
  const storesById = useMemo(() => Object.fromEntries(data.stores.map((s) => [s.id, s])), [data]);

  // This week's deck: dishes with a hero ingredient on offer in the chosen stores,
  // cheapest portion first.
  const deck = useMemo(() => {
    return data.recipes
      .filter((r) => !seen.includes(r.id))
      .filter((r) => prefs.diet === 'alle' || r.diet === prefs.diet)
      .filter((r) => !prefs.quick || r.minutes <= 30)
      .map((r) => ({ recipe: r, heroes: heroOffers(data, r, prefs.stores), price: portionPrice(data, r, prefs.stores, prefs.people) }))
      .filter((x) => x.heroes.length > 0)
      .sort((a, b) => a.price - b.price);
  }, [data, prefs, seen]);

  const [fling, setFling] = useState(null);
  const top = deck[0];

  useEffect(() => {
    const onKey = (e) => {
      if (!top || document.querySelector('.sheet')) return;
      if (e.key === 'ArrowLeft') setFling({ id: top.recipe.id, dir: -1 });
      if (e.key === 'ArrowRight') setFling({ id: top.recipe.id, dir: 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [top]);

  const done = (recipe, dir) => {
    setFling(null);
    if (dir > 0) onLike(recipe);
    else onSkip(recipe);
  };

  return (
    <div className="swipe-view">
      <header className="topbar">
        <div className="brand">Mæt</div>
        <button type="button" className="pill" onClick={onStores}>
          <Store size={18} />
          {prefs.stores.length === 1 ? storesById[prefs.stores[0]]?.name : `${prefs.stores.length} butikker`}
        </button>
      </header>

      <div className="filters" role="toolbar" aria-label="Filtre">
        {FILTERS.map((f) => (
          <button
            key={f.id} type="button" className={`chip ${prefs.diet === f.id ? 'is-on' : ''}`}
            aria-pressed={prefs.diet === f.id} onClick={() => setPrefs((p) => ({ ...p, diet: f.id }))}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button" className={`chip ${prefs.quick ? 'is-on' : ''}`} aria-pressed={prefs.quick}
          onClick={() => setPrefs((p) => ({ ...p, quick: !p.quick }))}
        >
          ≤ 30 min
        </button>
      </div>

      <div className="deck">
        {deck.length === 0 && (
          <div className="deck-empty">
            <p className="deck-empty-title">Det var ugens retter</p>
            <p className="muted">Skift butikker eller filtre for at se flere.</p>
            {seen.length > 0 && (
              <button type="button" className="secondary" onClick={onReset}>Se de overspringte igen</button>
            )}
          </div>
        )}
        {deck.slice(0, 3).reverse().map((item) => {
          const depth = deck.indexOf(item);
          return (
            <SwipeCard
              key={item.recipe.id}
              depth={depth}
              fling={fling?.id === item.recipe.id ? fling.dir : 0}
              onSwiped={(dir) => done(item.recipe, dir)}
              onTap={() => onOpen(item.recipe)}
            >
              <DishArt recipe={item.recipe} className="card-art" />
              <div className="card-body">
                <h2 className="card-title">{item.recipe.title}</h2>
                <div className="card-meta">
                  <span><Clock size={16} /> {item.recipe.minutes} min</span>
                  <span className="card-price">{krSmall(item.price)}<small> /portion</small></span>
                </div>
                <div className="card-offers">
                  {uniqueHeroes(item.heroes).slice(0, 2).map(({ ingredientId, offer }) => (
                    <span className="offer-tag" key={ingredientId}>
                      <span className="store-dot" style={{ background: storesById[offer.store]?.color }} />
                      {data.ingredients[ingredientId].name} {krSmall(offer.price)}
                    </span>
                  ))}
                </div>
              </div>
            </SwipeCard>
          );
        })}
      </div>

      <div className="swipe-actions">
        <button type="button" className="round big nope" aria-label="Spring over" disabled={!top}
          onClick={() => top && setFling({ id: top.recipe.id, dir: -1 })}>
          <X size={28} />
        </button>
        <button type="button" className="round" aria-label="Fortryd" disabled={!canUndo} onClick={onUndo}>
          <Undo size={20} />
        </button>
        <button type="button" className="round big like" aria-label="Vil have" disabled={!top}
          onClick={() => top && setFling({ id: top.recipe.id, dir: 1 })}>
          <Heart size={28} />
        </button>
      </div>
    </div>
  );
}

// Cheapest offer per hero ingredient.
function uniqueHeroes(heroes) {
  const best = new Map();
  for (const h of heroes) {
    const cur = best.get(h.ingredientId);
    if (!cur || h.offer.price < cur.offer.price) best.set(h.ingredientId, h);
  }
  return [...best.values()];
}

const THRESHOLD = 110;

function SwipeCard({ children, depth, fling, onSwiped, onTap }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState(0);
  const start = useRef(null);
  // pointerup can fire before React re-renders a fast flick, so read the live offset from a ref.
  const offset = useRef({ x: 0, y: 0 });
  const isTop = depth === 0;

  const leave = (dir) => {
    setLeaving(dir);
    setTimeout(() => onSwiped(dir), 220);
  };

  useEffect(() => {
    if (fling && isTop) leave(fling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fling]);

  const onPointerDown = (e) => {
    if (!isTop || leaving) return;
    start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    offset.current = { x: 0, y: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    offset.current = { x: e.clientX - start.current.x, y: e.clientY - start.current.y };
    setDrag(offset.current);
  };
  const onPointerUp = (e) => {
    if (!start.current) return;
    if (e.type === 'pointerup') {
      offset.current = { x: e.clientX - start.current.x, y: e.clientY - start.current.y };
    }
    const { x: dx, y: dy } = offset.current;
    const velocity = dx / Math.max(performance.now() - start.current.t, 1);
    start.current = null;
    if (Math.abs(dx) > THRESHOLD || (Math.abs(dx) > 30 && Math.abs(velocity) > 0.7)) {
      setDrag(offset.current);
      leave(dx > 0 ? 1 : -1);
    } else {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) onTap();
      setDrag({ x: 0, y: 0 });
    }
  };

  const x = leaving ? leaving * window.innerWidth * 1.2 : drag.x;
  const rotate = x / 18;
  const style = isTop
    ? { transform: `translate(${x}px, ${leaving ? drag.y : drag.y * 0.3}px) rotate(${rotate}deg)` }
    : { transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04})` };
  const dragging = start.current != null;
  const like = Math.max(0, Math.min(1, x / THRESHOLD));
  const nope = Math.max(0, Math.min(1, -x / THRESHOLD));

  return (
    <div
      className={`card ${isTop ? 'is-top' : ''} ${dragging ? 'is-dragging' : ''}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-hidden={!isTop}
    >
      {children}
      {isTop && (
        <>
          <span className="stamp stamp--like" style={{ opacity: like }}>JA TAK</span>
          <span className="stamp stamp--nope" style={{ opacity: nope }}>NÆSTE</span>
        </>
      )}
    </div>
  );
}
