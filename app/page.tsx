import { cookies } from "next/headers";
import { getData, getUser } from "@/lib/database";
import { Dashboard } from "@/components/dashboard";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function Home() {
  const TOKEN = (await cookies()).get("stul-session")?.value;
  return <Dashboard initialData={getData(getUser(TOKEN))} />;
}
