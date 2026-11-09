// Recipe library. Quantities are for `serves` people, in the ingredient's unit
// (see ingredients.js). `hero` lists the ingredients that make a dish worth
// suggesting: if one of them is on offer in a chosen store, the dish shows up.

export const RECIPES = [
  {
    id: 'spaghetti-bolognese',
    title: 'Spaghetti bolognese',
    blurb: 'Langtidssimret kødsauce med gulerod og et drys parmesan.',
    minutes: 40, diet: 'kod', serves: 4, emoji: '🍝', hue: 14,
    hero: ['hakket_okse'],
    ingredients: [
      ['hakket_okse', 500], ['loeg', 1], ['hvidloeg', 2], ['gulerod', 2],
      ['hakkede_tomater', 800], ['tomatpure', 70], ['pasta', 500], ['parmesan', 40],
      ['olie', 15], ['oregano', 2], ['bouillon', 1], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Hak løg og hvidløg, riv gulerødderne.',
      'Brun kødet i olie, tilsæt løg, hvidløg og gulerod.',
      'Rør tomatpuré, hakkede tomater, bouillon og oregano i. Simr 25 min.',
      'Kog pastaen. Smag saucen til med salt og peber.',
      'Server med revet parmesan.'
    ]
  },
  {
    id: 'kylling-i-karry',
    title: 'Kylling i karry',
    blurb: 'Mild, cremet karry med peberfrugt over ris.',
    minutes: 30, diet: 'kod', serves: 4, emoji: '🍛', hue: 42,
    hero: ['kyllingebryst'],
    ingredients: [
      ['kyllingebryst', 600], ['loeg', 1], ['peberfrugt', 1], ['flode', 250], ['ris', 300],
      ['karry', 8], ['olie', 15], ['bouillon', 1], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Sæt risene over.',
      'Skær kylling i tern, løg og peberfrugt i strimler.',
      'Steg kyllingen gylden, tilsæt løg og karry og rist et minut.',
      'Hæld fløde og knust bouillon ved, og simr 10 min med peberfrugten.',
      'Smag til og server over ris.'
    ]
  },
  {
    id: 'ovnlaks-kartofler',
    title: 'Ovnlaks med kartofler og broccoli',
    blurb: 'Laks i ovnen med citron, sprøde kartofler og dildcreme.',
    minutes: 35, diet: 'fisk', serves: 4, emoji: '🐟', hue: 8,
    hero: ['laks'],
    ingredients: [
      ['laks', 500], ['kartofler', 1000], ['broccoli', 1], ['citron', 1],
      ['creme_fraiche', 200], ['krydderurter', 1], ['olie', 30], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Skær kartofler i både, vend i olie og salt, og bag 30 min ved 220°.',
      'Læg laksen i et fad med citronskiver de sidste 15 min.',
      'Damp broccolien 4 min.',
      'Rør creme fraiche med hakket dild og lidt citronsaft.',
      'Server det hele med dildcremen.'
    ]
  },
  {
    id: 'tacos',
    title: 'Fredagstacos',
    blurb: 'Tortillas med krydret oksekød og alt det friske på bordet.',
    minutes: 25, diet: 'kod', serves: 4, emoji: '🌮', hue: 30,
    hero: ['hakket_okse', 'tortillas'],
    ingredients: [
      ['hakket_okse', 500], ['tacokrydderi', 28], ['tortillas', 8], ['salat', 150],
      ['tomater', 300], ['agurk', 1], ['majs', 300], ['revet_ost', 150],
      ['creme_fraiche', 200], ['olie', 15]
    ],
    steps: [
      'Brun kødet, rør tacokrydderi og en skvæt vand i, og lad det simre 5 min.',
      'Snit salat, tomat og agurk. Hæld majsene fra.',
      'Lun tortillas på en tør pande.',
      'Sæt det hele på bordet, så alle kan bygge selv.'
    ]
  },
  {
    id: 'frikadeller',
    title: 'Frikadeller med kartofler og agurkesalat',
    blurb: 'Klassiske frikadeller, nye kartofler og syrlig agurk.',
    minutes: 45, diet: 'kod', serves: 4, emoji: '🧆', hue: 26,
    hero: ['hakket_grisekalv'],
    ingredients: [
      ['hakket_grisekalv', 500], ['aeg', 1], ['loeg', 1], ['maelk', 100], ['kartofler', 1000],
      ['agurk', 1], ['hvedemel', 40], ['smor', 30], ['eddike', 50], ['sukker', 30],
      ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Rør fars med revet løg, æg, mel, mælk, salt og peber. Lad den hvile 15 min.',
      'Kog kartoflerne.',
      'Skær agurken tyndt og vend den i eddike, sukker og en knivspids salt.',
      'Form frikadeller med en ske og steg dem i smør, ca. 6 min på hver side.',
      'Server med kartofler og agurkesalat.'
    ]
  },
  {
    id: 'stegt-flaesk',
    title: 'Stegt flæsk med persillesovs',
    blurb: 'Danmarks nationalret – sprødt flæsk og en grøn sovs.',
    minutes: 40, diet: 'kod', serves: 4, emoji: '🥓', hue: 20,
    hero: ['flaesk'],
    ingredients: [
      ['flaesk', 800], ['kartofler', 1200], ['maelk', 500], ['krydderurter', 1],
      ['smor', 30], ['hvedemel', 30], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne.',
      'Steg flæsket sprødt på en pande eller i ovnen ved 200° i 25 min.',
      'Smelt smør, pisk mel i og spæd med mælk til en jævn sovs. Kog 5 min.',
      'Rør masser af hakket persille i og smag til.',
      'Server flæsk, kartofler og sovs.'
    ]
  },
  {
    id: 'koteletter-i-fad',
    title: 'Koteletter i fad',
    blurb: 'Koteletter i flødesauce med champignon og paprika.',
    minutes: 50, diet: 'kod', serves: 4, emoji: '🥩', hue: 18,
    hero: ['koteletter'],
    ingredients: [
      ['koteletter', 800], ['champignon', 250], ['flode', 250], ['loeg', 1], ['ris', 300],
      ['paprika', 5], ['olie', 15], ['bouillon', 1], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Brun koteletterne hurtigt på begge sider og læg dem i et fad.',
      'Steg løg og champignon, tilsæt paprika, fløde og bouillon.',
      'Hæld saucen over og bag 30 min ved 180°.',
      'Kog risene imens.'
    ]
  },
  {
    id: 'polsegryde',
    title: 'Pølsegryde',
    blurb: 'Børnenes favorit: pølser i tomatflødesauce med ris.',
    minutes: 25, diet: 'kod', serves: 4, emoji: '🌭', hue: 6,
    hero: ['polser'],
    ingredients: [
      ['polser', 500], ['loeg', 1], ['peberfrugt', 1], ['hakkede_tomater', 400],
      ['flode', 200], ['ris', 300], ['paprika', 5], ['olie', 15], ['salt', 2]
    ],
    steps: [
      'Sæt risene over.',
      'Skær pølser i skiver og steg dem med løg og peberfrugt.',
      'Tilsæt paprika, hakkede tomater og fløde. Simr 10 min.',
      'Server over ris.'
    ]
  },
  {
    id: 'medister-spidskaal',
    title: 'Medister med stuvet spidskål',
    blurb: 'Gammeldags hverdagsmad, der altid smager af mere.',
    minutes: 40, diet: 'kod', serves: 4, emoji: '🥬', hue: 90,
    hero: ['medister', 'hvidkaal'],
    ingredients: [
      ['medister', 600], ['kartofler', 1000], ['hvidkaal', 1], ['maelk', 400],
      ['smor', 30], ['hvedemel', 30], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Steg medisteren ved middel varme i ca. 20 min, vend den undervejs.',
      'Kog kartoflerne.',
      'Snit kålen og kog den 3 min. Hæld vandet fra.',
      'Lav en hvid sovs af smør, mel og mælk og vend kålen i. Smag til med salt og peber.'
    ]
  },
  {
    id: 'kyllingelaar-ovn',
    title: 'Kyllingelår i ovn med rodfrugter',
    blurb: 'Én bradepande, nul stress. Sprødt skind og søde gulerødder.',
    minutes: 55, diet: 'kod', serves: 4, emoji: '🍗', hue: 34,
    hero: ['kyllingelaar'],
    ingredients: [
      ['kyllingelaar', 1000], ['kartofler', 1000], ['gulerod', 4], ['loeg', 2], ['hvidloeg', 4],
      ['olie', 30], ['timian', 2], ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Skær kartofler, gulerødder og løg i grove stykker.',
      'Vend grøntsagerne i olie, timian, salt og peber på en bradepande.',
      'Læg kyllingelårene ovenpå med hele hvidløgsfed.',
      'Bag 45 min ved 200°, til skindet er sprødt.'
    ]
  },
  {
    id: 'kylling-wok',
    title: 'Wok med kylling og nudler',
    blurb: 'Hurtig wok med ingefær, soja og knas.',
    minutes: 20, diet: 'kod', serves: 4, emoji: '🍜', hue: 40,
    hero: ['kyllingebryst', 'nudler', 'frost_gront'],
    ingredients: [
      ['kyllingebryst', 500], ['nudler', 250], ['frost_gront', 500], ['forarsloeg', 1],
      ['ingefaer', 20], ['hvidloeg', 2], ['soja', 60], ['honning', 15], ['olie', 30]
    ],
    steps: [
      'Kog nudlerne efter anvisningen.',
      'Skær kyllingen i strimler og steg den ved høj varme.',
      'Tilsæt revet ingefær, hvidløg og grøntsagerne. Wok 4 min.',
      'Vend nudler, soja og honning i. Top med forårsløg.'
    ]
  },
  {
    id: 'thai-karry',
    title: 'Rød thaikarry',
    blurb: 'Kokos, lime og varme. Klar på under en halv time.',
    minutes: 25, diet: 'kod', serves: 4, emoji: '🥘', hue: 2,
    hero: ['kyllingebryst', 'kokosmaelk'],
    ingredients: [
      ['kyllingebryst', 500], ['kokosmaelk', 400], ['karrypasta', 50], ['peberfrugt', 1],
      ['squash', 1], ['ris', 300], ['lime', 1], ['krydderurter', 1], ['olie', 15], ['soja', 15]
    ],
    steps: [
      'Sæt risene over.',
      'Rist karrypastaen i olie et minut, tilsæt kylling i tern.',
      'Hæld kokosmælk ved og tilsæt peberfrugt og squash. Simr 10 min.',
      'Smag til med soja og limesaft. Top med koriander.'
    ]
  },
  {
    id: 'torsk-persillesmor',
    title: 'Torsk med citron og grønne bønner',
    blurb: 'Let, hvid fisk stegt i smør med friske krydderurter.',
    minutes: 25, diet: 'fisk', serves: 4, emoji: '🐠', hue: 200,
    hero: ['hvid_fisk'],
    ingredients: [
      ['hvid_fisk', 600], ['kartofler', 1000], ['groenne_bonner', 300], ['citron', 1],
      ['krydderurter', 1], ['smor', 40], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne.',
      'Krydr fisken med salt og peber og steg den i smør 3 min på hver side.',
      'Kog bønnerne 3 min.',
      'Rør hakkede krydderurter og citronskal i resten af smørret og hæld over fisken.'
    ]
  },
  {
    id: 'fiskepinde',
    title: 'Fiskepinde med kartoffelbåde',
    blurb: 'Sprødt, nemt og elsket af alle under 10 år.',
    minutes: 30, diet: 'fisk', serves: 4, emoji: '🐡', hue: 48,
    hero: ['fiskepinde'],
    ingredients: [
      ['fiskepinde', 500], ['kartofler', 1000], ['aerter', 300], ['citron', 1],
      ['olie', 30], ['salt', 4]
    ],
    steps: [
      'Skær kartofler i både, vend i olie og salt, bag 30 min ved 220°.',
      'Bag fiskepindene de sidste 15 min.',
      'Kog ærterne 2 min.',
      'Server med citronbåde.'
    ]
  },
  {
    id: 'laks-teriyaki',
    title: 'Laks teriyaki med ris',
    blurb: 'Blank, sød-salt glaze på laks med broccoli.',
    minutes: 25, diet: 'fisk', serves: 4, emoji: '🍣', hue: 12,
    hero: ['laks'],
    ingredients: [
      ['laks', 500], ['ris', 300], ['broccoli', 1], ['forarsloeg', 1], ['ingefaer', 15],
      ['soja', 60], ['honning', 30], ['olie', 15]
    ],
    steps: [
      'Sæt risene over.',
      'Rør soja, honning og revet ingefær sammen.',
      'Steg laksen 3 min på hver side, hæld saucen ved og lad den koge ind til glaze.',
      'Damp broccolien. Top med forårsløg.'
    ]
  },
  {
    id: 'lasagne',
    title: 'Lasagne',
    blurb: 'Lag på lag af kødsauce, bechamel og gylden ost.',
    minutes: 75, diet: 'kod', serves: 4, emoji: '🫕', hue: 10,
    hero: ['hakket_okse', 'lasagneplader'],
    ingredients: [
      ['hakket_okse', 500], ['loeg', 1], ['hvidloeg', 2], ['gulerod', 2],
      ['hakkede_tomater', 800], ['lasagneplader', 250], ['maelk', 600], ['revet_ost', 150],
      ['smor', 40], ['hvedemel', 40], ['oregano', 2], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Lav en kødsauce af kød, løg, hvidløg, gulerod og tomater. Simr 20 min.',
      'Lav bechamel: smelt smør, pisk mel i, spæd med mælk og kog 5 min.',
      'Læg lag af sauce, plader og bechamel i et fad. Slut med bechamel og ost.',
      'Bag 40 min ved 200°.'
    ]
  },
  {
    id: 'chili-sin-carne',
    title: 'Chili sin carne',
    blurb: 'Bønner, majs og røget paprika. Mætter uden kød.',
    minutes: 35, diet: 'vegetar', serves: 4, emoji: '🌶️', hue: 0,
    hero: ['bonner', 'hakkede_tomater'],
    ingredients: [
      ['bonner', 800], ['hakkede_tomater', 800], ['loeg', 1], ['hvidloeg', 2],
      ['peberfrugt', 2], ['majs', 300], ['ris', 300], ['creme_fraiche', 200],
      ['spidskommen', 4], ['paprika', 5], ['chili', 1], ['olie', 15], ['salt', 4]
    ],
    steps: [
      'Sæt risene over.',
      'Svits løg, hvidløg og peberfrugt med krydderierne.',
      'Tilsæt tomater, bønner og majs. Simr 20 min.',
      'Server med ris og en klat creme fraiche.'
    ]
  },
  {
    id: 'chili-con-carne',
    title: 'Chili con carne',
    blurb: 'Krydret oksekød og bønner – god til to dage.',
    minutes: 40, diet: 'kod', serves: 4, emoji: '🫘', hue: 4,
    hero: ['hakket_okse'],
    ingredients: [
      ['hakket_okse', 500], ['bonner', 400], ['hakkede_tomater', 800], ['loeg', 1],
      ['hvidloeg', 2], ['peberfrugt', 1], ['ris', 300], ['creme_fraiche', 200],
      ['spidskommen', 4], ['chili', 1], ['olie', 15], ['salt', 4]
    ],
    steps: [
      'Brun kødet med løg, hvidløg og krydderier.',
      'Tilsæt peberfrugt, tomater og bønner. Simr 25 min.',
      'Kog risene.',
      'Server med creme fraiche.'
    ]
  },
  {
    id: 'carbonara',
    title: 'Pasta carbonara',
    blurb: 'Æg, bacon og parmesan. Fem ingredienser, femten minutter.',
    minutes: 15, diet: 'kod', serves: 4, emoji: '🥚', hue: 50,
    hero: ['bacon'],
    ingredients: [
      ['bacon', 200], ['pasta', 500], ['aeg', 4], ['parmesan', 60], ['peber', 2], ['salt', 4]
    ],
    steps: [
      'Kog pastaen i godt saltet vand.',
      'Steg baconen sprød.',
      'Pisk æg med revet parmesan og masser af peber.',
      'Vend den varme pasta i bacon, tag panden af varmen og rør æggemassen i med lidt pastavand.'
    ]
  },
  {
    id: 'pesto-kylling-pasta',
    title: 'Pasta med pesto og kylling',
    blurb: 'Grøn pesto, saftig kylling og søde tomater.',
    minutes: 20, diet: 'kod', serves: 4, emoji: '🌿', hue: 110,
    hero: ['kyllingebryst', 'pesto'],
    ingredients: [
      ['kyllingebryst', 400], ['pasta', 500], ['pesto', 190], ['tomater', 250],
      ['spinat', 100], ['parmesan', 30], ['olie', 15], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog pastaen.',
      'Steg kyllingen i strimler.',
      'Vend pasta, pesto, kylling, halverede tomater og spinat sammen.',
      'Top med parmesan.'
    ]
  },
  {
    id: 'kikaertecurry',
    title: 'Kikærtecurry med spinat',
    blurb: 'Varm, cremet og helt plantebaseret.',
    minutes: 25, diet: 'vegetar', serves: 4, emoji: '🍲', hue: 36,
    hero: ['kikaerter', 'kokosmaelk', 'spinat'],
    ingredients: [
      ['kikaerter', 800], ['kokosmaelk', 400], ['hakkede_tomater', 400], ['spinat', 200],
      ['loeg', 1], ['hvidloeg', 2], ['ingefaer', 20], ['ris', 300],
      ['karry', 10], ['olie', 15], ['salt', 4]
    ],
    steps: [
      'Sæt risene over.',
      'Svits løg, hvidløg og ingefær med karry.',
      'Tilsæt kikærter, tomater og kokosmælk. Simr 12 min.',
      'Vend spinaten i lige før servering.'
    ]
  },
  {
    id: 'linse-dahl',
    title: 'Rød linsedahl',
    blurb: 'Silkeblød dahl med lime. Billig, mættende, god.',
    minutes: 30, diet: 'vegetar', serves: 4, emoji: '🥣', hue: 28,
    hero: ['linser'],
    ingredients: [
      ['linser', 300], ['kokosmaelk', 400], ['hakkede_tomater', 400], ['loeg', 1],
      ['hvidloeg', 2], ['ingefaer', 20], ['ris', 300], ['lime', 1],
      ['karry', 8], ['spidskommen', 3], ['olie', 15], ['salt', 4]
    ],
    steps: [
      'Svits løg, hvidløg, ingefær og krydderier.',
      'Tilsæt skyllede linser, tomater, kokosmælk og 4 dl vand. Simr 20 min.',
      'Kog risene.',
      'Smag dahlen til med limesaft og salt.'
    ]
  },
  {
    id: 'frittata',
    title: 'Frittata med kartofler og feta',
    blurb: 'Ovnbagt æggekage med spinat og salt feta.',
    minutes: 30, diet: 'vegetar', serves: 4, emoji: '🍳', hue: 52,
    hero: ['aeg', 'feta'],
    ingredients: [
      ['aeg', 8], ['kartofler', 600], ['spinat', 150], ['loeg', 1], ['feta', 150],
      ['salat', 150], ['olie', 15], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne og skær dem i skiver.',
      'Steg løg og kartofler i en ovnfast pande, tilsæt spinat.',
      'Hæld sammenpiskede æg over og smuldr feta på.',
      'Bag 15 min ved 200°. Server med salat.'
    ]
  },
  {
    id: 'hjemmelavet-pizza',
    title: 'Hjemmelavet pizza',
    blurb: 'Tynd bund, tomat, mozzarella og det grønne, I har lyst til.',
    minutes: 30, diet: 'vegetar', serves: 4, emoji: '🍕', hue: 16,
    hero: ['pizzadej', 'mozzarella'],
    ingredients: [
      ['pizzadej', 800], ['hakkede_tomater', 400], ['mozzarella', 250], ['champignon', 200],
      ['peberfrugt', 1], ['oregano', 2], ['olie', 15], ['salt', 2]
    ],
    steps: [
      'Varm ovnen op til 250°.',
      'Rul dejen ud og smør tynde lag tomat på, krydret med oregano og salt.',
      'Fordel champignon, peberfrugt og revet mozzarella.',
      'Bag 10–12 min til bunden er sprød.'
    ]
  },
  {
    id: 'burgere',
    title: 'Hjemmelavede burgere',
    blurb: 'Saftige bøffer, briochebolle og ovnfritter.',
    minutes: 35, diet: 'kod', serves: 4, emoji: '🍔', hue: 24,
    hero: ['hakket_okse', 'burgerboller'],
    ingredients: [
      ['hakket_okse', 500], ['burgerboller', 4], ['salat', 100], ['tomater', 250], ['loeg', 1],
      ['kartofler', 800], ['olie', 30], ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Skær kartofler i stave, vend i olie og salt og bag 30 min ved 220°.',
      'Form 4 bøffer og krydr dem godt.',
      'Steg bøfferne 3–4 min på hver side og rist bollerne.',
      'Byg burgerne med salat, tomat og løg.'
    ]
  },
  {
    id: 'kylling-pita',
    title: 'Pita med kylling og tzatziki',
    blurb: 'Krydret kylling, sprødt grønt og kølig yoghurtsauce.',
    minutes: 25, diet: 'kod', serves: 4, emoji: '🥙', hue: 38,
    hero: ['kyllingebryst', 'pita'],
    ingredients: [
      ['kyllingebryst', 500], ['pita', 8], ['salat', 150], ['tomater', 250], ['agurk', 1],
      ['yoghurt', 300], ['hvidloeg', 1], ['paprika', 4], ['spidskommen', 2],
      ['olie', 15], ['salt', 4]
    ],
    steps: [
      'Skær kyllingen i strimler og vend den i paprika, spidskommen og salt.',
      'Riv halvdelen af agurken og rør den i yoghurt med presset hvidløg.',
      'Steg kyllingen og lun pitabrødene.',
      'Fyld pitaerne med salat, tomat, agurk, kylling og tzatziki.'
    ]
  },
  {
    id: 'morbradgryde',
    title: 'Mørbradgryde',
    blurb: 'Mørt svinekød i flødesauce med svampe.',
    minutes: 30, diet: 'kod', serves: 4, emoji: '🍄', hue: 22,
    hero: ['svinemorbrad'],
    ingredients: [
      ['svinemorbrad', 600], ['champignon', 250], ['flode', 250], ['loeg', 1], ['ris', 300],
      ['paprika', 5], ['olie', 15], ['bouillon', 1], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Sæt risene over.',
      'Skær mørbraden i medaljoner og brun dem.',
      'Steg løg og svampe, tilsæt paprika, fløde og bouillon.',
      'Læg kødet tilbage og simr 10 min.'
    ]
  },
  {
    id: 'hel-kylling',
    title: 'Hel kylling i ovn',
    blurb: 'Søndagsfølelse en tirsdag. Citron, hvidløg og sprødt skind.',
    minutes: 80, diet: 'kod', serves: 4, emoji: '🐔', hue: 44,
    hero: ['hel_kylling'],
    ingredients: [
      ['hel_kylling', 1400], ['kartofler', 1000], ['citron', 1], ['hvidloeg', 4], ['salat', 150],
      ['olie', 30], ['timian', 2], ['salt', 6], ['peber', 1]
    ],
    steps: [
      'Fyld kyllingen med citron og hvidløg. Gnid den med olie, salt og timian.',
      'Læg kartofler omkring den i bradepanden.',
      'Steg 70 min ved 200°, til saften er klar.',
      'Lad den hvile 10 min og server med salat.'
    ]
  },
  {
    id: 'stroganoff',
    title: 'Bøf stroganoff',
    blurb: 'Oksestrimler i paprika-fløde med svampe.',
    minutes: 25, diet: 'kod', serves: 4, emoji: '🥘', hue: 16,
    hero: ['oksestrimler'],
    ingredients: [
      ['oksestrimler', 500], ['champignon', 250], ['loeg', 1], ['creme_fraiche', 200],
      ['tomatpure', 30], ['ris', 300], ['paprika', 6], ['olie', 15], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Sæt risene over.',
      'Steg kødet ved høj varme i små portioner. Tag det af panden.',
      'Steg løg og svampe, tilsæt paprika og tomatpuré.',
      'Rør creme fraiche i, vend kødet tilbage og varm igennem.'
    ]
  },
  {
    id: 'kylling-bowl',
    title: 'Kyllingebowl med avocado',
    blurb: 'Ris, kylling, avocado og sprødt grønt med lime.',
    minutes: 25, diet: 'kod', serves: 4, emoji: '🥗', hue: 120,
    hero: ['kyllingebryst', 'avocado'],
    ingredients: [
      ['kyllingebryst', 500], ['ris', 300], ['avocado', 2], ['agurk', 1], ['majs', 300],
      ['lime', 1], ['forarsloeg', 1], ['soja', 30], ['olie', 15], ['salt', 2]
    ],
    steps: [
      'Kog risene.',
      'Steg kyllingen og skær den i skiver.',
      'Skær avocado og agurk i tern.',
      'Saml skålene og dryp med soja og lime.'
    ]
  },
  {
    id: 'tun-pasta',
    title: 'Pasta med tun og tomat',
    blurb: 'Fra skabet til bordet på et kvarter.',
    minutes: 15, diet: 'fisk', serves: 4, emoji: '🐟', hue: 196,
    hero: ['tun'],
    ingredients: [
      ['tun', 300], ['pasta', 500], ['hakkede_tomater', 400], ['loeg', 1], ['hvidloeg', 2],
      ['krydderurter', 1], ['olie', 15], ['chili', 1], ['salt', 4]
    ],
    steps: [
      'Kog pastaen.',
      'Svits løg, hvidløg og chili, tilsæt tomater og simr 8 min.',
      'Vend tunen i saucen.',
      'Bland med pastaen og top med persille.'
    ]
  },
  {
    id: 'sod-sur-kodboller',
    title: 'Kødboller i sød-sur sauce',
    blurb: 'Små kødboller med peberfrugt i blank sauce.',
    minutes: 35, diet: 'kod', serves: 4, emoji: '🍡', hue: 356,
    hero: ['hakket_svin'],
    ingredients: [
      ['hakket_svin', 500], ['aeg', 1], ['ris', 300], ['peberfrugt', 2], ['loeg', 1],
      ['tomatpure', 70], ['sukker', 40], ['eddike', 40], ['soja', 30], ['olie', 15], ['salt', 3]
    ],
    steps: [
      'Rør farsen med æg og salt og rul små kødboller.',
      'Steg kødbollerne gyldne. Kog risene.',
      'Steg løg og peberfrugt, tilsæt tomatpuré, sukker, eddike, soja og 2 dl vand.',
      'Kog saucen tyk og vend kødbollerne i.'
    ]
  },
  {
    id: 'kyllingefrikadeller',
    title: 'Kyllingefrikadeller med ovnkartofler',
    blurb: 'Lette frikadeller og en kølig tzatziki.',
    minutes: 40, diet: 'kod', serves: 4, emoji: '🍽️', hue: 60,
    hero: ['hakket_kylling'],
    ingredients: [
      ['hakket_kylling', 500], ['aeg', 1], ['loeg', 1], ['kartofler', 1000], ['yoghurt', 300],
      ['agurk', 1], ['hvidloeg', 1], ['hvedemel', 30], ['olie', 30], ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Bag kartofler i både med olie og salt, 30 min ved 220°.',
      'Rør farsen med revet løg, æg, mel, salt og peber.',
      'Steg frikadellerne 5 min på hver side.',
      'Rør tzatziki af yoghurt, revet agurk og hvidløg.'
    ]
  },
  {
    id: 'sode-kartofler-feta',
    title: 'Søde kartofler med feta og kikærter',
    blurb: 'Ovnbagte søde kartofler, sprøde kikærter og yoghurt.',
    minutes: 40, diet: 'vegetar', serves: 4, emoji: '🍠', hue: 24,
    hero: ['sode_kartofler'],
    ingredients: [
      ['sode_kartofler', 1000], ['kikaerter', 400], ['feta', 200], ['spinat', 100], ['loeg', 1],
      ['yoghurt', 200], ['spidskommen', 3], ['olie', 30], ['salt', 4]
    ],
    steps: [
      'Skær søde kartofler i tern og vend dem med kikærter, olie, spidskommen og salt.',
      'Bag 30 min ved 220°.',
      'Vend med spinat, rødløg i tynde ringe og smuldret feta.',
      'Server med en klat yoghurt.'
    ]
  },
  {
    id: 'champignonrisotto',
    title: 'Champignonrisotto',
    blurb: 'Cremet risotto med ristede svampe og parmesan.',
    minutes: 35, diet: 'vegetar', serves: 4, emoji: '🍚', hue: 32,
    hero: ['champignon'],
    ingredients: [
      ['ris', 350], ['champignon', 400], ['loeg', 1], ['hvidloeg', 2], ['parmesan', 80],
      ['bouillon', 2], ['smor', 40], ['olie', 15], ['salt', 2], ['peber', 1]
    ],
    steps: [
      'Steg svampene gyldne og tag halvdelen fra til pynt.',
      'Svits løg, hvidløg og ris, og tilsæt varm bouillon lidt ad gangen under omrøring i 18 min.',
      'Rør smør og revet parmesan i.',
      'Top med de ristede svampe.'
    ]
  },
  // --- Omgang 1 (november 2026): danske klassikere og hverdagsretter ---
  {
    id: 'boller-i-karry',
    title: 'Boller i karry',
    blurb: 'Bløde kødboller i mild karrysovs med porre, serveret med ris.',
    minutes: 45, diet: 'kod', serves: 4, emoji: '🍛', hue: 46,
    hero: ['hakket_grisekalv'],
    ingredients: [
      ['hakket_grisekalv', 500], ['loeg', 2], ['aeg', 1], ['hvedemel', 70], ['maelk', 400], ['porre', 1],
      ['karry', 10], ['smor', 30], ['bouillon', 2], ['ris', 300], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Rør farsen med 1 revet løg, æg, 2 spsk mel, salt og peber.',
      'Kog 1 liter vand med 1 bouillonterning, sæt små boller i med en ske og kog dem 8 min. Gem kogevandet.',
      'Sæt risene over.',
      'Svits det andet løg og porren i smør med karryen, rør resten af melet i og jævn med mælk og 3 dl kogevand.',
      'Simr sovsen 5 min, læg bollerne i og smag til.'
    ]
  },
  {
    id: 'hakkeboef-bloede-loeg',
    title: 'Hakkebøf med bløde løg',
    blurb: 'Saftige bøffer med brune løg, kogte kartofler og brun sovs.',
    minutes: 35, diet: 'kod', serves: 4, emoji: '🥩', hue: 24,
    hero: ['hakket_okse'],
    ingredients: [
      ['hakket_okse', 600], ['loeg', 4], ['kartofler', 1000], ['smor', 40], ['hvedemel', 20],
      ['bouillon', 1], ['agurk', 1], ['salt', 4], ['peber', 2]
    ],
    steps: [
      'Kog kartoflerne.',
      'Form 4 bøffer, krydr med salt og peber.',
      'Skær løgene i skiver og steg dem bløde og gyldne i halvdelen af smørret. Tag dem af panden.',
      'Steg bøfferne 3-4 min på hver side. Rør mel og 3 dl vand med bouillon i stegefedtet til en sovs.',
      'Server med løg, kartofler, sovs og agurkeskiver.'
    ]
  },
  {
    id: 'karbonader-aerter-gulerod',
    title: 'Karbonader med ærter og gulerødder',
    blurb: 'Paneret hakket svinekød med smørstuvede ærter og gulerødder.',
    minutes: 40, diet: 'kod', serves: 4, emoji: '🍽️', hue: 36,
    hero: ['hakket_svin'],
    ingredients: [
      ['hakket_svin', 600], ['aeg', 1], ['rasp', 80], ['kartofler', 1000], ['aerter', 300], ['gulerod', 4],
      ['smor', 50], ['hvedemel', 20], ['maelk', 300], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne. Form farsen til 8 flade karbonader.',
      'Vend dem i pisket æg og derefter i rasp.',
      'Steg dem 4-5 min på hver side i smør.',
      'Kog gulerodstern og ærter 4 min. Lav en jævning af smør, mel og mælk, og vend grøntsagerne i.',
      'Server karbonaderne med kartofler og stuvningen.'
    ]
  },
  {
    id: 'millionboef-mos',
    title: 'Millionbøf med kartoffelmos',
    blurb: 'Hakket oksekød i tomat og løg, stuvet over cremet kartoffelmos.',
    minutes: 35, diet: 'kod', serves: 4, emoji: '🥔', hue: 18,
    hero: ['hakket_okse'],
    ingredients: [
      ['hakket_okse', 500], ['loeg', 2], ['tomatpure', 70], ['bouillon', 1], ['hvedemel', 15],
      ['kartofler', 1200], ['maelk', 200], ['smor', 30], ['paprika', 3], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne møre.',
      'Brun kødet med hakket løg og paprika.',
      'Rør tomatpuré og mel i, og tilsæt 4 dl vand med bouillon. Simr 15 min.',
      'Mos kartoflerne med varm mælk og smør, og smag til med salt.',
      'Server millionbøffen over mosen.'
    ]
  },
  {
    id: 'gullasch',
    title: 'Gullasch',
    blurb: 'Mørt oksekød simret med paprika, peberfrugt og tomat.',
    minutes: 120, diet: 'kod', serves: 4, emoji: '🍲', hue: 8,
    hero: ['oksekod_tern'],
    ingredients: [
      ['oksekod_tern', 700], ['loeg', 2], ['hvidloeg', 2], ['peberfrugt', 2], ['hakkede_tomater', 400],
      ['tomatpure', 70], ['paprika', 15], ['bouillon', 1], ['kartofler', 1000], ['olie', 20], ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Brun kødet i olie i portioner.',
      'Tilsæt hakket løg og hvidløg, og rør paprika og tomatpuré i.',
      'Hæld hakkede tomater og 5 dl vand med bouillon på. Læg låg på og simr 1½ time.',
      'Tilsæt peberfrugt i strimler de sidste 20 min. Kog imens kartoflerne.',
      'Smag til og server gullaschen med kartofler.'
    ]
  },
  {
    id: 'kylling-i-fad-citron',
    title: 'Kylling i fad med citron og kartofler',
    blurb: 'Kyllingelår og kartofler bagt sprøde med citron, hvidløg og timian.',
    minutes: 55, diet: 'kod', serves: 4, emoji: '🍋', hue: 52,
    hero: ['kyllingelaar'],
    ingredients: [
      ['kyllingelaar', 1000], ['kartofler', 1000], ['citron', 1], ['hvidloeg', 4], ['loeg', 2],
      ['timian', 3], ['olie', 30], ['salat', 150], ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Tænd ovnen på 200 °C.',
      'Skær kartofler i både og løg i kvarte. Vend dem med olie, timian, salt og peber i et fad.',
      'Læg kyllingelårene ovenpå med hvidløg og citronbåde.',
      'Bag i 45 min, til skindet er sprødt.',
      'Server med en grøn salat.'
    ]
  },
  {
    id: 'pastasalat-kylling-pesto',
    title: 'Pastasalat med kylling og pesto',
    blurb: 'Lun pasta vendt med pesto, stegt kylling, tomat og salat.',
    minutes: 25, diet: 'kod', serves: 4, emoji: '🥗', hue: 96,
    hero: ['kyllingebryst'],
    ingredients: [
      ['kyllingebryst', 500], ['pasta', 400], ['pesto', 190], ['tomater', 300], ['salat', 150],
      ['parmesan', 40], ['olie', 15], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Kog pastaen og skyl den kort i koldt vand.',
      'Steg kyllingen i strimler i olie, og krydr med salt og peber.',
      'Vend pastaen med pesto.',
      'Bland kylling, tomater i kvarte og salat i.',
      'Drys med revet parmesan.'
    ]
  },
  {
    id: 'biksemad',
    title: 'Biksemad',
    blurb: 'Brunede kartofler, løg og pølser med spejlæg og rødbeder.',
    minutes: 35, diet: 'kod', serves: 4, emoji: '🍳', hue: 30,
    hero: ['polser'],
    ingredients: [
      ['kartofler', 1000], ['polser', 400], ['loeg', 2], ['aeg', 4], ['rodbeder', 300],
      ['smor', 40], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne og lad dem køle lidt af. Skær dem i tern.',
      'Skær pølser i skiver og løg i tern.',
      'Brun kartoflerne i smør, tilsæt løg og pølser, og steg til alt er gyldent.',
      'Steg spejlæg.',
      'Server biksemaden med æg og rødbeder.'
    ]
  },
  {
    id: 'kylling-tikka-masala',
    title: 'Kylling tikka masala',
    blurb: 'Yoghurtmarineret kylling i krydret tomat- og flødesauce.',
    minutes: 40, diet: 'kod', serves: 4, emoji: '🍛', hue: 20,
    hero: ['kyllingebryst'],
    ingredients: [
      ['kyllingebryst', 600], ['yoghurt', 150], ['loeg', 1], ['hvidloeg', 3], ['ingefaer', 20],
      ['hakkede_tomater', 400], ['flode', 200], ['karry', 15], ['spidskommen', 3], ['ris', 300],
      ['olie', 20], ['salt', 4]
    ],
    steps: [
      'Vend kyllingetern med yoghurt, halvdelen af karryen og salt. Lad dem stå 10 min.',
      'Sæt risene over.',
      'Steg kyllingen gylden i olie og tag den af panden.',
      'Svits løg, hvidløg og ingefær med resten af krydderierne, og tilsæt tomater og fløde. Simr 10 min.',
      'Læg kyllingen tilbage, smag til og server med ris.'
    ]
  },
  {
    id: 'fyldte-peberfrugter',
    title: 'Fyldte peberfrugter',
    blurb: 'Peberfrugter fyldt med kødsovs og ris, gratineret med ost.',
    minutes: 50, diet: 'kod', serves: 4, emoji: '🫑', hue: 4,
    hero: ['hakket_okse', 'peberfrugt'],
    ingredients: [
      ['hakket_okse', 400], ['peberfrugt', 4], ['ris', 150], ['loeg', 1], ['hvidloeg', 2],
      ['hakkede_tomater', 400], ['revet_ost', 100], ['oregano', 2], ['salat', 150], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Tænd ovnen på 200 °C, og kog risene.',
      'Brun kødet med løg og hvidløg, og tilsæt hakkede tomater og oregano. Simr 10 min, og rør risene i.',
      'Halvér peberfrugterne på langs og fjern kernerne.',
      'Fyld dem med kødet, drys med ost og bag 25 min.',
      'Server med salat.'
    ]
  },
  {
    id: 'laks-ovngront',
    title: 'Laks med ovnbagte grøntsager',
    blurb: 'Laks bagt oven på søde kartofler, squash og peberfrugt.',
    minutes: 40, diet: 'fisk', serves: 4, emoji: '🐟', hue: 16,
    hero: ['laks'],
    ingredients: [
      ['laks', 500], ['sode_kartofler', 800], ['squash', 1], ['peberfrugt', 2], ['citron', 1],
      ['olie', 30], ['timian', 2], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Tænd ovnen på 200 °C.',
      'Skær søde kartofler, squash og peberfrugt i stykker, og vend dem med olie, timian og salt.',
      'Bag grøntsagerne 20 min.',
      'Læg laksen i stykker ovenpå med citronskiver, og bag 12-15 min mere.',
      'Krydr med peber og pres citron over.'
    ]
  },
  {
    id: 'fiskefrikadeller',
    title: 'Fiskefrikadeller med kartofler og remoulade',
    blurb: 'Hjemmelavede fiskefrikadeller med kogte kartofler og citron.',
    minutes: 40, diet: 'fisk', serves: 4, emoji: '🐟', hue: 50,
    hero: ['hvid_fisk'],
    ingredients: [
      ['hvid_fisk', 500], ['loeg', 1], ['aeg', 1], ['hvedemel', 40], ['maelk', 100], ['kartofler', 1000],
      ['remoulade', 150], ['citron', 1], ['smor', 30], ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne.',
      'Hak fisken fint i en blender med løg og salt.',
      'Rør æg, mel og mælk i til en fast fars.',
      'Steg frikadeller af farsen i smør, 4 min på hver side.',
      'Server med kartofler, remoulade og citronbåde.'
    ]
  },
  {
    id: 'pasta-rejer-hvidloeg',
    title: 'Pasta med rejer, hvidløg og chili',
    blurb: 'Hurtig pasta med rejer, hvidløg, chili og citron.',
    minutes: 20, diet: 'fisk', serves: 4, emoji: '🦐', hue: 10,
    hero: ['rejer'],
    ingredients: [
      ['pasta', 400], ['rejer', 400], ['hvidloeg', 4], ['chili', 2], ['citron', 1], ['krydderurter', 1],
      ['olie', 40], ['tomater', 250], ['salt', 3], ['peber', 1]
    ],
    steps: [
      'Kog pastaen.',
      'Svits hvidløg og chili i olie et minut.',
      'Tilsæt rejer og tomater i halve, og varm dem igennem.',
      'Vend pastaen i med citronsaft, revet citronskal og hakkede krydderurter.',
      'Smag til med salt og peber.'
    ]
  },
  {
    id: 'fisk-i-fad-porre',
    title: 'Fisk i fad med porrer og fløde',
    blurb: 'Hvid fisk bagt i fløde med porrer, serveret med kartofler.',
    minutes: 35, diet: 'fisk', serves: 4, emoji: '🐟', hue: 80,
    hero: ['hvid_fisk'],
    ingredients: [
      ['hvid_fisk', 600], ['porre', 2], ['flode', 250], ['citron', 1], ['kartofler', 1000],
      ['smor', 20], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Tænd ovnen på 200 °C, og kog kartoflerne.',
      'Skær porrerne i ringe og svits dem bløde i smør.',
      'Læg porrerne i et fad med fisken ovenpå. Krydr med salt, peber og revet citronskal.',
      'Hæld fløden over og bag i 20 min.',
      'Server med kartofler og citronbåde.'
    ]
  },
  {
    id: 'fiskesuppe',
    title: 'Fiskesuppe med rejer',
    blurb: 'Cremet suppe med hvid fisk, rejer, gulerod og porre.',
    minutes: 35, diet: 'fisk', serves: 4, emoji: '🥣', hue: 28,
    hero: ['hvid_fisk', 'rejer'],
    ingredients: [
      ['hvid_fisk', 400], ['rejer', 200], ['gulerod', 3], ['porre', 1], ['kartofler', 400],
      ['tomatpure', 40], ['flode', 200], ['bouillon', 2], ['hvidloeg', 2], ['krydderurter', 1],
      ['olie', 15], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Svits porre, hvidløg og gulerod i tern i olie.',
      'Tilsæt kartoffeltern, tomatpuré, 1 liter vand og bouillon. Kog 12 min.',
      'Hæld fløden ved og læg fisken i stykker i. Træk 5 min ved svag varme.',
      'Tilsæt rejerne til sidst.',
      'Smag til og drys med krydderurter.'
    ]
  },
  {
    id: 'paneret-fisk-remoulade',
    title: 'Paneret fisk med kartofler og remoulade',
    blurb: 'Sprøde fiskefileter i rasp med kartofler, remoulade og citron.',
    minutes: 30, diet: 'fisk', serves: 4, emoji: '🍋', hue: 44,
    hero: ['hvid_fisk'],
    ingredients: [
      ['hvid_fisk', 600], ['aeg', 1], ['rasp', 80], ['hvedemel', 30], ['kartofler', 1000],
      ['remoulade', 150], ['citron', 1], ['smor', 40], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne.',
      'Vend fileterne i mel, derefter pisket æg og til sidst rasp.',
      'Steg dem gyldne i smør, 3 min på hver side.',
      'Krydr med salt og peber.',
      'Server med kartofler, remoulade og citron.'
    ]
  },
  {
    id: 'laks-spinat-flode',
    title: 'Laks i fad med spinat og fløde',
    blurb: 'Laks bagt på en bund af spinat og citronfløde, med ris.',
    minutes: 30, diet: 'fisk', serves: 4, emoji: '🐟', hue: 120,
    hero: ['laks'],
    ingredients: [
      ['laks', 500], ['spinat', 300], ['flode', 250], ['citron', 1], ['hvidloeg', 2], ['ris', 300],
      ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Tænd ovnen på 200 °C, og sæt risene over.',
      'Læg spinaten i et fad og fordel hvidløg i skiver over.',
      'Læg laksen ovenpå, og krydr med salt, peber og revet citronskal.',
      'Hæld fløden over og bag 15-18 min.',
      'Pres citron over og server med ris.'
    ]
  },
  {
    id: 'groentsagslasagne',
    title: 'Grøntsagslasagne',
    blurb: 'Lasagne med squash, champignon og spinat i tomatsauce.',
    minutes: 70, diet: 'vegetar', serves: 4, emoji: '🍅', hue: 6,
    hero: ['squash', 'champignon'],
    ingredients: [
      ['lasagneplader', 250], ['squash', 2], ['champignon', 250], ['spinat', 200], ['loeg', 1],
      ['hvidloeg', 2], ['hakkede_tomater', 800], ['maelk', 600], ['hvedemel', 50], ['smor', 50],
      ['revet_ost', 150], ['oregano', 2], ['olie', 20], ['salt', 5], ['peber', 1]
    ],
    steps: [
      'Tænd ovnen på 200 °C.',
      'Svits løg, hvidløg, squash i tern og champignon i olie. Tilsæt tomater og oregano, og simr 10 min. Vend spinaten i.',
      'Lav en hvid sauce af smør, mel og mælk, og smag til med salt.',
      'Læg lag af grøntsagssauce, plader og hvid sauce i et fad. Slut med hvid sauce og ost.',
      'Bag 40 min, og lad den hvile 10 min før servering.'
    ]
  },
  {
    id: 'pasta-tomat-mozzarella',
    title: 'Pasta med tomatsauce og mozzarella',
    blurb: 'Enkel tomatsauce med hvidløg, frisk mozzarella og basilikum.',
    minutes: 25, diet: 'vegetar', serves: 4, emoji: '🍝', hue: 2,
    hero: ['mozzarella'],
    ingredients: [
      ['pasta', 500], ['hakkede_tomater', 800], ['hvidloeg', 3], ['mozzarella', 250], ['krydderurter', 1],
      ['parmesan', 40], ['olie', 30], ['sukker', 5], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Svits hvidløg i olie, tilsæt tomater og en knivspids sukker. Simr 15 min.',
      'Kog pastaen.',
      'Smag saucen til med salt og peber.',
      'Vend pastaen i saucen med mozzarella i stykker.',
      'Top med basilikum og revet parmesan.'
    ]
  },
  {
    id: 'aeggekage',
    title: 'Æggekage med kartofler og tomat',
    blurb: 'Luftig æggekage med stegte kartofler, tomat og purløg.',
    minutes: 30, diet: 'vegetar', serves: 4, emoji: '🍳', hue: 48,
    hero: ['aeg'],
    ingredients: [
      ['aeg', 8], ['maelk', 200], ['hvedemel', 20], ['kartofler', 600], ['loeg', 1], ['tomater', 300],
      ['krydderurter', 1], ['smor', 30], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Kog kartoflerne, og skær dem i skiver.',
      'Pisk æg, mælk, mel, salt og peber sammen.',
      'Steg løg og kartofler gyldne i smør på en stor pande.',
      'Hæld æggemassen over og lad den stivne under låg ved lav varme i 10 min.',
      'Top med tomat og purløg.'
    ]
  },
  {
    id: 'shakshuka',
    title: 'Shakshuka',
    blurb: 'Æg pocheret i krydret tomat og peberfrugt med feta.',
    minutes: 30, diet: 'vegetar', serves: 4, emoji: '🍳', hue: 12,
    hero: ['aeg', 'peberfrugt'],
    ingredients: [
      ['aeg', 8], ['hakkede_tomater', 800], ['peberfrugt', 2], ['loeg', 1], ['hvidloeg', 3], ['feta', 150],
      ['pita', 4], ['spidskommen', 3], ['paprika', 4], ['olie', 30], ['krydderurter', 1], ['salt', 4]
    ],
    steps: [
      'Svits løg, hvidløg og peberfrugt i olie.',
      'Rør spidskommen og paprika i, tilsæt tomaterne og simr 10 min.',
      'Lav små huller i saucen og slå æggene i. Læg låg på og lad dem stivne i 6-8 min.',
      'Smuldr feta og drys krydderurter over.',
      'Server med lunt pitabrød.'
    ]
  },
  {
    id: 'boenne-tacos',
    title: 'Bønnetacos',
    blurb: 'Tortillas med krydrede bønner, majs, avocado og creme fraiche.',
    minutes: 25, diet: 'vegetar', serves: 4, emoji: '🌮', hue: 34,
    hero: ['bonner', 'avocado'],
    ingredients: [
      ['bonner', 800], ['tortillas', 8], ['majs', 300], ['avocado', 2], ['tomater', 250], ['salat', 150],
      ['revet_ost', 100], ['creme_fraiche', 200], ['loeg', 1], ['tacokrydderi', 28], ['lime', 1], ['olie', 15]
    ],
    steps: [
      'Svits løg i olie, tilsæt skyllede bønner, tacokrydderi og en skvæt vand. Mas let og simr 5 min.',
      'Varm tortillas.',
      'Skær tomater og avocado i tern, og vend avocadoen med limesaft.',
      'Fyld tortillas med bønner, majs, grønt og ost.',
      'Top med creme fraiche.'
    ]
  },
  {
    id: 'minestrone',
    title: 'Minestrone',
    blurb: 'Italiensk grøntsagssuppe med bønner, pasta og parmesan.',
    minutes: 40, diet: 'vegetar', serves: 4, emoji: '🥣', hue: 70,
    hero: ['porre', 'bonner'],
    ingredients: [
      ['gulerod', 3], ['porre', 1], ['loeg', 1], ['hvidloeg', 2], ['kartofler', 300], ['squash', 1],
      ['hakkede_tomater', 400], ['bonner', 400], ['pasta', 150], ['bouillon', 2], ['parmesan', 40],
      ['olie', 20], ['salt', 4], ['peber', 1]
    ],
    steps: [
      'Svits løg, hvidløg, gulerod og porre i olie.',
      'Tilsæt kartofler og squash i tern, tomater, 1,2 liter vand og bouillon. Kog 15 min.',
      'Tilsæt pasta og skyllede bønner, og kog til pastaen er mør.',
      'Smag til med salt og peber.',
      'Server med revet parmesan.'
    ]
  },
  {
    id: 'ovnbagt-blomkaal-kikaerter',
    title: 'Ovnbagt blomkål med kikærter og yoghurt',
    blurb: 'Krydret, ristet blomkål og kikærter med citronyoghurt og ris.',
    minutes: 40, diet: 'vegetar', serves: 4, emoji: '🥦', hue: 40,
    hero: ['blomkaal'],
    ingredients: [
      ['blomkaal', 1], ['kikaerter', 400], ['yoghurt', 300], ['citron', 1], ['hvidloeg', 1], ['ris', 300],
      ['spidskommen', 4], ['paprika', 4], ['olie', 40], ['krydderurter', 1], ['salt', 4]
    ],
    steps: [
      'Tænd ovnen på 220 °C, og sæt risene over.',
      'Del blomkålen i buketter, og vend dem med skyllede kikærter, olie, spidskommen, paprika og salt.',
      'Rist i ovnen i 25 min.',
      'Rør yoghurt med revet hvidløg, citronsaft og salt.',
      'Server over ris med yoghurt og krydderurter.'
    ]
  },
  {
    id: 'pasta-spinat-feta',
    title: 'Pasta med spinat og feta',
    blurb: 'Cremet pasta med spinat, feta, hvidløg og citron.',
    minutes: 20, diet: 'vegetar', serves: 4, emoji: '🍝', hue: 110,
    hero: ['spinat', 'feta'],
    ingredients: [
      ['pasta', 500], ['spinat', 300], ['feta', 200], ['hvidloeg', 3], ['citron', 1], ['flode', 100],
      ['olie', 20], ['peber', 1], ['salt', 3]
    ],
    steps: [
      'Kog pastaen, og gem en kop kogevand.',
      'Svits hvidløg i olie, og lad spinaten falde sammen på panden.',
      'Smuldr fetaen i, og tilsæt fløde og lidt kogevand.',
      'Vend pastaen i med citronskal og -saft.',
      'Smag til med peber.'
    ]
  }
];
