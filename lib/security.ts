import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { AppError } from "../src/errors/app-error";
const SCRYPT = promisify(scryptCallback);
export function createToken(): string { return randomBytes(32).toString("base64url"); }
export function hashToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }
export async function hashPassword(password: string): Promise<string> {
  const SALT = randomBytes(16).toString("hex");
  const KEY = await SCRYPT(password, SALT, 64) as Buffer;
  return `scrypt$${SALT}$${KEY.toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [ALGORITHM,SALT,EXPECTED] = encoded.split("$");
  if (ALGORITHM !== "scrypt" || !SALT || !EXPECTED) return false;
  const ACTUAL = await SCRYPT(password,SALT,64) as Buffer;
  const EXPECTED_BUFFER = Buffer.from(EXPECTED,"hex");
  return EXPECTED_BUFFER.length === ACTUAL.length && timingSafeEqual(ACTUAL,EXPECTED_BUFFER);
}
export function enforceRateLimit(database: import("node:sqlite").DatabaseSync, key: string, limit = 10, windowMs = 15 * 60_000): void {
  const DATABASE = database;
  const HASH = hashToken(key);
  const NOW = Date.now();
  const EXISTING = DATABASE.prepare("SELECT attempts,window_started FROM rate_limits WHERE key_hash=?").get(HASH) as {attempts:number;window_started:number}|undefined;
  const IS_EXPIRED = !EXISTING || NOW - EXISTING.window_started >= windowMs;
  if (!IS_EXPIRED && EXISTING.attempts >= limit) throw new AppError("Příliš mnoho pokusů. Zkuste to později.",429);
  DATABASE.prepare("INSERT INTO rate_limits(key_hash,attempts,window_started) VALUES(?,?,?) ON CONFLICT(key_hash) DO UPDATE SET attempts=excluded.attempts,window_started=excluded.window_started").run(HASH,IS_EXPIRED ? 1 : EXISTING.attempts + 1,IS_EXPIRED ? NOW : EXISTING.window_started);
}
