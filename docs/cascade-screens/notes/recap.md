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
