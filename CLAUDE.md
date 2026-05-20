@AGENTS.md

# SmartTraveler — projet Master M1 MIAGE

> Optimisateur d'itinéraire multi-destinations en maquette interactive desktop. Déployé en preview Vercel. Pas de backend solveur réel — toute la "logique TSP" est faked via mock data.

## 1. Identité du projet

- **Auteur** : Matteo Lepietre, étudiant M1 MIAGE
- **Type** : projet académique (master) en maquette interactive
- **But** : démontrer un produit consumer "optimisation d'itinéraire multi-destinations" avec 3 alternatives par voyage (cheapest / fastest / eco)
- **Livrable final** : lien Vercel preview navigable
- **Backend** : **aucun** — toute la donnée vit dans `src/mocks/trips.ts`. Le store Zustand `src/store/trip-store.ts` persist localStorage pour les drafts user
- **Spec produit** : `spec/Smart-traveler.txt` (20 user stories MVP + 12 US synthétiques sur 8 épics)

## 2. Stack technique

- **Next.js 16.2.6** (App Router, Turbopack) — ⚠️ pas Next 15, plusieurs APIs ont breaking changes vs training data. Voir `AGENTS.md` + `node_modules/next/dist/docs/` avant écriture
- **TypeScript strict** + alias `@/*` (depuis `src/`)
- **Tailwind v4** (`@tailwindcss/postcss`, config CSS-first via `@theme inline` dans `src/app/globals.css`)
- **shadcn/ui** preset `base-nova` baseColor `neutral` cssVariables (Button + utils déjà installés via `npx shadcn@latest init --defaults --yes --no-monorepo`)
- **react-leaflet 5** + **leaflet 1.9.4** (cartes interactives)
- **Zustand 5** + middleware `persist` localStorage (key `smarttraveler-trips`)
- **@react-pdf/renderer 4.5.1** (preview + download PDF récap voyage)
- **3 fonts via `next/font/google`** :
  - `Instrument_Serif` → `var(--font-display)` (titres italiques voyage-pivot)
  - `Plus_Jakarta_Sans` → `var(--font-jakarta)` / `var(--font-sans)` (body)
  - `IBM_Plex_Mono` → `var(--font-flap)` (split-flap glyphs)
  - `JetBrains_Mono` → `var(--font-mono)` (chiffres tabulaires)

## 3. Architecture — 10 routes App Router

| Route | Server/Client | Rôle | Direction design |
|---|---|---|---|
| `/` | Server | Splash Split-Flap + home minimaliste | Phase 1 redesign noir |
| `/trip/new` | Client | Création voyage (nom + ville + dates) | voyage-pivot cream |
| `/trip/[id]/destinations` | Client | Ajout/édition villes destinations | voyage-pivot cream |
| `/trip/[id]/constraints` | Client | Contraintes (dates fixes + ordre) | voyage-pivot cream |
| `/trip/[id]/recap` | Server | Récap pré-calcul + CTA "Calculer" | voyage-pivot cream |
| `/trip/[id]/result` | Server delegate | Résultat itinéraire + carte + segments | voyage-pivot cream |
| `/trip/[id]/compare` | Server delegate | 3 colonnes parallèles alternatives | voyage-pivot cream |
| `/trip/[id]/edit` | Server delegate | Édition voyage existant | voyage-pivot cream |
| `/trip/[id]/export` | Server delegate | Preview PDF + download | voyage-pivot cream |
| `/shared/[token]` | Server delegate | Vue lecture seule partage | voyage-pivot cream |

Pattern Next 16 partout : `PageProps<"/route/literal">` + `await props.params`. `"use client"` uniquement sur les composants vraiment interactifs (forms, dynamic Leaflet, Zustand consumers, react-pdf).

## 4. Deux directions design coexistantes

### (a) "voyage-pivot — Lever de soleil"
- **Scope** : `/trip/*` + `/shared/*` (9 routes sur 10)
- **Palette OKLCH** : cream `oklch(0.972 0.014 78)` + ink terre brûlée `oklch(0.215 0.028 38)` + terracotta `oklch(0.62 0.155 38)` (éco/principal) + ocean `oklch(0.55 0.115 235)` (rapide) + sage `oklch(0.55 0.078 145)` (éco) + or doux `oklch(0.78 0.13 75)`
- **Typo** : Instrument Serif italic (display) + Plus Jakarta Sans (body) + JetBrains Mono (chiffres)
- **Tiles Leaflet** : CartoDB Voyager (light beige/sable)
- **Markers** : `L.divIcon` bulle blanche + nom ville italique + dot couleur alternative

