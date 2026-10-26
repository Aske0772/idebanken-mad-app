# Mambeno – reverse engineering (offentligt web)

Scope: kun offentlige sider på mambeno.dk, analyseret med REA (`capture_browser_scenario`) i en mobil viewport (390×844). Ingen login, ingen konto, ingen downloads af app-pakker.

REA evidence:
- `ev_90876b0b…` – forside, netværk + accessibility-træ + screenshot
- `ev_fd8444cb…` – opskriftsside (`/opskrifter/asiatiske-frikadeller-med-ris-og-mangosalat/`), accessibility-træ

## Hvad vi observerede

### Teknik (forside)
- WordPress + WooCommerce Subscriptions (abonnement), Bambora (betaling), Ninja Forms, Revolution Slider.
- Help Scout Beacon (support-chat), Trustpilot-widgets, Cookie Information (samtykke).
- Tunge tracking-pixels: Meta, TikTok, Google Ads/GA4, Spotify, Podscribe. Vi skal **ikke** kopiere det – vores app skal være let og privatlivsvenlig.
- Selve appen (iOS/Android) er en separat native app; der findes ingen offentlig web-app (app.mambeno.dk svarer ikke). `api.mambeno.dk` svarer 200 med tom body.

### Opskriftsmodel (opskriftsside)
| Felt | Eksempel |
|---|---|
| Kategori | Aftensmad |
| Titel + kort beskrivelse | "Asiatiske frikadeller med ris og mangosalat" |
| Popularitet | "3.0, Meget populær" |
| Køkkentid / ventetid | 35 min / 0 min |
| Portioner (justerbar +/–) | 2 |
| Ingredienser | `mængde + enhed + navn` (fx "400 gram hakket svinekød") |
| **Basisvarer** | listet **uden mængde**: "rapsolie", "salt", "peber" |
| Fremgangsmåde | nummererede trin |
| Ekstra | "Tips til mindre børn i køkkenet", "Ekstra smag" |
| Sponsor | "I samarbejde med" + logo |
| Billede | ét hero-foto pr. opskrift |

Basisvarer uden mængde er præcis den model vi bruger: de tælles ikke med i prisen, men kan slås til.

### Kategorier (opskriftsoversigt)
Aftensmad → børnenes favoritter, god til 2 dage, grill, hurtigmad, max 15 min, max 5 ingredienser, vegetar, verdenskøkken, pizza/burger, ris/pasta/kartofler. Plus madpakker og "alt det andet" (bagværk, dips, snacks).

### Funktioner (fra app-guide + App Store)
- 7 faste ugeplaner (klassisk, kalorielet, proteinrig, vegetar, budget, hurtig, "mere grønt") – kun baseret på **REMA 1000**.
- Byt ret, justér portioner, noter på opskrift/dag.
- Indkøbsliste: afkrydsning, deling i familien, priser, tilbudsmarkering, tilbagevendende varer, send til REMA 1000.
- "Tøm køleskabet": find opskrifter ud fra det man har.
- Madpakkebygger, print af ugeplan, familieaktiviteter i kalenderen.

## Hvad vi gør anderledes

| Mambeno | Vores app |
|---|---|
| Kun REMA 1000 | **Alle** tilbudsaviser – brugeren vælger butikker (Netto, REMA, Føtex, Lidl, Kvickly …) |
| Færdige ugeplaner man bytter i | **Swipe** gennem ugens retter – højre = vil have, venstre = nej |
| Pris pr. opskrift | Pris for **dage × personer**, pakkestørrelser medregnet, + **pr. person pr. måltid** |
| Abonnementsside + mange pixels | Let PWA, ingen tracking |
| Mange menuer og features | 3 faner: Swipe · Uge · Liste |

## Mambeno-features vi tager med
- Basisvarer uden pris (kan slås til pr. ret) ✔
- Justérbare personer ✔ (+ antal dage)
- Indkøbsliste med afkrydsning og deling ✔, grupperet pr. butik
- Tilbud markeret på listen ✔
- "Har hjemme" (light-udgave af "Tøm køleskabet"): ingredienser du allerede har, tæller ikke med ✔
- Kost-filter (alt / vegetar / fisk) og hurtig-filter ✔
- Gemte retter (favoritter) ✔

## Bevidst udskudt (v2)
Madpakkebygger, tilbagevendende varer, print, familiekalender, levering via butikkernes webshops, kalorier/protein.
