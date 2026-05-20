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
