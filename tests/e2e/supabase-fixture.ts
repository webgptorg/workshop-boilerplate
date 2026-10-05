import type { BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createMigratedDatabase } from "../database/supabase-database";

interface TestUser { id: string; email: string; raw_user_meta_data: Record<string, string>; created_at: string }
const SUPABASE_URL = "http://127.0.0.1:54321";

function authUser(user: TestUser) {
  return { ...user, aud: "authenticated", role: "authenticated", user_metadata: user.raw_user_meta_data,
    app_metadata: { provider: "email", providers: ["email"] }, identities: [], updated_at: new Date().toISOString() };
}
function session(user: TestUser) {
  const PAYLOAD = Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  return { access_token: `eyJhbGciOiJIUzI1NiJ9.${PAYLOAD}.test`, refresh_token: randomUUID(), token_type: "bearer",
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: authUser(user) };
}

export async function mockSupabase(context: BrowserContext) {
  const DATABASE = await createMigratedDatabase();
  const TOKENS = new Map<string, TestUser>();
  await context.route(`${SUPABASE_URL}/**`, async (route) => {
    const REQUEST = route.request();
    const URL = new globalThis.URL(REQUEST.url());
    if (REQUEST.method() === "OPTIONS") { await route.fulfill({ status: 204 }); return; }
    try {
      if (URL.pathname === "/auth/v1/settings") {
        await route.fulfill({ json: { mailer_autoconfirm: true, disable_signup: false } }); return;
      }
      const BODY = REQUEST.postDataJSON();
      const TOKEN = REQUEST.headers().authorization?.replace(/^Bearer /, "");
      const USER = TOKEN ? TOKENS.get(TOKEN) : undefined;
      if (URL.pathname === "/auth/v1/token" || URL.pathname === "/auth/v1/signup") {
        if (URL.pathname.endsWith("signup")) {
          await DATABASE.query(`insert into auth.users (id,email,encrypted_password,raw_user_meta_data,created_at)
            values ($1,$2,extensions.crypt($3,extensions.gen_salt('bf')),$4,now())`,
          [randomUUID(), BODY.email, BODY.password, JSON.stringify(BODY.data)]);
        }
        const { rows } = await DATABASE.query<TestUser>(`select id,email,raw_user_meta_data,created_at from auth.users
          where email=$1 and encrypted_password=extensions.crypt($2,encrypted_password)`, [BODY.email, BODY.password]);
        if (!rows[0]) { await route.fulfill({ status: 400, json: { code: "invalid_credentials", msg: "Invalid login credentials" } }); return; }
        const SESSION = session(rows[0]);
        TOKENS.set(SESSION.access_token, rows[0]);
        await route.fulfill({ json: SESSION }); return;
      }
      if (!USER) { await route.fulfill({ status: 401, json: { message: "Authentication required" } }); return; }
      if (URL.pathname === "/auth/v1/logout") {
        TOKENS.delete(TOKEN!);
        await route.fulfill({ status: 204 }); return;
      }
      if (URL.pathname === "/auth/v1/user") { await route.fulfill({ json: authUser(USER) }); return; }
      const RESULT = await DATABASE.transaction(async (transaction) => {
        await transaction.exec("set local role authenticated");
        await transaction.query("select set_config('request.jwt.claim.sub',$1,true)", [USER.id]);
        if (URL.pathname === "/rest/v1/rpc/saveAppData") {
          const { rows } = await transaction.query<{ revision: number }>(
            'select public."saveAppData"($1::jsonb,$2) as revision', [JSON.stringify(BODY.state), BODY.expectedRevision]);
          return rows[0].revision;
        }
        const TABLE = URL.pathname === "/rest/v1/User" ? '"User"' : '"AppData"';
        const { rows } = await transaction.query(`select * from public.${TABLE}`);
        return REQUEST.headers().accept?.includes("application/vnd.pgrst.object+json") ? rows[0] : rows;
      });
      await route.fulfill({ json: RESULT });
    } catch (error) {
      const CODE = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
      await route.fulfill({ status: CODE === "40001" ? 409 : 400, json: { code: CODE, message: "Database request rejected" } });
    }
  });
  return DATABASE;
}
