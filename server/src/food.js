// Which avis offers are food? Tjek sends everything in an avis, also TVs, clothes
// and detergent, and has no category on an offer, so this is a word list. It is a
// heuristic: an odd non-food item can slip through and an odd food item can be
// missed. Shelf sources (REMA's food departments) are food by construction.
//
// An offer is food when it is not on the NOT_FOOD list and either matches one of
// our ingredients, names a food word, or is sold by weight or volume.

const L = 'a-zæøåäöü';
// Whole word: Danish letters count as word characters, which \b does not do.
const word = (s) => `(?<![${L}])(?:${s})(?![${L}])`;

const NOT_FOOD = new RegExp([
  // Pets and garden
  'foder', 'kattemad', 'hundemad', 'kattegrus', 'strøelse', 'godbid', 'kæledyr', 'tyggeben',
  'gødning', 'spagnum', 'pottemuld', word('jord'), 'blomster', 'buket', 'potteplante', 'orkidé',
  // Personal care and cleaning
  'shampoo', word('balsam'), 'hårbalsam', 'sæbe', 'tandpasta', 'tandbørste', 'deodorant', word('deo'), 'bodylotion',
  'ansigtscreme', 'håndcreme', 'dagcreme', 'natcreme', 'solcreme', 'parfume', 'makeup', 'mascara', 'neglelak', 'barber', 'bleer', 'vatpinde', 'plaster',
  'vaskemiddel', 'skyllemiddel', 'opvask', 'rengøring', 'toiletpapir', 'køkkenrulle', 'servietter',
  'kaffefilter', 'filterposer', 'affaldspose', 'frysepose', 'sølvpapir', 'bagepapir', 'vinduesvask', 'sprinklervæske', 'motorolie',
  // Household goods, tech and clothes
  'batteri', 'elpære', word('pære') + '\\s*(?:e27|e14|gu10|led)', 'lampe', word('tv'), 'fjernsyn', 'computer',
  'laptop', 'tablet', 'mobiltelefon', 'høretelefon', 'kabel', 'oplader', 'legetøj', 'lego', 'puslespil',
  word('spil'), 'konsol', 'playstation', 'nintendo', 'gavekort', 'stearinlys', 'fyrfadslys', 'grillkul',
  'tændvæske', word('tøj'), 'sengetøj', 't-shirt', 'bukser', 'jakke', 'sokker', 'strømper', word('sko'), 'støvler', 'trusser',
  'pyjamas', word('dyne'), 'håndklæde', word('gryde'), word('gryder'), 'stegepande', 'kniv', 'tallerken', 'værktøj',
  'boremaskine', 'cykel', word('maling'), word('bog'), 'bøger', 'magasin',
  // Not sold to everyone: alcohol and tobacco
  word('øl'), word('vin'), 'rødvin', 'hvidvin', 'rosévin', 'mousserende', 'champagne', 'cava', 'prosecco',
  'spiritus', 'vodka', 'whisky', word('gin'), word('rom'), 'likør', word('cider'), 'cigaret', 'tobak', word('snus')
].join('|'), 'i');

const FOOD = new RegExp([
  'mælk', 'fløde', 'fraiche', 'fraîche', word('ost'), 'oste', 'smør', 'yoghurt', 'skyr', word('æg'), 'brød', 'boller', 'kage',
  'wienerbrød', 'kiks', 'chips', 'slik', 'chokolade', word('is'), 'flødeis', 'kaffe', word('te'), 'juice',
  'saft', 'sodavand', 'cola', 'danskvand', 'kylling', 'okse', 'svine', 'hakket', 'bacon', 'pølse', 'skinke',
  'pålæg', 'leverpostej', 'fisk', 'laks', 'torsk', 'rejer', word('tun'), 'frugt', 'æble', 'banan',
  'appelsin', 'citron', 'kartof', word('løg'), 'tomat', 'agurk', 'salat', 'pasta', 'spaghetti', word('ris'),
  'nudler', word('mel'), 'sukker', 'müsli', 'mysli', 'havregryn', 'cornflakes', 'pizza', 'lasagne', 'suppe',
  'sauce', 'ketchup', 'mayonnaise', 'remoulade', 'sennep', 'dressing', 'krydderi', 'peber', word('salt'),
  'olie', 'eddike', 'bønner', 'majs', 'nødder', 'mandler', 'rosiner', 'honning', 'marmelade', 'syltetøj',
  'frost', 'færdigret', 'burger', 'nuggets', 'grønt', 'bær', 'jordbær', 'avocado', 'peberfrugt', 'gulerød'
].join('|'), 'i');

export function isFood(offer, { matched = false } = {}) {
  const text = offer.heading ?? '';
  if (!text || NOT_FOOD.test(text)) return false;
  if (matched || FOOD.test(text)) return true;
  const unit = offer.quantity?.unit;
  return unit === 'kg' || unit === 'l';
}
