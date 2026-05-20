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
