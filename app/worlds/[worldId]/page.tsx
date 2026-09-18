import { WorldEntry } from "@/components/game/world-entry";

export default async function WorldPage({ params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = await params;
  return <WorldEntry key={worldId} worldId={worldId} />;
}
