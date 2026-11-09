import { DishArt } from './ui.jsx';
import { Chevron } from './icons.jsx';
import { priceDish, suggestions } from '../lib/pricing.js';
import { kr, krSmall, updatedLabel, andList } from '../lib/format.js';

export function WeekView({ data, plan, prefs, list, onOpen, onSuggest, onSwipe }) {
  const recipes = Object.fromEntries(data.recipes.map((r) => [r.id, r]));
  const days = plan.reduce((sum, i) => sum + i.days, 0);
  // Dishes that reuse what the week already buys, for one evening at the usual head count.
  const ideas = suggestions(data, plan, {
    stores: prefs.stores, atHome: prefs.atHome, people: prefs.people,
    filter: (r) => !prefs.diet || prefs.diet === 'alle' || r.diet === prefs.diet
  });

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
            <div className="summary-total">{kr(list.dishTotal)}</div>
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
              // Its part of the shared packs: two dishes with carrots share one bag and its price.
              const share = list.shares[item.id] ?? priceDish(data, recipe, { ...item, atHome: prefs.atHome, stores: prefs.stores }).total;
              return (
                <li key={item.id}>
                  <button type="button" className="week-item" onClick={() => onOpen(recipe, item)}>
                    <DishArt recipe={recipe} className="week-bg" />
                    <span className="week-shade" aria-hidden="true" />
                    <span className="week-text">
                      <span className="week-title">{recipe.title}</span>
                      <span className="muted small">
                        {item.days} {item.days === 1 ? 'dag' : 'dage'} · {item.people} pers.
                      </span>
                    </span>
                    <span className="week-price">{kr(share)}</span>
                    <Chevron size={18} className="muted" />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="muted small center">Retter, der bruger samme varer, deler pakkerne og prisen, så du ikke køber 4 agurker til 4 retter.</p>

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
