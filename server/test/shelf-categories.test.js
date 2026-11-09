import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shelfCategory } from '../src/shelf-categories.js';

test('products land in a sensible aisle', () => {
  const cases = {
    'Mælkesnitte': 'snacks', 'Letmælk 1,5% fedt': 'mejeri', 'Grønne stenfri druer': 'gront', 'Lays chips': 'snacks',
    'Coca-Cola 1,5 l': 'drikke', 'Surdejsboller': 'brod', 'Frosne ærter': 'frost', 'Laksefilet': 'fisk',
    'Hakket grisekød 8-12%': 'kod', 'Havregryn': 'kolonial', 'Kaffe formalet': 'drikke'
  };
  for (const [title, cat] of Object.entries(cases)) assert.equal(shelfCategory(title), cat, title);
});

test('an ingredient decides the aisle', () => {
  assert.equal(shelfCategory('Asian Kitchen kokosmælk light', 'kokosmaelk'), 'kolonial');
  assert.equal(shelfCategory('Salt', 'salt'), 'kolonial'); // basisvarer are kolonial on the shelf
});