### (b) "grand redesign Phase 1"
- **Scope** : `/` UNIQUEMENT (autres routes intactes)
- **Palette** : matte black `#050505` + warm-white `#f6f6f4` + amber accent `#ff8a3d`
- **Typo** : IBM Plex Mono 700 (Split-Flap) + Plus Jakarta Sans sobre (subtitle)
- **Mécanique** : splash overlay fixed z-50 → scroll-driven shrink (scale 1→0.5, translateY 0→-26vh, bg interpolé opaque→transparent à `FADE_START = 0.6`)
- **Source d'inspiration** : `claude_design/Split Flap Board.html` (mock Claude Design, port fidèle React 19 + Next 16)

## 5. Voice spec SmartTraveler v1

**Tonalité non-négociable** : voyage = évasion, anticipation, chaleur, légèreté. **JAMAIS** dashboard / console / cockpit / militaire / B2B techy.

**Test mental couvre-logo** : si une marque comme Linear, Vercel, Stripe Console, Figma pro pourrait afficher ton design → c'est faux. Le bon test : est-ce que **Hopper, Airbnb, Skyscanner moderne, Aesop, Apple Maps consumer** pourrait l'afficher ? Si oui, c'est bon.

**Vocabulaire B2C à utiliser** :
- "Vos itinéraires" / "Composez vos prochaines vacances"
- "Composez votre itinéraire" / "Trois façons d'arriver là-bas"
- "Récapitulatif" / "Détail des segments" / "Étapes du voyage"
- "Le plus économique" / "Le plus rapide" / "Empreinte carbone réduite"
- "Nouveau voyage" / "Calculer mon voyage" / "Réserver cette version"

**Anti-patterns BANNED** (grep cross-codebase doit retourner 0 hit hors commentaires direction) :
- ❌ Midnight indigo / glass aurora / backdrop-blur sur dark
- ❌ Cyan acidulé sur sombre
- ❌ Accents acid LCD (rouge/orange/vert vif type tableau de bord)
- ❌ Gradient blue-purple Tailwind primary
- ❌ Inter générique noir
- ❌ Jargon B2B aviation (Console, ETD, ETA, Plan de vol, Trajectoire, Cockpit, Boarding gate)
- ❌ Anglicismes ("Create Trip", "Save Changes", "Delete", "Compare Options")

## 6. Composants partagés

| Composant | Path | Notes |
|---|---|---|
| `<TopNav variant="light" \| "dark">` | `src/components/voyage/top-nav.tsx` | variant=dark pour home noir |
| `<BoardingTicket>` | `src/components/voyage/boarding-ticket.tsx` | Cards trip avec perforation + codes 3 lettres |
| `<TripMap>` | `src/components/voyage/trip-map.tsx` | `'use client'` + L.divIcon markers + polyline pointillée |
| `<AlternativeSwitcher>` | `src/components/voyage/alternative-switcher.tsx` | `'use client'` + dynamic import TripMap ssr:false |
| `<ResultView>` | `src/components/voyage/result-view.tsx` | Page complète /result en client |
| `<FormField>` + `inputClass()` | `src/components/voyage/form-field.tsx` | Pattern formulaire (label Instrument Serif italic + helper italic + error chaleureux terracotta) |
| `<DraftPreview>` | `src/components/voyage/draft-preview.tsx` | Mini-boarding-ticket sticky preview live |
| `<DestinationsEditor>` | `src/components/voyage/destinations-editor.tsx` | Liste villes éditables + autocomplete |
| `<ConstraintsEditor>` | `src/components/voyage/constraints-editor.tsx` | Contraintes dates + ordre partiel |
| `<EditView>` | `src/components/voyage/edit-view.tsx` | Édition consolidée |
| `<CompareView>` | `src/components/voyage/compare-view.tsx` | 3 colonnes parallèles + tableau différences |
| `<ExportView>` | `src/components/voyage/export-view.tsx` | Page PDF preview + actions |
| `<TripPdfDocument>` | `src/components/voyage/trip-pdf-document.tsx` | Document A4 @react-pdf/renderer |
| `<PdfPreviewBlock>` + `<PdfDownloadButton>` | `src/components/voyage/pdf-*.tsx` | Sub-components SSR-safe pour @react-pdf |
| `<SharedView>` | `src/components/voyage/shared-view.tsx` | Clone result read-only sans CTAs actions |
| `<SplitFlap>` | `src/components/splash/split-flap.tsx` | Board mécanique XL/mini + columnLabels prop |
| `<SplashIntro>` | `src/components/splash/splash-intro.tsx` | Overlay scroll-driven shrink |

