# SmartTraveler — Design Directions

Trois directions distinctes pour la maquette interactive de SmartTraveler.
Chaque direction vit sur sa propre branche, est self-consistent (typo, palette,
radius, shadows, micro-interactions cohérents), et applique strictement les
règles anti-slop (Paul Bakaus — `impeccable`, Emil Kowalski — `emil-design-eng`).

Les 3 écrans couverts par direction : `/` (historique) et `/trip/[id]/result`
(résultat itinéraire avec carte Leaflet + alternatives).

> **Cas par défaut sur `/trip/[id]/result`** : `trip-mediterranee`
> (Paris → Rome → Barcelone → Paris), alternative `cheapest` affichée en
> principal avec switcher vers `fastest` et `eco`.

---

## Direction A — Compass Editorial

**Branche** : `design/compass-editorial`
**Commit** : `e55ed1d`

**Thème** : Carnet de voyage premium — un Monocle en version logiciel.

**Références visuelles** :
Apple Maps · Monocle magazine · Frame.io éditorial · Cartier guidebooks · Stripe Press

**Pourquoi cette direction match SmartTraveler** :
SmartTraveler n'est pas un dashboard d'aéroport, c'est un objet de **composition
de voyages**. La direction Compass traite l'app comme un carnet — papier ivoire,
typo serif Fraunces, hiérarchie éditoriale, filets cuivre. Chaque itinéraire
devient une page de magazine où l'ordre des destinations se lit comme une
table des matières. Le ton est calme, premium, durable — il valorise la
**lenteur du choix** plutôt que la vélocité du dashboard.

**Palette principale** :

| Token | OKLCH | Approx. hex | Usage |
|---|---|---|---|
| paper | `oklch(0.985 0.012 85)` | `#fbf8f1` | background |
| ink | `oklch(0.215 0.025 254)` | `#1c2129` | foreground, CTA primary |
| copper | `oklch(0.62 0.135 48)` | `#b8693a` | accent éditorial, eyebrows |
| sage | `oklch(0.55 0.075 145)` | `#5d8467` | indicateur eco |
| amber | `oklch(0.7 0.13 75)` | `#c79152` | indicateur cheapest |

**Typographie** :
- **Display** : Fraunces (axes opsz + SOFT, italique selon emphase)
- **Body** : Inter
- **Mono** : JetBrains Mono (cotes, KPI, timestamps)

**Captures** :
- [`compass-editorial-home.png`](./compass-editorial-home.png)
- [`compass-editorial-result.png`](./compass-editorial-result.png)

---

## Direction B — Atlas Console

**Branche** : `design/atlas-console`
**Commit** : `df6ca31`

**Thème** : Dashboard data-dense, tonalité Linear/Vercel — le poste de pilotage d'un planificateur expert.

**Références visuelles** :
Linear · Vercel docs · Stripe shell · Frame.io app · Sentry dashboard

**Pourquoi cette direction match SmartTraveler** :
SmartTraveler manipule de la donnée structurée (coûts, durées, CO2, ordres
partiels). La direction Atlas pousse cette logique à fond : near-black, grille
dense, tabular numerics partout, accents acid (ice / lime / coral / amber)
pour cartographier les trois alternatives sans ambiguïté. C'est la direction
qui **assume la rigueur algorithmique** du TSP sous-jacent et la rend lisible
au glance. Idéal si Matteo veut valoriser la précision technique du projet
devant un jury MIAGE.

**Palette principale** :

| Token | OKLCH | Approx. hex | Usage |
|---|---|---|---|
| bg-base | `oklch(0.155 0.005 250)` | `#1c2026` | background |
| bg-elev1 | `oklch(0.185 0.008 250)` | `#252a31` | card |
| ice | `oklch(0.85 0.105 215)` | `#7bd5e8` | accent primaire, KPIs |
| lime | `oklch(0.85 0.16 130)` | `#bcd97a` | alt. eco |
| coral | `oklch(0.74 0.16 25)` | `#e8896e` | alt. fastest |
| amber | `oklch(0.85 0.13 80)` | `#dabd5e` | alt. cheapest |

**Typographie** :
- **Display + Body** : Geist Sans
- **Mono** : Geist Mono (tabular pour tous les nombres : coûts, durées, CO2)

**Captures** :
- [`atlas-console-home.png`](./atlas-console-home.png)
- [`atlas-console-result.png`](./atlas-console-result.png)

