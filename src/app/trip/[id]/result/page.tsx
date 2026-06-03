import { notFound } from "next/navigation";
import { getTripById } from "@/mocks/trips";
import { TopNav } from "@/components/voyage/top-nav";
import { ResultView } from "@/components/voyage/result-view";

export default async function TripResultPage(
  props: PageProps<"/trip/[id]/result">
) {
  const { id } = await props.params;
  const trip = getTripById(id) ?? getTripById("trip-mediterranee");
  if (!trip) notFound();

  return (
    <>
      <TopNav variant="dark" />
      <ResultView trip={trip} />
    </>
  );
}
