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
