export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { migrateDatabase } = await import("./lib/database/startup");
      await migrateDatabase();
    } catch (error) {
      console.error("Database initialization failed; application startup aborted.", error instanceof Error ? error.message : "Unknown migration error");
      // Next can leave a listening but unprepared server after a rejected hook.
      // Exit so the deployment never appears healthy and can restart after a fix.
      process.exit(1);
    }
  }
}
