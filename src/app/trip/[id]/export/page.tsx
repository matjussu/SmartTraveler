import { notFound } from "next/navigation";
import { getTripById } from "@/mocks/trips";
import { TopNav } from "@/components/voyage/top-nav";
import { ExportView } from "@/components/voyage/export-view";

export default async function TripExportPage(
  props: PageProps<"/trip/[id]/export">
) {
  const { id } = await props.params;
  const trip = getTripById(id) ?? getTripById("trip-mediterranee");
  if (!trip) notFound();

  return (
    <>
      <TopNav />
      <ExportView trip={trip} />
    </>
  );
}
