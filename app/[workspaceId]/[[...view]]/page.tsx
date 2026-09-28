import { MinuteApp } from "@/components/minute/minute-app";
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string; view?: string[] }>;
}) {
  const { workspaceId, view } = await params;
  return <MinuteApp workspaceId={workspaceId} view={view} />;
}
