// Which aisle a product belongs in, for the category chips in "Tilføj vare".
// A product that is one of our ingredients takes that ingredient's category;
// everything else goes by words in its name, checked in this order (so
// "mælkesnitte" is a snack, not dairy, and frozen chicken is frost). It is a
// heuristic like the food filter: an odd product can land in the wrong aisle.
import { INGREDIENTS } from './ingredients.js';

export const SHELF_CATEGORIES = {
  gront: 'Frugt & grønt',
  kod: 'Kød',
  fisk: 'Fisk',
  mejeri: 'Mejeri & æg',
  brod: 'Brød',
  kolonial: 'Kolonial',
  frost: 'Frost',
  drikke: 'Drikke',
  snacks: 'Snacks & søde sager'
};

const L = 'a-zæøåäöü';
const word = (s) => `(?<![${L}])(?:${s})(?![${L}])`;
const rx = (parts) => new RegExp(parts.join('|'), 'i');

const RULES = [
  ['snacks', rx(['chips', 'slik', 'chokolade', 'kiks', 'småkage', 'vingummi', 'lakrids', 'bolsjer', 'popcorn',
    'snitte', 'pingui', 'kinder', 'marabou', 'haribo', 'karamel', 'flødebolle', 'nødder', 'peanuts', 'mandler', 'snack', 'dip'])],
  ['drikke', rx(['sodavand', word('cola'), 'juice', word('saft'), 'danskvand', 'kildevand', word('vand'), 'kaffe', word('te'),
    'kakaomælk', 'drikkeyoghurt', 'smoothie', 'energidrik', 'iste', 'lemonade', 'squash'])],
  ['frost', rx(['frost', 'frossen', 'frosne', 'dybfrost', word('is'), 'flødeis', 'pizza', 'pommes', 'nuggets'])],
  ['brod', rx(['brød', 'boller', 'bolle', 'rundstykke', 'stykker', 'toast', 'bagel', 'croissant', 'wienerbrød',
    'tortilla', 'pita', 'naan', 'knækbrød', 'kage', 'muffin', 'scones', 'baguette', 'flute'])],
  ['fisk', rx(['fisk', 'laks', 'torsk', 'rejer', word('tun'), 'sild', 'makrel', 'rødspætte', 'sej', 'kuller', 'krabbe', 'muslinger', 'kaviar'])],
  ['kod', rx(['kylling', 'okse', 'svine', 'grise', 'kalv', 'hakket', 'bacon', 'pølse', 'skinke', 'pålæg', 'frikadelle',
    'kalkun', word('lam'), 'lamme', 'medister', 'leverpostej', 'salami', 'spegepølse', 'kotelet', 'mørbrad', 'flæsk', 'bøf', 'and(?:ebryst|esteg)'])],
  ['mejeri', rx(['mælk', 'fløde', 'yoghurt', 'skyr', word('ost'), 'oste', 'smør', word('æg'), 'fraiche', 'fraîche',
    'kvark', 'hytteost', 'mozzarella', 'feta', 'parmesan', 'cheddar', 'margarine', 'kærne'])],
  ['gront', rx(['frugt', 'æble', 'banan', 'appelsin', 'mandarin', 'clementin', 'druer', 'citron', 'lime', 'kartof', word('løg'), 'rødløg',
    'tomat', 'agurk', 'salat', 'gulerød', 'kål', 'peberfrugt', 'avocado', 'bær', 'champignon', 'svampe', 'squash',
    'broccoli', 'blomkål', 'porre', word('pære'), 'pærer', 'melon', 'kiwi', 'mango', 'ananas', 'blomme', 'spinat',
    'rucola', 'krydderurt', 'persille', 'basilikum', 'ingefær', 'hvidløg', 'selleri', 'pastinak', 'rødbede', 'majs', 'ærter', 'bønner'])]
];

export function shelfCategory(title, ingredientId) {
  const cat = ingredientId ? INGREDIENTS[ingredientId]?.cat : null;
  if (cat && cat !== 'basis') return cat;
  for (const [id, test] of RULES) if (test.test(title ?? '')) return id;
  return 'kolonial';
}
