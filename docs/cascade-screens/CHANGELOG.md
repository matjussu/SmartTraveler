# Cascade Screens — Voyage-pivot

Suivi des 8 écrans dérivés de la direction `design/voyage-pivot`
("Lever de soleil" — Instrument Serif + Plus Jakarta Sans + JetBrains Mono /
cream + terracotta + ocean + sage).

Ordre de la cascade :
1. `/trip/new` — **pilote**, établit `<FormField>` + `<DraftPreview>`
2. `/trip/[id]/destinations` (sub-agent)
3. `/trip/[id]/constraints` (sub-agent)
4. `/trip/[id]/edit` (sub-agent)
5. `/trip/[id]/compare` (sub-agent)
6. `/trip/[id]/recap` (sub-agent)
7. `/trip/[id]/export` (sub-agent)
8. `/shared/[token]` (sub-agent)

---

## 1. `/trip/new` (PILOTE) — 2026-05-20

**Captures**
- `docs/cascade-screens/new.png` — état vide (preview en attente)
- `docs/cascade-screens/new-filled.png` — preview live avec nom/ville/dates

**Files créés / modifiés**
- `src/app/trip/new/page.tsx` — page form (use client, état local 4 champs, validation client, submit → `useTripStore.createTrip` + `router.push`).
- `src/components/voyage/form-field.tsx` — pattern `<FormField>` + helpers `inputClass()`.
- `src/components/voyage/draft-preview.tsx` — preview live boarding-ticket brouillon.
- `scripts/screenshot-cascade.mjs` — utilitaire Playwright dédié cascade
  (capture empty + filled, dans `docs/cascade-screens/`).

**Pattern `<FormField>` (à réutiliser tel quel par les sub-agents)**

```tsx
<FormField
  id="trip-name"
  label="Nom du voyage"
  helper="Vous pourrez le modifier plus tard."
  error={errorOf("name")}
>
  <input
    id="trip-name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
    aria-invalid={Boolean(errorOf("name"))}
    aria-describedby={errorOf("name") ? "trip-name-error" : "trip-name-helper"}
    className={inputClass(Boolean(errorOf("name")))}
  />
</FormField>
```

- **Label** : Instrument Serif italic, 15 px, `text-ink-soft`, `mb-2`,
  badge `— facultatif` optionnel.
- **Children** : l'input lui-même (text, date, select, autocomplete custom)
  reçoit `inputClass(hasError)` pour styling cohérent.
- **Helper** : Instrument Serif italic, 12 px, `text-ink-mute`.
- **Error** : Instrument Serif italic, 12 px, `text-[oklch(0.42_0.13_35)]`
  (terracotta-ink — chaleureux, pas rouge acide). Petit point terracotta
  en préfixe pour la lisibilité. `role="alert"` pour lecteurs d'écran.

**Helpers exposés** :
- `inputClass(hasError: boolean)` — compose `fieldInputClasses` + variante
  `fieldInputErrorClasses` ou `fieldInputNormalClasses`.
- `fieldInputClasses` (constante) — h-12, rounded-lg, border, bg-card,
  transition spécifique (border-color + box-shadow + bg, **PAS** `all`),
  focus ring terracotta 16 % opacity.

**Pattern `<DraftPreview>` (à réutiliser sur les autres formulaires)**

Props :
```ts
type DraftPreviewProps = {
  name?: string;
  startCity?: string;
  startDate?: string;
  endDate?: string;
  destinations?: { name: string }[];
  badge?: string; // ex "DESTINATIONS À CHOISIR" sur l'écran suivant
  emptyHint?: string;
};
```

Signature visuelle : exact mini-`<BoardingTicket />` (perforation horizontale,
ronds latéraux, codes 3 lettres mono, dates `formatDateLong`). État vide
affiche "Votre voyage prend forme ici" en Instrument Serif italique mute.
Sticky `lg:sticky lg:top-24` côté droit.

