/**
 * /study/[sessionId] — placeholder until phase-08 implements study session UI.
 */
interface StudySessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function StudySessionPage({ params }: StudySessionPageProps) {
  const { sessionId } = await params;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Study session</h1>
      <p className="text-muted-foreground">Session: {sessionId}. Study UI coming in phase 08.</p>
    </div>
  );
}
