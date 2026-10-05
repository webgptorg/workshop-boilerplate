import { spawn } from "node:child_process";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { createSupabaseDatabase } from "./database/supabase-database";

async function run() {
  const DATABASE = await createSupabaseDatabase();
  const SERVER = new PGLiteSocketServer({ db: DATABASE, port: 0, host: "127.0.0.1" });
  await SERVER.start();
  try {
    const CHILD = spawn(process.execPath, [require.resolve("@playwright/test/cli"), "test", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: {
        ...process.env,
        SUPABASE_DATABASE_URL: `postgresql://postgres:postgres@${SERVER.getServerConn()}/postgres`,
        SUPABASE_DATABASE_CA: "",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "isolated-browser-test-key",
        SUPABASE_SECRET_KEY: "", DB_SEED_TEST_USER: "true",
      },
    });
    const stop = () => CHILD.kill("SIGTERM");
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    try {
      process.exitCode = await new Promise<number>((resolve, reject) => {
        CHILD.once("error", reject);
        CHILD.once("exit", (code) => resolve(code ?? 1));
      });
    } finally {
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
    }
  } finally { await SERVER.stop(); await DATABASE.close(); }
}
void run().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
