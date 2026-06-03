import { TopNav } from "@/components/voyage/top-nav";
import { EditView } from "@/components/voyage/edit-view";

/**
 * /trip/[id]/edit — édition complète d'un voyage existant.
 *
 * Server component minimal qui délègue à <EditView /> client.
 * L'hydratation du trip se fait dans le client (store Zustand persisté
 * localStorage) — un fallback "Voyage introuvable" s'affiche si l'id
 * n'existe pas une fois hydraté.
 */
export default async function TripEditPage(
  props: PageProps<"/trip/[id]/edit">
) {
  const { id } = await props.params;
  return (
    <>
      <TopNav variant="dark" />
      <EditView tripId={id} />
    </>
  );
}
