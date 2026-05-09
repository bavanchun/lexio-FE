/**
 * /decks/[id] — placeholder until phase-07 implements deck detail view.
 */
interface DeckDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Deck {id}</h1>
      <p className="text-muted-foreground">Deck detail view coming in phase 07.</p>
    </div>
  );
}