## 7. Helpers

- `src/lib/format.ts` — `formatCost(eur)`, `formatLongDuration(min)`, `formatDateLong(iso)`, `formatCo2(kg)`, `tripDurationDays(s, e)`, `transportLabel(mode)`, `statusLabel(status)`
- `src/lib/cities-mock.ts` — **75 villes monde** (EU élargie + Asie + Amériques + Afrique + Océanie) + `resolveCity(rawName)` + `cityCode(name)`. Noms localisés FR (Bombay, Pékin, Le Caire, Dubaï…). Codes IATA quand existants
- `src/lib/constraints.ts` — types `DestinationConstraint` + `TripConstraints` + helpers `buildInitialConstraints`, `hasNoStrictConstraints`, `countConstraints`
- `src/hooks/use-scroll-progress.ts` — hook `useScrollProgress(threshold)` retourne progress 0→1 sur window.scrollY, rAF coalescé, clean teardown

## 8. Mocks

`src/mocks/trips.ts` — **4 voyages**, chacun avec 3 alternatives (cheapest / fastest / eco) :

| Trip ID | Nom | Itinéraire | Status |
|---|---|---|---|
| `trip-mediterranee` | Tour Méditerranée | Paris→Rome→Barcelone→Paris | computed |
| `trip-europe-centrale` | Boucle Europe centrale | Lyon→Berlin→Prague→Lyon | computed |
| `trip-mer-du-nord` | Cap mer du Nord | Marseille→Amsterdam→Copenhague→Marseille | draft |
| `trip-grand-tour-europe` | Grand Tour d'Europe | Paris→Rome→Athènes→Istanbul→Vienne→Berlin→Paris (5 destinations) | computed |

Types exportés : `Trip`, `Destination`, `City`, `Leg`, `Alternative`, `AlternativeKind`, `TransportMode`, `TripStatus`, `Coordinates`. Helper `getTripById(id)`.

**Données réalistes** : prix vols/trains européens, durées cohérentes, CO2 kg/passager, carriers nommés (Ryanair, Vueling, easyJet, Aegean, Pegasus, TGV+Frecciarossa, RailJet, FlixBus, ICE+Thalys, etc).

## 9. Conventions clés

### CSS scope sélectif home noir
- `<main data-route="home-redesign">` sur `/` uniquement
- `globals.css` règle : `main[data-route="home-redesign"] { bg matte black }` + `body:has(...)` via `@supports selector(:has(*))` pour éviter overscroll flash
- **Aucune autre route n'a `data-route` set** → règles CSS scoped non-appliquées → cream voyage-pivot intact

### Pattern interpolation inline pour anim scroll-driven
- Le hook `useScrollProgress` retourne un float qui re-render le composant à chaque rAF
- Transform, opacity, background-color interpolés via `style={{ ... }}` inline (pas CSS transition)
- Pourquoi : combiner CSS transition + hook scroll donne du jank (transitions queued en file pendant le scroll continu)

### `pointer-events: none` TOUJOURS sur overlay fixed décoratif
- ⚠️ **Règle CRITICAL** apprise via bug bloquant ordre #1602 : un overlay `position: fixed inset-0` avec `pointer-events: auto` capture wheel/touch/scroll → si l'overlay n'a pas de scroll interne, les events sont consommés sans effet → **scroll user totalement bloqué**
- Pattern correct : `pointer-events: none` toujours en CSS statique sur overlay décoratif
- Pattern à proscrire : conditionner `pointer-events` sur un progress dans inline TSX
- Si un overlay DOIT être interactif (modal click-to-close), c'est le trigger précis qui doit avoir `auto`, pas l'overlay entier

