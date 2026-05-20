export default async function SharedTripPage(
  props: PageProps<"/shared/[token]">
) {
  const { token } = await props.params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Voyage partagé</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Route <code className="font-mono">/shared/{token}</code> — placeholder lecture seule. Cascade frontend à venir.
      </p>
    </main>
  );
}
