import { DestinationsEditor } from "@/components/voyage/destinations-editor";

/**
 * /trip/[id]/destinations — étape 2 de la cascade voyage-pivot.
 *
 * Server component minimal : extrait l'id depuis params puis délègue
 * au client wrapper qui ré-hydrate le brouillon depuis Zustand persist.
 *
 * Pas de getTripById ici : la source de vérité est le store côté client
 * (le brouillon a été créé sur /trip/new qui n'écrit que côté client).
 */
export default async function TripDestinationsPage(
  props: PageProps<"/trip/[id]/destinations">
) {
  const { id } = await props.params;
  return <DestinationsEditor tripId={id} />;
}
