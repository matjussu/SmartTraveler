# Direction `voyage-pivot` — Lever de soleil

> Pivot de `design/concorde-departure` : on garde le concept boarding pass, on jette la palette cockpit. Cream, terracotta, italiques chaleureux. Le voyage commence en gare, pas sur un tableau de bord.

## Voice spec appliquée

- **Palette** — fond cream `oklch(0.972 0.014 78)` (off-white solaire, jamais midnight), encre terre brûlée `oklch(0.215 0.028 38)`. Accents par alternative : terracotta `oklch(0.62 0.155 38)` (économique, chaleur sable), ocean `oklch(0.55 0.115 235)` (rapide, bleu calme), sage `oklch(0.55 0.078 145)` (éco, feuille). Or doux `oklch(0.78 0.13 75)` en utility (underline CTA secondaire). Zéro gradient bleu-purple, zéro acid LCD, zéro glass aurora.
- **Typographie** — Instrument Serif (display, italique chaleureux) + Plus Jakarta Sans (body, grotesque douce) + JetBrains Mono (chiffres prix/durée/CO₂ uniquement). Triplet distinct des directions précédentes (Atlas Geist, Compass Fraunces, Concorde Inter) pour signaler le pivot visuellement dès la première lecture. Italique éditorial sur tous les noms de voyage (`Tour Méditerranée`, `Cap mer du Nord`) — signature "carnet de voyage" sans tomber dans le scrapbook.
- **Vocabulaire B2C** — strictement : "Composez vos prochaines vacances", "Vos itinéraires", "Trois façons d'arriver là-bas", "Le plus économique / le plus rapide / Empreinte carbone réduite", "Étapes du voyage", "Détail des segments", "Récapitulatif", "Réserver cette version", "Composer un voyage". Zéro "cockpit", zéro "ETD/ETA", zéro "boarding gate", zéro "plan de vol".
- **Concept boarding pass conservé** — codes 3 lettres ville (`PAR → ROM → BCN → PAR`) en mono, perforation horizontale entre header et corps, ronds latéraux découpe billet, "à partir de" prix en mono. Mais redessiné chaleureux : cream + terracotta + bord adouci, plus parisian-carnet que cockpit-LCD.
- **Carte Leaflet** — tile CartoDB Voyager (light, chaleureux, palette beige/sable cohérente avec le fond), polyline pointillée colorée selon alternative active, markers `divIcon` custom avec étiquette nom ville en italique display + bulle blanche.

## Changements vs concorde-departure original

| Avant (Concorde, rejeté) | Après (voyage-pivot, livré) |
|---|---|
| Fond midnight indigo / near-black | Fond cream `oklch(0.972 0.014 78)` lever de soleil |
| Inter dark générique + JetBrains Mono | Instrument Serif (display italique) + Plus Jakarta Sans + JetBrains Mono |
| Tile Leaflet `carto-dark` | Tile `carto-voyager` light (palette beige/sable) |
| Accents acid LCD (rouge/orange/vert vifs cockpit) | Terracotta / Ocean / Sage chaleureux par alternative |
| Headline "Trois lectures, un même voyage" (acid) | "Composez vos *prochaines vacances*." (chaleureux, italique éditorial) |
| Vocabulaire aviation B2B ("Console embarquement", "ETD", "Plan de vol") | Vocabulaire B2C ("Vos itinéraires", "Étapes du voyage", "Détail des segments") |
| Glass aurora glow / backdrop blur cinematic | Surfaces solides, shadows douces, perforation billet en pointillés terre |
| Markers neon halo cyan | Markers bulle blanche + dot terracotta/ocean/sage + nom ville italique |

## Références retenues

- **Hopper 2023 rebrand** — warm coral signature, italique playful, mono pour chiffres prix
- **Airbnb post-Bélo** — cream + warm rose + storytelling éditorial
- **Aesop** — Instrument Serif feel, cream + dark earth, restraint
- **Apple Maps consumer** — tile light propre, markers signature (pas neon)
- **Skyscanner moderne** — clean, accent unique fonctionnel, hiérarchie typo claire

## Test couvre-logo

- Si je remplace "SmartTraveler" par **Hopper / Airbnb / Skyscanner / Aesop** → crédible. ✅
- Si je remplace par **Vercel / Linear / Stripe Console** → pas crédible, trop éditorial-voyage. ✅ (le but était précisément de NE PAS pouvoir le confondre avec un dashboard pro).

## Captures

- `/home/matteo_linux/projets/smarttraveler/docs/design-directions/v2/voyage-pivot-home.png` — accueil + 3 boarding tickets + CTA composition
- `/home/matteo_linux/projets/smarttraveler/docs/design-directions/v2/voyage-pivot-result.png` — résultat `trip-mediterranee` alt `cheapest` actif + carte + plan + récap

## Caveats

- Le footer "© 2026 — voyages composés avec soin." est volontairement court et chaleureux, pas légalese.
- Le bouton noir `bg-ink` du header pour "Composer un voyage" tranche avec le bouton terracotta du hero — choix assumé pour hiérarchiser : terracotta = action narrative principale, noir = action transactionnelle persistante header.
- Pas de skeleton loaders ni d'états chargement custom (hors scope brief). Map a un fallback `Préparation de la carte…` minimal.
- Footer page result coupé par la viewport 1440×900 (CTA `Réserver cette version` visible, bas de page tronqué) — comportement attendu, le screenshot est full-page donc tout est dans le PNG.
