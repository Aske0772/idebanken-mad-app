import { DishArt } from './ui.jsx';
import { Chevron } from './icons.jsx';
import { priceDish } from '../lib/pricing.js';
import { kr, krSmall, updatedLabel } from '../lib/format.js';

export function WeekView({ data, plan, prefs, list, onOpen, onSwipe }) {
  const recipes = Object.fromEntries(data.recipes.map((r) => [r.id, r]));
  const days = plan.reduce((sum, i) => sum + i.days, 0);

  return (
    <div className="page">
      <header className="page-head">
        <h1>Ugen</h1>
        <span className="muted">{Math.min(days, 7)} af 7 aftener</span>
      </header>
      <div className="week-bar" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => <span key={i} className={i < days ? 'is-on' : ''} />)}
      </div>

      {plan.length === 0 ? (
        <div className="empty">
          <p>Ingen retter endnu.</p>
          <button type="button" className="primary" onClick={onSwipe}>Find ugens retter</button>
        </div>
      ) : (
        <>
          <div className="summary">
            <div className="summary-total">{kr(list.total)}</div>
            <div className="summary-sub">
              <strong>{krSmall(list.perMeal)}</strong> pr. person pr. måltid · {list.meals} måltider
            </div>
            <div className="summary-fresh">
              Priser opdateret {updatedLabel(data.refreshedAt)}
              {list.approx > 0 && ` · heraf ca. ${kr(list.approx)} vejledende`}
            </div>
          </div>
          <ul className="week-list">
            {plan.map((item) => {
              const recipe = recipes[item.recipeId];
              if (!recipe) return null;
              const p = priceDish(data, recipe, { ...item, atHome: prefs.atHome, stores: prefs.stores });
              return (
                <li key={item.id}>
                  <button type="button" className="week-item" onClick={() => onOpen(recipe, item)}>
                    <DishArt recipe={recipe} className="week-thumb" />
                    <span className="week-text">
                      <span className="week-title">{recipe.title}</span>
                      <span className="muted small">
                        {item.days} {item.days === 1 ? 'dag' : 'dage'} · {item.people} pers.
                      </span>
                    </span>
                    <span className="week-price">{kr(p.total)}</span>
                    <Chevron size={18} className="muted" />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="muted small center">Samlet pris deler varer mellem retterne, så den kan være lavere end summen.</p>
        </>
      )}
    </div>
  );
}
