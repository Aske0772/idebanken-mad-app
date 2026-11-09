import { useLayoutEffect, useRef } from 'react';
import { DishArt } from './ui.jsx';
import { Chevron } from './icons.jsx';
import { priceDish, suggestions } from '../lib/pricing.js';
import { kr, krSmall, updatedLabel, andList } from '../lib/format.js';
import { layoutWeek, weekMonday, DAY_SHORT, DAY_NAMES } from '../lib/week.js';
import { useHoldDrag } from '../lib/useHoldDrag.js';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function WeekView({ data, plan, prefs, list, scroller, onOpen, onMove, onSuggest, onSwipe }) {
  const recipes = Object.fromEntries(data.recipes.map((r) => [r.id, r]));
  const { starts, unplaced } = layoutWeek(plan);
  const placed = plan.filter((p) => starts[p.id] != null);
  const taken = Array(7).fill(false);
  for (const p of placed) for (let d = starts[p.id]; d < starts[p.id] + p.days; d++) taken[d] = true;
  const evenings = taken.filter(Boolean).length;

  // Dates for the day labels, and which evening is tonight.
  const monday = weekMonday(data.week);
  const dates = Array.from({ length: 7 }, (_, i) => (monday ? new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i) : null));
  const now = new Date();
  const today = dates.findIndex((d) => d && d.toDateString() === now.toDateString());

  // Dishes that reuse what the week already buys, for one evening at the usual head count.
  const ideas = suggestions(data, plan, {
    stores: prefs.stores, atHome: prefs.atHome, people: prefs.people,
    filter: (r) => !prefs.diet || prefs.diet === 'alle' || r.diet === prefs.diet
  });

  const gridRef = useRef(null);
  const flipFrom = useRef(null);
  const dayAt = (y) => {
    const rows = [...(gridRef.current?.querySelectorAll('[data-day]') ?? [])].map((el) => el.getBoundingClientRect());
    if (!rows.length || y < rows[0].top - 48 || y > rows[6].bottom + 48) return null;
    const i = rows.findIndex((r) => y < r.bottom + 4);
    return i === -1 ? 6 : i;
  };
  // Measure every card before the move, then slide them from there to their new evening.
  const drop = (id, day) => {
    if (!reducedMotion()) {
      flipFrom.current = Object.fromEntries(
        [...gridRef.current.parentElement.querySelectorAll('[data-id]')].map((el) => [el.dataset.id, el.getBoundingClientRect()])
      );
    }
    onMove(id, day);
  };
  useLayoutEffect(() => {
    const from = flipFrom.current;
    flipFrom.current = null;
    if (!from || !gridRef.current) return;
    for (const el of gridRef.current.parentElement.querySelectorAll('[data-id]')) {
      const a = from[el.dataset.id];
      if (!a) continue;
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
      );
    }
  }, [plan]);

  const { drag, bind } = useHoldDrag({ scroller, dayAt, onDrop: drop });
  const target = drag?.target != null ? Math.max(0, Math.min(drag.target, 7 - drag.span)) : null;

  const card = (item, start) => {
    const recipe = recipes[item.recipeId];
    if (!recipe) return null;
    // Its part of the shared packs: two dishes with carrots share one bag and its price.
    const share = list.shares[item.id] ?? priceDish(data, recipe, { ...item, atHome: prefs.atHome, stores: prefs.stores }).total;
    const when = start == null
      ? `${item.days} ${item.days === 1 ? 'dag' : 'dage'}`
      : item.days === 1 ? DAY_NAMES[start] : `${DAY_SHORT[start]}–${DAY_SHORT[start + item.days - 1]}`;
    return (
      <button
        type="button" className="week-item" onClick={() => onOpen(recipe, item)}
        aria-label={`${recipe.title}, ${when}. Hold nede for at flytte.`}
      >
        <DishArt recipe={recipe} className="week-bg" />
        <span className="week-shade" aria-hidden="true" />
        <span className="week-text">
          <span className="week-title">{recipe.title}</span>
          <span className="muted small">{when} · {item.people} pers.</span>
        </span>
        <span className="week-price">{kr(share)}</span>
        <Chevron size={18} className="muted" />
      </button>
    );
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1>Ugen</h1>
        <span className="muted">{evenings} af 7 aftener</span>
      </header>
      <div className="week-bar" aria-hidden="true">
        {taken.map((on, i) => <span key={i} className={on ? 'is-on' : ''} />)}
      </div>

      {plan.length === 0 ? (
        <div className="empty">
          <p>Ingen retter endnu.</p>
          <button type="button" className="primary" onClick={onSwipe}>Find ugens retter</button>
        </div>
      ) : (
        <>
          <div className="summary">
            <div className="summary-total">{kr(list.dishTotal)}</div>
            <div className="summary-sub">
              <strong>{krSmall(list.perMeal)}</strong> pr. person pr. måltid · {list.meals} måltider
            </div>
            <div className="summary-fresh">
              Priser opdateret {updatedLabel(data.refreshedAt)}
              {list.approx > 0 && ` · heraf ca. ${kr(list.approx)} vejledende`}
            </div>
          </div>
          <div className={`week-grid ${drag ? 'is-dragging' : ''}`} ref={gridRef}>
            {DAY_SHORT.map((name, i) => (
              <div
                key={name} data-day={i} style={{ gridRow: i + 1 }}
                className={`week-day ${i === today ? 'is-today' : ''} ${target != null && i >= target && i < target + drag.span ? 'is-target' : ''}`}
              >
                <span>{name}</span>
                {dates[i] && <small>{i === today ? 'i dag' : `${dates[i].getDate()}.`}</small>}
              </div>
            ))}
            {taken.map((on, i) => !on && (
              <button key={`free-${i}`} type="button" className="week-free" style={{ gridRow: i + 1 }} onClick={onSwipe}>
                Ledig aften
              </button>
            ))}
            {target != null && (
              <div className="week-drop" style={{ gridRow: `${target + 1} / span ${drag.span}` }} aria-hidden="true" />
            )}
            {placed.map((item) => (
              <div key={item.id} className="week-slot" style={{ gridRow: `${starts[item.id] + 1} / span ${item.days}` }} {...bind(item.id, starts[item.id], item.days)}>
                {card(item, starts[item.id])}
              </div>
            ))}
          </div>
          {unplaced.length > 0 && (
            <section className="week-over" aria-label="Ikke plads i ugen">
              <h2 className="shop-group-title"><span>Ikke plads i ugen</span></h2>
              {unplaced.map((item) => (
                <div key={item.id} className="week-slot" {...bind(item.id, null, item.days)}>{card(item, null)}</div>
              ))}
              <p className="shop-group-hint">Træk en ret op på en aften, eller gør en anden ret kortere.</p>
            </section>
          )}
          <p className="muted small center">Hold en ret nede for at flytte den til en anden aften. Retter med samme varer deler pakkerne og prisen.</p>

          {ideas.length > 0 && (
            <section className="shop-group" aria-label="Brug det, du allerede har">
              <h2 className="shop-group-title"><span>Brug det, du allerede har</span></h2>
              <ul className="suggest-list">
                {ideas.map(({ recipe, shared, cost, perMeal }) => (
                  <li key={recipe.id}>
                    <button type="button" className="suggest-item" onClick={() => onSuggest(recipe)}>
                      <DishArt recipe={recipe} className="suggest-art" />
                      <span className="shop-text">
                        <span className="shop-name">{recipe.title}</span>
                        <span className="suggest-have">Du har allerede {andList(shared.map((id) => data.ingredients[id].name))}</span>
                      </span>
                      <span className="suggest-price">
                        <strong>{cost < 0.5 ? 'Gratis' : `+${kr(cost)}`}</strong>
                        <small>{krSmall(perMeal)} pr. portion</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="shop-group-hint">Prisen er det, retten lægger oveni ugens indkøb for {prefs.people} pers. én aften.</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
