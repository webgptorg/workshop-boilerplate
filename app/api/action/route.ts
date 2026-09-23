import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { DATABASE, getData, getUser } from "@/lib/database";
import { mutate } from "@/lib/mutations";
import { AppError } from "@/src/errors/app-error";
import type { User } from "@/lib/types";
export const runtime = "nodejs";
const DEMO_PASSWORDS: Record<string, string> = {
  adam: "adam123",
  jidelna: "jidelna123",
  petra: "petra123",
};
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      throw new AppError("Požadavek pochází z jiné stránky.", 403);
    const BODY: Record<string, unknown> = await request.json();
    const COOKIE_STORE = await cookies();
    const TOKEN = COOKIE_STORE.get("stul-session")?.value;
    let user = getUser(TOKEN);
    if (BODY.action === "login") {
      const USERNAME = String(BODY.username);
      if (
        !Object.hasOwn(DEMO_PASSWORDS, USERNAME) ||
        DEMO_PASSWORDS[USERNAME] !== BODY.password
      )
        throw new AppError("Nesprávné uživatelské jméno nebo heslo.", 401);
      user = DATABASE.prepare("SELECT * FROM users WHERE username = ?").get(
        USERNAME,
      ) as User;
      const SESSION = randomBytes(32).toString("hex");
      DATABASE.prepare(
        "DELETE FROM sessions WHERE expires < ? OR token = ?",
      ).run(Date.now(), TOKEN || "");
      DATABASE.prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(
        SESSION,
        user.id,
        Date.now() + 86400000,
      );
      COOKIE_STORE.set("stul-session", SESSION, {
        httpOnly: true,
        sameSite: "lax",
        secure: new URL(request.url).protocol === "https:",
        path: "/",
        maxAge: 86400,
      });
    } else if (BODY.action === "logout") {
      DATABASE.prepare("DELETE FROM sessions WHERE token = ?").run(TOKEN || "");
      COOKIE_STORE.delete("stul-session");
      user = null;
    } else {
      if (!user) throw new AppError("Pro uložení změny se přihlaste.", 401);
      mutate(user, BODY);
    }
    return Response.json(getData(user));
  } catch (error) {
    if (error instanceof AppError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error(error);
    return Response.json(
      { error: "Změnu se nepodařilo uložit. Zkuste to znovu." },
      { status: 500 },
    );
  }
}
