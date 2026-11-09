import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isFood } from '../src/food.js';

const o = (heading, unit) => ({ heading, quantity: unit ? { unit, amount: 1 } : null });

test('food words and weight or volume make an offer food', () => {
  for (const h of ['Syltetøj', 'Creme fraiche 18%', 'Balsamico eddike', 'Toms chokolade', 'Æg 10 stk', 'Ostehaps']) {
    assert.equal(isFood(o(h)), true, h);
  }
  assert.equal(isFood(o('Kokosmælk', 'l')), true);
  assert.equal(isFood(o('Grydeklar kylling', 'kg')), true);
});

test('non-food, pet food, alcohol and tobacco are left out', () => {
  for (const [h, u] of [['Samsung TV 55"'], ['Ariel vaskemiddel', 'l'], ['Kattegrus 10 kg', 'kg'],
    ['Whiskas kattemad', 'kg'], ['Tuborg øl 24 x 33 cl', 'l'], ['Rødvin', 'l'], ['Sengetøj'], ['Pottemuld 50 l', 'l']]) {
    assert.equal(isFood(o(h, u)), false, h);
  }
});

test('an item without a food word or a weight is not food', () => {
  assert.equal(isFood(o('Gavepapir')), false);
});
