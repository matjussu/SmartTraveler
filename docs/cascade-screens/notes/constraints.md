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
