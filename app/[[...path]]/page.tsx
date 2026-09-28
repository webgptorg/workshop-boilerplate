import { AppShell } from "@/components/app-shell";

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return <AppShell path={path} />;
}
