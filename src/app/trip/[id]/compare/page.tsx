import { notFound } from "next/navigation";
import { getTripById } from "@/mocks/trips";
import { TopNav } from "@/components/voyage/top-nav";
import { CompareView } from "@/components/voyage/compare-view";

export default async function TripComparePage(
  props: PageProps<"/trip/[id]/compare">
) {
  const { id } = await props.params;
  const trip = getTripById(id);
  if (!trip) notFound();

  return (
    <>
      <TopNav />
      <CompareView trip={trip} />
    </>
  );
}
