import { ConstraintsEditor } from "@/components/voyage/constraints-editor";

/**
 * /trip/[id]/constraints — étape 3 sur 3 de la cascade.
 *
 * Server component minimal : extrait l'id et délègue à un client wrapper
 * qui gère l'hydratation Zustand + l'état local des contraintes.
 *
 * Pattern Next 16 : PageProps<"/trip/[id]/constraints"> + await props.params.
 */
export default async function TripConstraintsPage(
  props: PageProps<"/trip/[id]/constraints">
) {
  const { id } = await props.params;
  return <ConstraintsEditor tripId={id} />;
}
