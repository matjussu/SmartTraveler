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