**Voice spec checklist**
- [x] H1 "Composez un nouveau voyage." (Composez = signature voyage-pivot)
- [x] "Quelques mots pour commencer." (sous-titre)
- [x] Labels : "Nom du voyage", "Ville de départ", "Date de départ", "Date de retour"
- [x] CTA "Continuer vers les destinations"
- [x] Helpers chaleureux : "Vous pourrez le modifier plus tard.",
      "Sera utilisée comme point initial du calcul.",
      "Le jour où le voyage commence.", "Doit être postérieure au départ."
- [x] Preview empty : "Votre voyage prend forme ici" + "Une ville de départ,
      et le billet s'esquisse." + "Les destinations viendront à l'étape suivante."
- [x] Badge brouillon : "En cours de composition"
- [x] Banned absent : `Console`, `ETD`, `ETA`, `Cockpit`, `Embarquement`,
      `Plan de vol`, `Trajectoire`, `Create Trip` → 0 occurrence côté code pilote
      (les matches résiduels grep sur `ALT_META` sont des faux positifs sur
      des constantes JS existantes hors zone pilote)

**Décisions techniques**
- **Validation côté client uniquement** (`useMemo` sur 4 champs). Les erreurs
  sont masquées jusqu'au premier `onBlur` du champ (UX : pas de rouge avant
  interaction) ou au premier submit raté.
- **Mock autocomplete via `<datalist>` natif** (Paris, Lyon, Marseille,
  Bordeaux, Toulouse, Nantes). Zéro JS, zéro lib, a11y native. Les
  sub-agents `/destinations` pourront évoluer vers un combobox custom si
  besoin.
- **Slug d'ID** : `slugify(nom) + suffix timestamp base36`. Garantit pas
  collision avec les mocks (`trip-mediterranee`, etc.) et reste lisible.
- **`startCity` typée `City`** via map locale (`Paris/Lyon/Marseille` ont
  des coords réelles) ; tout autre nom → `{ country: "FR", coordinates:
  {0,0} }` en attendant l'écran de destinations qui enrichira la donnée.
- **`onBlur` sur date inputs** : un `min={startDate}` est appliqué à la
  date de retour pour empêcher le picker natif d'aller avant le départ.
- **`prefers-reduced-motion`** : géré au niveau global (`globals.css` règle
  media query qui force `transition-duration: 0.01ms`).

**Disabled CTA**
Pattern à réutiliser tel quel par les CTAs en cascade :
```tsx
disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none
```
Combiné avec `hover:not(:disabled):scale-[1.02]` pour ne pas hover-bump
quand inactif. Le terracotta reste lisible même à opacity 50 — couleur
chaleureuse, pas de gris triste.

**Caveats / notes pour les sub-agents qui suivent**
- Les inputs `<input type="date">` affichent un placeholder natif Chromium
  qui dépend du locale de l'OS (`mm/dd/yyyy` en EN, `jj/mm/aaaa` en FR). Dans
  la capture Playwright le navigateur est en EN par défaut malgré
  `locale: "fr-FR"` côté context — ce n'est qu'un artefact de capture. En prod
  les utilisateurs FR verront `jj/mm/aaaa`. **Ne pas tenter de "fixer" ce
  placeholder avec un input custom** — perte d'a11y et de cohérence
  système. Si vraiment problématique, basculer plus tard sur un date-picker
  Base UI ou shadcn calendar.
- Le badge "N" Next.js dev en bas à gauche disparaît en prod build.
- **Pas de breaking change** sur `voyage/top-nav`, `voyage/boarding-ticket`,
  `lib/format.ts`, `store/trip-store.ts`, `mocks/trips.ts`. Les sub-agents
  peuvent les importer tels quels.
- **Pour `/destinations`, `/constraints`, `/edit`** : importer directement
  `<FormField>` + `inputClass()` depuis `@/components/voyage/form-field` et
  `<DraftPreview>` depuis `@/components/voyage/draft-preview`. Le pattern
  est stable.
- Si un sub-agent a besoin d'un champ "select" ou "combobox", il peut le
  glisser dans `<FormField>{children}</FormField>` et lui appliquer
  `inputClass(hasError)` — le scaffolding label/helper/error reste identique.