### @react-pdf/renderer SSR-safe
- Tout import de `@react-pdf/renderer` doit être isolé dans un sub-component `"use client"` chargé via `dynamic(() => import(...), { ssr: false })`
- Sinon BAILOUT_TO_CLIENT_SIDE_RENDERING et viewer bloqué (cf ordre #1342)
- Pattern : `<PdfPreviewBlock>` + `<PdfDownloadButton>` isolent l'import de `@react-pdf` ET de `<TripPdfDocument>` qui le réutilise

### Next 16 `PageProps` global helper
- `export default async function Page(props: PageProps<"/trip/[id]/result">) { const { id } = await props.params; ... }`
- Type généré par `next dev` / `next build` / `next typegen` — pas d'import nécessaire
- Pareil pour `LayoutProps<"/...">` sur les layouts

### Voice spec strict
- Avant tout commit qui touche du copy user-facing, grep banned patterns dans `src/`
- Avant tout PR design, test couvre-logo (cf section 5)

## 10. État courant

**Phase 1 redesign noir live** sur Vercel preview, SHA `5b8bcc2` à la fin de la journée 20/05/2026.

**Routes intactes en voyage-pivot cream** : toutes sauf `/`. Régression test confirmé via `curl` HTTP 200 sur `/trip/trip-mediterranee/result` et `/trip/trip-grand-tour-europe/result` à chaque commit.

**Boarding Pass component** (`claude_design/Boarding Pass.html`) : **PAS ENCORE PORTÉ**. Référence design only à la racine, hors scope Phase 1.

## 11. Branches actives

| Branche | SHA terminal | Statut |
|---|---|---|
| `feat/cascade-screens-voyage-pivot` | `5b8bcc2` | Active, contient Phase 1 redesign. **Pas mergée dans `main`** |
| `feat/init-stack` | `9cb9a6e` | Squelette initial, déployée en production Vercel par défaut |
| `main` | hérite de `feat/init-stack` initialement | À update via PR depuis `feat/cascade-screens-voyage-pivot` quand Matteo le valide |

## 12. URLs Vercel

- **Preview branche `feat/cascade-screens-voyage-pivot`** (stable par branche, rebuild auto webhook) :
  https://smart-traveler-git-feat-casca-e80c52-matteo-lepietre-s-projects.vercel.app
- **Production** (init-stack placeholders) :
  https://smart-traveler-aq2vamddf-matteo-lepietre-s-projects.vercel.app (à update après merge main)
- **Vercel project** : `prj_NobkOXzp8WBISy3zFguwXlYlexz2` (team `team_VXtwbKximn6Tw01hdeMKjims`)
- **Inspector dernière build** : https://vercel.com/matteo-lepietre-s-projects/smart-traveler

## 13. Caveats connus

- **`backdrop-blur-md`** retiré du TopNav variant dark (préfère `bg-[#050505]/92` solid, cohérent avec mock Split-Flap qui n'utilise pas de blur)
- **`FADE_START = 0.6`** constante dans `splash-intro.tsx` — seuil scroll progress où background overlay commence à fade-out. Ajustable pour révélation main plus tôt/tard
- **Placeholder height couplé scale final** : `clamp(96px, 14vh, 160px)` dans `page.tsx` calé sur SplitFlap XL × scale 0.5. Si scale final modifié, ajuster proportionnellement le placeholder ou risque décalage visuel
- **280px scroll threshold** : minimum nécessaire pour transition splash. Ajustable via prop `scrollThreshold` sur `<SplashIntro>` (default 280)
- **`min-h-[120vh]` sur main home-redesign** : garantit page scrollable (sinon user ne peut pas scroller 280px pour déclencher transition). Espace en bas → à remplir avec contenu Phase 2 (Boarding Pass, TripCards historique, etc.)
- **Datalist input date locale** : Chrome EN-default montre `mm/dd/yyyy` malgré `lang="fr"`. Comportement natif Chromium, non patchable proprement sans perdre l'a11y. En FR système, user voit `jj/mm/aaaa`
- **`backdrop-blur-md`** présent sur `top-nav.tsx` variant=light (cream) — hérité voyage-pivot, hors scope Phase 1 redesign. À évaluer en Phase 2 si harmonisation noir
- **2 vulnérabilités modérées** dans deps (héritées Next + react-pdf). `npm audit fix --force` casserait via breaking changes — laisser tel quel jusqu'à upgrade majeur volontaire
- **ESLint warning `react-hooks/set-state-in-effect`** sur `src/components/voyage/edit-view.tsx` ligne 109 : pattern Zustand persist hydratation, acceptable, non bloquant build Vercel. Refacto possible en `useSyncExternalStore` plus tard

## 14. Workflow Vercel

- **Link plateforme** : Matteo a linké le repo SmartTraveler à `smart-traveler` project sur Vercel via la plateforme web (pas CLI, pas MCP). Ne PAS lancer `vercel link` ni `mcp__plugin_vercel_vercel__deploy_to_vercel` côté Claude — conflit potentiel
- **Webhook GitHub** : auto-trigger deploy preview à chaque push sur n'importe quelle branche, build time ~60-90s
- **URL stable par branche** : `branchAlias` reste valide à travers les rebuilds successifs sur la même branche (URL pour Matteo = invariante)
- **Récupération URL post-push** :
  1. Wait ~60-90s
  2. `mcp__plugin_vercel_vercel__list_deployments` projectId + teamId
  3. Filter sur le SHA du dernier commit
  4. Extract `branchAlias` (URL stable) ou `url` (URL direct deployment)
- **Skills Vercel à activer** si besoin : `vercel:nextjs`, `vercel:shadcn`, `vercel:next-upgrade`, `vercel:next-cache-components`, `vercel:deployments-cicd`
- **Production** : actuellement = `feat/init-stack` (placeholders 10 routes). À update via PR `feat/cascade-screens-voyage-pivot → main` quand Matteo le valide

## 15. Séquence ordres journée 20/05/2026

Tracé Obsidian dans `~/obsidian-vault/03-Claude/orders/2026-05-20-*.md`. Chronologie :

| # | Ordre | Livraison |
|---|---|---|
| 87 | Init repo SmartTraveler (squelette stack + 10 routes + mocks + Zustand) | SHA `9cb9a6e` |
| 88 | 2-3 directions design distinctes (frontend-specialist) | Compass Editorial / Atlas Console / Concorde Departure |
| 89 | Pivot voice-first (rejet directions, application voice spec stricte) | Direction `voyage-pivot — Lever de soleil` SHA `fa0c34e` |
| 90 | Cascade 8 écrans restants (pilote /trip/new + 7 sub-agents parallèles) | SHA `617e6ce` |
| 91 | 3 fixes (PDF export bug + grand voyage 5 dest + 75 villes monde) | SHA `fde1aea` |
| 92 | Grand redesign Phase 1 splash split-flap + home noire | SHA `50e2da5` |
| 93 | Labels colonnes Flight Number/Destination + bug layout subtitle/CTA | SHA `0c9af29` |
| 94 | Opacité splash + placeholder flow + scale 0.5 | SHA `4da6f76` |
| 95 | **Bug critique scroll bloqué** — pointer-events: none always | SHA `5b8bcc2` |
| 96 | **Ce document** : audit + update CLAUDE.md onboarding | (en cours) |

## 16. Hors scope phase actuelle — TODO Phase 2+

- [ ] **Porter `claude_design/Boarding Pass.html`** en TSX (mock Claude Design 837 lignes, gardé pour Phase 2)
- [ ] **Adapter `/trip/new`** au fond noir (cohérence cross-routes redesign)
- [ ] **Harmoniser les 8 autres routes voyage-pivot** au fond noir si Matteo valide la bascule complète vers redesign
- [ ] **Re-intégrer TripCards historique** sur la home noir (actuellement retirés temporairement, espace `min-h-[120vh]` à remplir)
- [ ] **Tests** : aucun test unitaire/E2E pour l'instant. À considérer pour Vitest + Playwright avant deploy production
- [ ] **CI** : pas de GitHub Actions workflow. Build Vercel = seul CI actuel. Si on veut un workflow lint+test pré-merge, à setup
- [ ] **Backend solveur réel** : hors scope master maquette. Si Matteo veut étendre projet → API TSP (probablement Python + OR-Tools)

## 17. Roadmap potentielle

### Phase 2 — Cohérence redesign noir
1. Port Boarding Pass.html → composant TSX réutilisable
2. Adapter `/trip/new` fond noir + formulaire Split-Flap-themed
3. Re-intégrer TripCards historique sur home noir
4. Audit a11y cross-route (focus rings sur dark, tab order)

### Phase 3 — Production
1. Merger `feat/cascade-screens-voyage-pivot` dans `main` (PR via `gh pr create` + `gh pr merge --merge`)
2. Promotion deploy Vercel production
3. Lien production stable à communiquer (probablement `smart-traveler.vercel.app` ou domain custom)

### Phase 4 — Tests (optionnel)
1. Vitest + React Testing Library pour composants critiques (SplitFlap, FormField, hooks)
2. Playwright pour E2E flow user (composition voyage → recap → result → export)

---

## Pointer Obsidian pour traçabilité

Tous les ordres journaliers de Matteo à Claudette tracés dans `~/obsidian-vault/03-Claude/orders/`. Pour les ordres SmartTraveler du 20/05/2026, le pattern de nom est `2026-05-20-HHMM-claudette-<short-description>.md`. Lecture utile pour une future instance qui veut comprendre les itérations, les feedbacks Matteo, et les root causes des fixes.

**Branche active** : `feat/cascade-screens-voyage-pivot` (commit terminal `5b8bcc2`).
**URL preview** : https://smart-traveler-git-feat-casca-e80c52-matteo-lepietre-s-projects.vercel.app
