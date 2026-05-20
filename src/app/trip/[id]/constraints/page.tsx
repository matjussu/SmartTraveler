export default async function TripConstraintsPage(
  props: PageProps<"/trip/[id]/constraints">
) {
  const { id } = await props.params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contraintes</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Route <code className="font-mono">/trip/{id}/constraints</code> — placeholder. Cascade frontend à venir.
      </p>
    </main>
  );
}