---

## Direction C — Concorde Departure

**Branche** : `design/concorde-departure`
**Commit** : `33b7afa`

**Thème** : Glass cinematic aéroportuaire — vision OS / Apple Maps after dark.

**Références visuelles** :
iOS 18 / Vision OS · FlightAware · Apple Maps mode nuit · Granola · Loops.so

**Pourquoi cette direction match SmartTraveler** :
SmartTraveler parle de **départ**, de mouvement, de moments d'embarquement. La
direction Concorde matérialise ce moment : ciel midnight, glass blur sur les
surfaces, glow aurora qui souligne les coûts, helios warm pour le départ. Les
itinéraires se lisent comme un FIDS (Flight Information Display) repensé.
C'est la direction la plus **émotionnelle**, celle qui transforme la
fonctionnalité utilitaire (calcul d'itinéraire) en geste évocateur. Risque :
demande plus de soin sur le contraste — toutes les surfaces glass ont été
vérifiées contre WCAG AA.

**Palette principale** :

| Token | OKLCH | Approx. hex | Usage |
|---|---|---|---|
| night | `oklch(0.16 0.04 270)` | `#1a1a2e` | background midnight |
| aurora | `oklch(0.74 0.12 235)` | `#5fb1d6` | accent primaire / glow |
| helios | `oklch(0.78 0.16 60)` | `#e6a361` | alt. fastest (warm) |
| ember | `oklch(0.72 0.17 30)` | `#e08068` | alt. cheapest |
| lichen | `oklch(0.76 0.14 155)` | `#6fc89a` | alt. eco |
| frost | `oklch(0.985 0.005 250)` | `#f7f8fa` | foreground sur dark |

**Typographie** :
- **Display + Body** : Geist Sans
- **Mono** : Geist Mono (tabular sur KPIs, ETA, slots horaires)

**Captures** :
- [`concorde-departure-home.png`](./concorde-departure-home.png)
- [`concorde-departure-result.png`](./concorde-departure-result.png)

---

## Comparatif rapide

| Critère | Compass Editorial | Atlas Console | Concorde Departure |
|---|---|---|---|
| **Tonalité** | calme, premium, éditorial | dense, expert, technique | cinématique, évocateur |
| **Mode** | light (paper) | dark (near-black) | dark (midnight glass) |
| **Densité** | aérée, generous whitespace | très dense, grid stricte | medium, focus émotionnel |
| **Typo display** | Fraunces (serif opsz) | Geist Sans | Geist Sans |
| **Carte Leaflet** | tiles light (carto-light) | tiles dark (carto-dark) | tiles dark + glow markers |
| **Risque jury** | peut paraître "joli mais peu technique" | très lisible mais demande des yeux pour le détail | superbe en captures, plus difficile à itérer |
| **Audience cible** | jury séduit par l'objet de design | jury MIAGE-tech, ingénieurs | démo magnétique en présentation |

---

## Comment switcher entre directions

Chaque direction vit sur sa propre branche git. Pour explorer en live :

```bash
git checkout design/compass-editorial && npm run dev
# puis
git checkout design/atlas-console && npm run dev
# puis
git checkout design/concorde-departure && npm run dev
```

Les écrans à visiter : `/` et `/trip/trip-mediterranee/result`.

Toutes les directions partagent les mocks (`src/mocks/trips.ts`) et le store
Zustand (`src/store/trip-store.ts`) — seuls les tokens, composants, layouts
et écrans `/` + `/trip/[id]/result` divergent. Les 8 autres routes
placeholder restent identiques entre directions (à cascade après validation).

---

## Anti-slop checklist (appliquée à chaque direction)

- [x] Pas de gradient bleu-violet générique
- [x] Max 2 familles de typo + 1 mono
- [x] Pas de cards avec border + shadow + radius excessifs cumulés
- [x] Pas de centrage par défaut — alignements pensés
- [x] Pas de spacing identique entre toutes les sections
- [x] Pas de boutons "Get Started" / "Learn More" génériques (CTAs contextuels)
- [x] Pas d'emojis dans l'UI rendered
- [x] Contraste vérifié WCAG AA sur foreground/background
- [x] Cards et boutons avec `:hover` ET `:active` distincts
- [x] Transitions sur propriétés ciblées (transform, opacity, color), jamais `all`
- [x] `prefers-reduced-motion` respecté sur les animations non-essentielles
