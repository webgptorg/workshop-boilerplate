import { Workspace } from "@/components/workspace";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Workspace today={new Date().toISOString()} />;
}
