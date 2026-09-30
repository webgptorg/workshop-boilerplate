export async function register() {
  // Builds have no database side effects. Every runtime instance must migrate before serving.
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { migrateDatabase } = await import("./lib/database/migrate");
    try {
      const applied = await migrateDatabase();
      if (applied.length) console.info(`Applied database migrations: ${applied.join(", ")}`);
    } catch {
      // Connection errors can include credentials. Keep startup logs free of secrets.
      throw new Error("Database startup failed. Check the connection, TLS certificate, and migration history. See README.md.");
    }
  }
}
