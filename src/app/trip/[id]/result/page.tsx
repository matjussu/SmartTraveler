import { TopNav } from "@/components/voyage/top-nav";
import { ResultGate } from "@/components/voyage/result-view";

export default async function TripResultPage(
  props: PageProps<"/trip/[id]/result">
) {
  const { id } = await props.params;
  return (
    <>
      <TopNav variant="dark" />
      <ResultGate tripId={id} />
    </>
  );
}