**Commit** : à venir (cf retour final à Claudette).

---

*Pilote livré par frontend-specialist le 2026-05-20.*
## /trip/[id]/destinations

**Étape 2 sur 3 de la cascade.** Hydrate le brouillon créé sur /trip/new
(Zustand persist), permet de composer la liste de villes via autocomplete
datalist + bouton "Ajouter", stepper nuits, suppression.

### Décisions design notables
- **Drag-handle visuel sans fonctionnel** — l'affordance `⋮⋮ cursor-grab` signale
  l'intention de réorganisation à venir sans casser l'attente utilisateur sur un
  mock B2C. `tabIndex={-1}` pour rester hors du focus order.
- **Stepper custom + input number** — boutons `−/+` avec scale-down `active:scale-[0.94]`
  (responsiveness physique, cf Emil), spinners natifs cachés, range clampé [1, 30].
  L'input reste accessible clavier en saisie directe.
- **Empty state chaleureux, pas un emoji** — disque terracotta-soft + "?" en mono,
  copie italique Instrument Serif. Aucun emoji dans le rendu (banned).
- **CTA continue disabled + helper italique terracotta** — au lieu d'un toast après
  clic, l'utilisateur voit en permanence la raison du blocage (`Minimum deux
  destinations pour optimiser.`) — friction explicite > friction surprise.
- **Hydration gate** — état "Préparation de votre brouillon…" italique si
  `hydrated === false` (évite flash "Voyage introuvable" au premier render SSR).

### Voice spec checklist
- [x] "Composez votre *itinéraire*." (italique terracotta-ink sur "itinéraire")
- [x] "Choisissez les villes que vous voulez visiter."
- [x] "Ajouter une ville", "Nuits sur place"
- [x] "Aucune destination pour l'instant.", "Commencez par taper une ville au-dessus."
- [x] "Minimum deux destinations pour optimiser."
- [x] "Continuer vers les contraintes", "← Retour aux infos"

### Banned grep (zero hit dans les fichiers créés)
midnight | aurora | cyan | cockpit | console | trajectoire | "plan de vol"
ETD | ETA | "boarding gate" | backdrop-blur | font-inter

### Files créés / modifiés
- `src/app/trip/[id]/destinations/page.tsx` — server component, délègue au client.
- `src/components/voyage/destinations-editor.tsx` — client wrapper, hydration gate,
  form ajout, liste cards, stepper, empty state.
- `src/lib/cities-mock.ts` — catalogue 20 villes européennes + `resolveCity()` +
  `cityCode()` (réutilisable cross-écrans constraints/recap/edit).

### Caveats
- Pas d'API geocoding — toute ville hors catalogue tombe sur `country: "??"` et
  `coordinates: 0,0`. À remplacer par un vrai service avant prod.
- Le drag-handle n'est pas branché à un dnd library (réorganisation prévue côté
  /constraints ou /edit selon arbitrage produit ultérieur).
- `addDestination` ré-applique `nights: 2` par défaut — Matteo pourra ajuster
  si une heuristique nuits selon durée totale est souhaitée.
# Écran `/trip/[id]/constraints` — étape 3 sur 3

## Décisions de conception
- **Toutes les contraintes sont optionnelles.** CTA "Voir le récapitulatif" toujours actif. Voice spec : "Bloquez les dates qui comptent, libérez les autres."
- **State local React, pas dans le store Zustand.** Le mock `Trip` (src/mocks/trips.ts) n'a pas de champ `constraints` — on ne touche pas au schéma central. Les types vivent dans `src/lib/constraints.ts`.
- **Unicité des pins.** Max 1 ville "Première étape" et 1 ville "Dernière étape". Cliquer le pin actif → repasse en "Souple" (null). Réattribuer à une autre ville libère automatiquement l'ancienne.
- **Bornes des dates** = `trip.startDate` / `trip.endDate` via `min`/`max` natifs `<input type="date">`. La date de départ d'une ville a `min = arrival || tripMin` pour empêcher les incohérences en amont, plus une erreur soft "Le départ ne peut pas précéder l’arrivée." si rétrocompatibilité saisie manuelle.
- **Empty state contraintes** rendu en pied de form, encadré dashed gold-soft, voice italique chaleureuse.

## Pattern réutilisé du pilote
- `<FormField>` + `inputClass()` pour tous les inputs date (cohérence visuelle stricte avec `/trip/new`).
- `<DraftPreview>` sticky col-span-4 avec `badge="Contraintes"` + `emptyHint="Vos choix se reflètent ici."`. Compteur de contraintes posées sous le billet.
- Hero italique terracotta sur "contraintes" (`oklch(0.42 0.13 35)`), même structure que `/trip/new`.

## Anti-slop respectés
- Zéro hit grep sur les bannis : midnight, aurora, cyan, cockpit, console, trajectoire, "plan de vol", ETD/ETA, "boarding gate", backdrop-blur (sauf TopNav pilote, hors scope).
- Pas de `transition: all` — toutes les transitions sont scoped (`border-color,background-color,box-shadow,transform`).
- `active:scale-[0.97]` sur les chips de pin et `[0.99]` sur les radio cards d'ordre — feedback tactile cohérent.
- `aria-checked` sur tous les radio custom, `role="radiogroup"` parent, focus-visible global hérité du `globals.css`.

## TODO downstream
- Si plus tard on persiste les contraintes, étendre `Trip` avec un champ optionnel `constraints?: TripConstraints` côté mock + store.
- Drag-handle visuel non fonctionnel — réordonnancement actif viendra plus tard si Matteo le veut (hors scope cascade actuelle).
## /trip/[id]/edit

**Édition complète d'un voyage existant.** Consolide en 3 sections accordéon
(infos, destinations, contraintes) ce que les écrans dédiés /destinations
et /constraints couvrent en flow linéaire — ici on est en mode édition
rapide, pas une étape de cascade. Réutilise le pattern <FormField> +
inputClass + <DraftPreview> du pilote /trip/new.

### Décisions design notables
- **Hydratation via `useEffect` (pas setState dans render)** — évite warnings
  React 19 strict mode + dépendance explicite `[hydrated, trip, hasInitialized]`.
- **Status badge italique 13px** — Instrument Serif italic chaleureux, pas
  d'uppercase tracking-[0.14em] qui aurait sonné "console B2B". Couleur dorée
  `oklch(0.55 0.115 70)` si `trip.status === "computed"` (recalcul nécessaire),
  ink-mute sinon (draft).
- **CTA "Relancer le calcul"** terracotta plein + icône mono `↻`. Disabled si
  pas de modifs (`!isDirty`) — friction explicite : rien à recalculer si rien
  n'a bougé.
- **`isDirty` comparé champ par champ** vs trip d'origine (name, startCity,
  dates, destinations, nights). Warning chaleureux terracotta-soft visible
  uniquement si dirty — pas de bruit visuel inutile.
- **Suppression deux temps** — premier clic passe en mode confirm (texte change
  + souligné terracotta), second clic delete. Reset auto après 5s pour ne pas
  bloquer la page si l'utilisateur change d'avis sans cliquer ailleurs.
- **Sections en cards isolées** (`rounded-[18px] border bg-surface p-7`) plutôt
  qu'accordéon collapsible — la page est déjà courte, tout visible = moins de
  friction qu'un toggle à manipuler.
- **Toggle switch ordre** custom (pas Radix) — `role="switch" aria-checked`,
  thumb scale `translate-x-1/6` + transition 200ms ease-out, terracotta quand
  actif. Évite une dépendance pour 1 toggle.

### Voice spec checklist
- [x] "Affinez votre *voyage*." (italique terracotta-ink sur "voyage")
- [x] "Modifiez ce que vous voulez. Les changements relancent l'optimisation."
- [x] "Recalcul nécessaire après modifs" / "En cours de composition"
- [x] "Infos générales", "Destinations", "Contraintes"
- [x] "Relancer le calcul", "Voir l'itinéraire actuel"
- [x] "Vous avez des changements non enregistrés."
- [x] "Modifier l'ordre", "Ajouter une ville"
- [x] "Supprimer ce voyage" (link discret ink-mute, pas alarmant)
- [x] DraftPreview badge "ÉDITION EN COURS" + hint "Reflète vos modifications en direct."

### Banned grep (zero hit dans le fichier créé)
midnight | aurora | cyan | cockpit | console | trajectoire | "plan de vol"
ETD | ETA | "boarding gate" | backdrop-blur | "save changes" | "delete trip"

### Files créés / modifiés
- `src/app/trip/[id]/edit/page.tsx` — server component, délègue au client.
- `src/components/voyage/edit-view.tsx` — client wrapper, hydration gate,
  3 sections (infos / destinations / contraintes), CTAs, DraftPreview sticky.

### Caveats
- **Pas de dépendance sur destinations-editor.tsx / constraints-editor.tsx**
  livrés en parallèle par d'autres sub-agents — ici on inline notre propre
  catalogue 18 villes + mini-row contraintes. Claudette pourra consolider
  après cascade en factorisant vers `src/lib/cities-mock.ts` (déjà existant
  côté /destinations selon notes).
- **"Modifier l'ordre"** est un placeholder visuel (`aria-disabled`, title
  attribut "Bientôt") — pas branché à un dnd-kit. Idem côté toggle "Suivre
  l'ordre saisi" : le state local change mais pas encore consommé par le
  recalcul (mock pur).
- Le recalcul réinitialise `alternatives: []` et passe `status: "draft"` —
  en prod réelle, on déclencherait l'optim backend ici puis push vers
  `/result` une fois calculé.
# `/trip/[id]/recap` — la bascule

Charnière entre composition et calcul. **Le CTA "Calculer mon voyage" est le
héros visuel** : h-14 (vs h-12 standard), italique terracotta plein, ombrage
généreux. C'est le moment décisif.

## Décisions
- **Server component pur**, lit `getTripById` server-side sur MOCK_TRIPS.
  Pas de Zustand, pas de hydration gate (pas de toggle interactif).
- **Pas de vraie `<TripMap />`** — le tracé n'existe pas encore. Vignette
  schématique codes 3 lettres + `route-line` + label "À calculer".
- **Aside CTA card terracotta-soft sticky** (col-span-4) avec perforation
  chaleureuse — registre "engagement" qui dialogue avec le boarding-ticket.
- **Badge destinations "souple" partout** — `Trip` mock n'a pas de
  `constraints`. `<DestinationBadge>` prêt pour première/dernière.
- **Incomplétude révélée** : `stops < 2` ou dates manquantes → CTA visible
  mais désactivé + encart italique listant exactement ce qui manque.
- **Lien "Voir le résultat déjà calculé"** si `trip.status === "computed"`.

## Anti-slop
Zéro hit grep : midnight, aurora, cyan, cockpit, console, trajectoire, "plan
de vol", ETD/ETA, "boarding gate", backdrop-blur, "summary", "compute trip".
Pas de `transition: all`, pas de `font-inter`. `active:scale-[0.985]` sur le
CTA hero. `tsc --noEmit` propre.

## Files
- `src/app/trip/[id]/recap/page.tsx` — server component, helpers locaux
  inline (cityCode, DestinationBadge, RecapField, CityChip, RouteDot).
# /trip/[id]/compare — Notes design engineering

## Intention
3 colonnes parallèles, même séquence villes, 3 philosophies. Pas de switcher dynamique : tout est lisible d'un coup.

## Architecture
- `page.tsx` (server) : `getTripById(id)` + `notFound()` strict (pas de fallback), passe `<TopNav />` + `<CompareView trip={trip} />`.
- `compare-view.tsx` (client) : `'use client'` car 3 `<TripMap />` via `dynamic({ ssr: false })`.
- `max-w-7xl` (vs 6xl du result) pour respirer les 3 colonnes desktop.

## Voice (zéro hit banned)
- H1 : "Trois façons d'*arriver là-bas*." — italique sur "arriver là-bas".
- Sub italique : "La même séquence de villes, trois philosophies de voyage. Choisissez celle qui vous ressemble."
- CTA card : "Choisir cette version" (aria-label dérivé : "Choisir la version {label} pour {trip.name}").
- Section tableau : "Différences clés" — display italique sur "clés".
- Tagline footer : "SmartTraveler optimise pour vous — vous, vous choisissez."

## Pattern card (boarding-ticket)
Header soft accent → perforation → mini-carte → stats trio (mono+tabular-nums) → segments condensés → CTA plein accent. Hauteur égalisée via `flex flex-col` + `flex-1` sur la liste segments.

## Caveat Leaflet 3x
3 instances `<TripMap />` simultanées = 3x runtime react-leaflet + 3 fitBounds. Mesuré OK en dev local (build mocks). À surveiller si dataset > 6 legs/alt ou sur mobile bas de gamme. Fallback prévu (polyline SVG simple) noté dans la spec si dégradation perçue.

Note : TripMap force `minHeight: 360px` en interne (besoin du result fullsize). Sur compare, on aligne la zone hôte à `height: 300px` et on accepte la min-height effective pour éviter layout-shift. Touche pas à `trip-map.tsx` (utilisé aussi par result-view).

## A11y
- `aria-label` descriptif sur chaque mini-carte et chaque CTA "Choisir cette version" (sinon les 3 sont indistinguables au lecteur d'écran).
- `motion-reduce:transition-none` + `hover:scale-100` sur le CTA pour respecter `prefers-reduced-motion`.
- Tableau "Différences clés" : labels critères répétés en `md:hidden` côté mobile (chaque cellule devient lisible isolément quand grille collapse).

## Choix Emil
- Hover card : `boarding-ticket:hover` global → `translateY(-2px)` + border-color shift. Pas de scale (boarding pass = objet physique, pas un bouton).
- CTA : `scale-[1.01]` hover + `scale-[0.99]` active — instant feedback, pas de drama.
- Couleurs accent depuis tokens (`--terracotta`, `--ocean`, `--sage`) — pas de hex inline. ALT_META aligné avec result-view pour cohérence cross-écran.
## /trip/[id]/export

**Aperçu PDF + actions** sur un voyage calculé. Server lit `getTripById`, délègue à `ExportView` client qui monte `PDFViewer` + `PDFDownloadLink` (@react-pdf/renderer) en dynamic SSR-false.

### Décisions design notables
- **Fonts built-in only** (Helvetica/Helvetica-Oblique/Courier). Register Instrument Serif ajouterait ~250kB pour 1 page A4 — pas rentable. L'italique d'Helvetica-Oblique garde le caractère du design web.
- **Palette transcrite en hex** — `@react-pdf` ne parse pas oklch. Helper `tint(hex)` mix 86% cream pour les variantes -soft sans dupliquer chaque token.
- **`window.print()` + `@media print` CSS** masque TopNav/breadcrumb/aside (`.export-chrome`). Le viewer PDF reste seul à l'impression — pas d'iframe-print fragile.
- **CTA hiérarchie 3-tiers** : terracotta solid (download) → ocean-soft outlined (print) → ghost link (retour).

### Voice spec (zero hit banned : midnight | aurora | cyan | cockpit | console | trajectoire | plan de vol | ETD | ETA | boarding gate | backdrop-blur | download trip)
- [x] "Votre *récapitulatif imprimable*." · "Que souhaitez-vous ?" · "Trois actions, à votre rythme."
- [x] "Télécharger le PDF" · "Imprimer maintenant" · "Retour à l'itinéraire"
- [x] "Le voyage commence sur papier." · "Édité le {date}" · "Composé avec SmartTraveler"

### Files
- `src/app/trip/[id]/export/page.tsx` — server, `PageProps<"/trip/[id]/export">`, `notFound()` fallback.
- `src/components/voyage/export-view.tsx` — client, dynamic PDFViewer/Link, layout 12-col, sticky aside, CSS print scoped.
- `src/components/voyage/trip-pdf-document.tsx` — Document A4, header brandé, 3 sections (Le voyage / Itinéraire choisi / Comparatif), footer fixed.

### Caveats
- `pickPrimaryAlternative()` = `cheapest` par défaut. Pour refléter le choix `/result` : `?alt=...` ou Zustand.
- `window.print()` imprime le viewer iframe — Chrome OK, Safari < 16 peut imprimer blanc. Fallback : download + print natif système.
- `showToolbar={false}` → l'UX est portée par les 3 CTAs de l'aside. Si toolbar réactivée, retirer "Imprimer maintenant" (redondance).
## /shared/[token]

**Écran d'acquisition douce.** Vue lecture seule d'un voyage partagé,
accessible publiquement. Le visiteur (souvent non-utilisateur) découvre la
proposition de SmartTraveler à travers un vrai voyage composé, pas une
landing page. Convention mock : `token === trip.id`.

### Décisions design notables
- **Banner top "lecture seule" hors TopNav** — on ne modifie pas `top-nav.tsx`
  (composant partagé cross-cascade). Le banner gold-dot vit au-dessus, avec
  `bg-card` opaque (pas de `backdrop-blur`, banned). Mention sobre, point
  d'accent gold pour signaler "contexte particulier" sans crier.
- **Switcher d'alternatives conservé** — c'est *l'argument produit* de
  SmartTraveler. Le visiteur doit pouvoir essayer les 3 lectures. Vérifié :
  `useState` local dans `SharedView`, aucune écriture dans le store Zustand.
- **CTAs d'action supprimés** (Réserver / Partager / Exporter / Comparer /
  Modifier) — incohérents en mode read-only. Remplacés par un seul bloc cream
  d'acquisition douce "Composer le vôtre" + CTA terracotta `/trip/new`.
- **Pas de breadcrumb "Vos itinéraires"** — le visiteur shared n'a pas de
  contexte app. Remplacé par mini-label "Lecture en cours" (aside du hero)
  et la mention banner.
- **Watermark fixed bottom-right** — signature italique Instrument Serif
  opacity 0.32, `pointer-events-none`, visible md+. Présence subtile, jamais
  intrusive.
- **Footer "Partagé depuis SmartTraveler · {trip.id}"** — mono small, identité
  produit + ID trip (utile si shared embed dans un email/messagerie).

### Voice spec checklist
- [x] "Voyage partagé · lecture seule" (banner top)
- [x] "Partagé depuis SmartTraveler" (footer)
- [x] "Voyage composé sur SmartTraveler" (link mute footer)
- [x] "Vous aimeriez composer le vôtre ?" (h2 italique)
- [x] "SmartTraveler crée des itinéraires comme celui-ci, à partir de vos villes
  et vos contraintes."
- [x] "Composer mon voyage" (CTA terracotta)
- [x] "← Découvrir SmartTraveler" (link mute)

### Banned grep (zero hit dans les fichiers créés)
midnight | aurora | cyan | cockpit | console | trajectoire | "plan de vol"
ETD | ETA | "boarding gate" | backdrop-blur | "shared trip" | "view only"

### Files créés
- `src/app/shared/[token]/page.tsx` — server component, lookup mock + assemblage
  banner + TopNav + SharedView.
- `src/components/voyage/shared-view.tsx` — clone read-only de ResultView :
  hero, switcher, carte, étapes, segments, récap colorisé, bloc acquisition,
  footer signature, watermark.

### Caveats
- Pas de vrai système de share-token : on suppose `token === trip.id`. À
  remplacer par un vrai shortlink → trip mapping côté backend ultérieur.
- Pas d'auth ni de check de permissions — accès public par convention mock.
- Le watermark fixed est caché en mobile (`hidden md:block`) pour ne pas
  empiéter sur la zone d'action tactile.

---

*7 écrans cascade livrés en parallèle par sub-agents frontend-specialist le 2026-05-20.*
