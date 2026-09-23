import { cookies } from "next/headers";
import { DATABASE, getData, getUser } from "@/lib/database";
import { mutate } from "@/lib/mutations";
import { AppError } from "@/src/errors/app-error";
import { createToken, enforceRateLimit, hashPassword, hashToken, verifyPassword } from "@/lib/security";
import type { Role } from "@/lib/types";
import { sendEmail } from "@/lib/email";
import { consumePairingCode, registerParentWithCode } from "@/lib/accounts";
export const runtime = "nodejs";
const SESSION_COOKIE = "stul-session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;
function recordAudit(canteenId: number, actorId: number | null, action: string, subjectId: number | null = null) {
  DATABASE.prepare("INSERT INTO audit_log(canteen_id,actor_user_id,action,subject_id,created_at) VALUES(?,?,?,?,?)").run(canteenId,actorId,action,subjectId,Date.now());
}
async function createSession(userId: number, canteenId: number, role: Role, dinerId: number | null, cookieStore: Awaited<ReturnType<typeof cookies>>, request: Request) {
  const TOKEN = createToken();
  DATABASE.prepare("INSERT INTO sessions(token_hash,user_id,expires,active_role,diner_id,canteen_id) VALUES(?,?,?,?,?,?)").run(hashToken(TOKEN),userId,Date.now()+SESSION_DURATION,role,dinerId,canteenId);
  cookieStore.set(SESSION_COOKIE,TOKEN,{httpOnly:true,sameSite:"lax",secure:new URL(request.url).protocol === "https:",path:"/",maxAge:SESSION_DURATION/1000});
}
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) throw new AppError("Požadavek pochází z jiné stránky.",403);
    const BODY: Record<string,unknown> = await request.json();
    const COOKIE_STORE = await cookies();
    const TOKEN = COOKIE_STORE.get(SESSION_COOKIE)?.value;
    let USER = getUser(TOKEN);
    let ONE_TIME_CODE: string | undefined;
    if (BODY.action === "login") {
      const IDENTIFIER = String(BODY.username || BODY.email || "").trim().toLowerCase();
      enforceRateLimit(DATABASE,`login:${request.headers.get("x-forwarded-for") || "unknown"}:${IDENTIFIER}`);
      const ROW = DATABASE.prepare("SELECT * FROM users WHERE (lower(email)=? OR lower(username)=?) AND deleted_at IS NULL").get(IDENTIFIER,IDENTIFIER) as {id:number;password_hash:string|null}|undefined;
      if (!ROW?.password_hash || !(await verifyPassword(String(BODY.password || ""),ROW.password_hash))) throw new AppError("Nesprávné přihlašovací údaje.",401);
      const MEMBERSHIP = DATABASE.prepare("SELECT canteen_id,role FROM user_roles WHERE user_id=? ORDER BY canteen_id,role LIMIT 1").get(ROW.id) as {canteen_id:number;role:Role}|undefined;
      if (!MEMBERSHIP) throw new AppError("Nesprávné přihlašovací údaje.",401);
      const DINER = DATABASE.prepare("SELECT diner_id FROM diner_links WHERE user_id=? ORDER BY diner_id LIMIT 1").get(ROW.id) as {diner_id:number}|undefined;
      if (TOKEN) DATABASE.prepare("DELETE FROM sessions WHERE token_hash=?").run(hashToken(TOKEN));
      await createSession(ROW.id,MEMBERSHIP.canteen_id,MEMBERSHIP.role,DINER?.diner_id || null,COOKIE_STORE,request);
      recordAudit(MEMBERSHIP.canteen_id,ROW.id,"login");
      USER = getUser(COOKIE_STORE.get(SESSION_COOKIE)?.value);
    } else if (BODY.action === "register") {
      const CREATED = await registerParentWithCode(BODY);
      await createSession(CREATED.userId,CREATED.canteenId,"parent",CREATED.dinerId,COOKIE_STORE,request);
      USER = getUser(COOKIE_STORE.get(SESSION_COOKIE)?.value);
    } else if (BODY.action === "requestReset") {
      enforceRateLimit(DATABASE,`reset:${request.headers.get("x-forwarded-for") || "unknown"}`);
      const EMAIL=String(BODY.email || "").trim().toLowerCase();
      if(EMAIL){const ACCOUNT=DATABASE.prepare("SELECT id,email,(SELECT canteen_id FROM user_roles WHERE user_id=users.id ORDER BY canteen_id LIMIT 1) AS canteen_id FROM users WHERE lower(email)=? AND deleted_at IS NULL").get(EMAIL) as {id:number;email:string;canteen_id:number}|undefined;
        if(ACCOUNT){const RESET_TOKEN=createToken();DATABASE.prepare("INSERT INTO password_resets(user_id,token_hash,expires_at) VALUES(?,?,?)").run(ACCOUNT.id,hashToken(RESET_TOKEN),Date.now()+30*60_000);await sendEmail({to:ACCOUNT.email,subject:"Obnovení hesla · Společný stůl",text:`Odkaz pro obnovu: ${new URL(`/reset?token=${RESET_TOKEN}`,request.url)}`});recordAudit(ACCOUNT.canteen_id||1,ACCOUNT.id,"password_reset_requested");}}
    } else if (BODY.action === "completeReset") {
      enforceRateLimit(DATABASE,`complete-reset:${request.headers.get("x-forwarded-for") || "unknown"}`);
      const RESET_TOKEN=String(BODY.token || ""), PASSWORD=String(BODY.password || "");
      if(PASSWORD.length<12)throw new AppError("Heslo musí mít alespoň 12 znaků.");
      const RESET=DATABASE.prepare("SELECT r.id,r.user_id,u.email,(SELECT canteen_id FROM user_roles WHERE user_id=u.id ORDER BY canteen_id LIMIT 1) AS canteen_id FROM password_resets r JOIN users u ON u.id=r.user_id WHERE r.token_hash=? AND r.expires_at>? AND r.used_at IS NULL AND u.deleted_at IS NULL").get(hashToken(RESET_TOKEN),Date.now()) as {id:number;user_id:number;email:string|null;canteen_id:number}|undefined;
      if(!RESET)throw new AppError("Odkaz nelze použít.");
      DATABASE.prepare("UPDATE password_resets SET used_at=? WHERE id=?").run(Date.now(),RESET.id);DATABASE.prepare("UPDATE users SET password_hash=? WHERE id=?").run(await hashPassword(PASSWORD),RESET.user_id);DATABASE.prepare("DELETE FROM sessions WHERE user_id=?").run(RESET.user_id);recordAudit(RESET.canteen_id||1,RESET.user_id,"password_reset");
    } else if (BODY.action === "acceptInvitation") {
      enforceRateLimit(DATABASE,`invite:${request.headers.get("x-forwarded-for") || "unknown"}`);
      const INVITE=DATABASE.prepare("SELECT id,canteen_id,role,email FROM invitations WHERE token_hash=? AND expires_at>? AND used_at IS NULL").get(hashToken(String(BODY.token || "")),Date.now()) as {id:number;canteen_id:number;role:Role;email:string}|undefined;
      if(!INVITE)throw new AppError("Pozvánku nelze použít.");
      const NAME=String(BODY.name||"").trim(),EMAIL=String(BODY.email||"").trim().toLowerCase(),PASSWORD=String(BODY.password||"");if(!NAME||EMAIL!==INVITE.email||!EMAIL.includes("@")||PASSWORD.length<12)throw new AppError("Zkontrolujte jméno, e-mail a heslo.");
      const RESULT=DATABASE.prepare("INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)").run(NAME,EMAIL,await hashPassword(PASSWORD),Date.now());const USER_ID=Number(RESULT.lastInsertRowid);DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,?,?)").run(USER_ID,INVITE.canteen_id,INVITE.role);DATABASE.prepare("UPDATE invitations SET used_at=? WHERE id=?").run(Date.now(),INVITE.id);recordAudit(INVITE.canteen_id,USER_ID,"staff_invited");await createSession(USER_ID,INVITE.canteen_id,INVITE.role,null,COOKIE_STORE,request);USER=getUser(COOKIE_STORE.get(SESSION_COOKIE)?.value);
    } else if (["createPupilLogin","resetPupilPassword","addChild","inviteStaff","regeneratePairing","removeDinerLink","deleteAccount","signOutOtherDevices","grantRole","revokeRole","linkAdultDiner","updateAccount","exportData"].includes(String(BODY.action))) {
      const AUTH_USER=USER;if(!AUTH_USER)throw new AppError("Přihlaste se.",401);
      if(BODY.action==="exportData") {const ACCOUNT=DATABASE.prepare("SELECT name,email,username,created_at AS createdAt FROM users WHERE id=?").get(AUTH_USER.id);const CHILDREN=DATABASE.prepare("SELECT d.name,d.class_name,d.diner_number,p.text AS preferences FROM diner_links l JOIN diners d ON d.id=l.diner_id LEFT JOIN preferences_v2 p ON p.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);const IDEAS=DATABASE.prepare("SELECT text,status,response FROM ideas WHERE user_id=? AND canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);const FEEDBACK=DATABASE.prepare("SELECT meal_id,rating,comment FROM feedback WHERE user_id=? AND canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);return Response.json({account:ACCOUNT,children:CHILDREN,ideas:IDEAS,feedback:FEEDBACK});}
      if(BODY.action==="updateAccount") {const NAME=String(BODY.name||"").trim(),EMAIL=String(BODY.email||"").trim().toLowerCase(),OLD=String(BODY.currentPassword||""),NEW=String(BODY.password||"");const ACCOUNT=DATABASE.prepare("SELECT password_hash FROM users WHERE id=?").get(AUTH_USER.id) as {password_hash:string|null};if(!NAME||(!EMAIL.includes("@")&&EMAIL!==""))throw new AppError("Zkontrolujte jméno a e-mail.");if(NEW&&NEW.length<12)throw new AppError("Nové heslo musí mít alespoň 12 znaků.");if(NEW&&(!ACCOUNT.password_hash||!(await verifyPassword(OLD,ACCOUNT.password_hash))))throw new AppError("Zadejte současné heslo.");DATABASE.prepare("UPDATE users SET name=?,email=?,password_hash=? WHERE id=?").run(NAME,EMAIL||null,NEW?await hashPassword(NEW):ACCOUNT.password_hash,AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"account_updated");USER=getUser(TOKEN);}
      if(BODY.action==="signOutOtherDevices")DATABASE.prepare("DELETE FROM sessions WHERE user_id=? AND token_hash<>?").run(AUTH_USER.id,hashToken(TOKEN||""));
      if(BODY.action==="deleteAccount") {DATABASE.prepare("UPDATE users SET name='Smazaný uživatel',email=NULL,username=NULL,password_hash=NULL,deleted_at=? WHERE id=?").run(Date.now(),AUTH_USER.id);DATABASE.prepare("DELETE FROM sessions WHERE user_id=?").run(AUTH_USER.id);DATABASE.prepare("DELETE FROM diner_links WHERE user_id=?").run(AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"account_deleted");COOKIE_STORE.delete(SESSION_COOKIE);USER=null;}
      if(BODY.action==="addChild") {if(AUTH_USER.role!=="parent")throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=consumePairingCode(String(BODY.code||""),AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"child_linked",DINER_ID);}
      if(BODY.action==="createPupilLogin") {if(!AUTH_USER.roles.includes("parent"))throw new AppError("Strávník nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId),USERNAME=String(BODY.username||"").trim().toLowerCase(),PASSWORD=String(BODY.password||"");const LINK=DATABASE.prepare("SELECT d.canteen_id FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE d.id=? AND d.canteen_id=? AND l.canteen_id=? AND l.user_id=?").get(DINER_ID,AUTH_USER.canteenId,AUTH_USER.canteenId,AUTH_USER.id) as {canteen_id:number}|undefined;if(!LINK)throw new AppError("Strávník nebyl nalezen.",404);if(!/^[a-z0-9._-]{3,32}$/.test(USERNAME)||PASSWORD.length<12)throw new AppError("Zkontrolujte uživatelské jméno a heslo.");const RESULT=DATABASE.prepare("INSERT INTO users(name,username,password_hash,created_at) SELECT name,?,?,? FROM diners WHERE id=?").run(USERNAME,await hashPassword(PASSWORD),Date.now(),DINER_ID);const PUPIL_ID=Number(RESULT.lastInsertRowid);DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,?,'pupil')").run(PUPIL_ID,LINK.canteen_id);DATABASE.prepare("INSERT INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(?,?,?,'self',?)").run(DINER_ID,PUPIL_ID,LINK.canteen_id,Date.now());recordAudit(LINK.canteen_id,AUTH_USER.id,"pupil_account_created",DINER_ID);}
      if(BODY.action==="resetPupilPassword") {const DINER_ID=Number(BODY.dinerId),PASSWORD=String(BODY.password||"");if(PASSWORD.length<12)throw new AppError("Heslo musí mít alespoň 12 znaků.");const PUPIL=DATABASE.prepare("SELECT u.id FROM diners d JOIN diner_links parent_link ON parent_link.diner_id=d.id JOIN diner_links pupil_link ON pupil_link.diner_id=d.id AND pupil_link.relationship='self' JOIN users u ON u.id=pupil_link.user_id JOIN user_roles r ON r.user_id=u.id AND r.role='pupil' AND r.canteen_id=d.canteen_id WHERE d.id=? AND d.canteen_id=? AND ((parent_link.user_id=? AND ?='parent') OR ?='manager')").get(DINER_ID,AUTH_USER.canteenId,AUTH_USER.id,AUTH_USER.role,AUTH_USER.role) as {id:number}|undefined;if(!PUPIL)throw new AppError("Strávník nebyl nalezen.",404);DATABASE.prepare("UPDATE users SET password_hash=? WHERE id=?").run(await hashPassword(PASSWORD),PUPIL.id);DATABASE.prepare("DELETE FROM sessions WHERE user_id=?").run(PUPIL.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"pupil_password_reset",PUPIL.id);}
      if(BODY.action==="inviteStaff") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Pozvánku může vytvořit pouze vedoucí jídelny.",403);const EMAIL=String(BODY.email||"").trim().toLowerCase();if(!EMAIL.includes("@"))throw new AppError("Zadejte platný e-mail.");const INVITE_TOKEN=createToken(),ROLE:Role="staff";DATABASE.prepare("INSERT INTO invitations(canteen_id,email,token_hash,role,expires_at) VALUES(?,?,?,?,?)").run(AUTH_USER.canteenId,EMAIL,hashToken(INVITE_TOKEN),ROLE,Date.now()+7*86400000);await sendEmail({to:EMAIL,subject:"Pozvánka do jídelny · Společný stůl",text:`Jednorázový odkaz: ${new URL(`/invite?token=${INVITE_TOKEN}`,request.url)}`});recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"staff_invitation_created");}
      if(BODY.action==="regeneratePairing") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId);const DINER=DATABASE.prepare("SELECT id FROM diners WHERE id=? AND canteen_id=?").get(DINER_ID,AUTH_USER.canteenId);if(!DINER)throw new AppError("Strávník nebyl nalezen.",404);ONE_TIME_CODE=createToken();DATABASE.prepare("UPDATE pairing_codes SET revoked_at=? WHERE diner_id=? AND revoked_at IS NULL").run(Date.now(),DINER_ID);DATABASE.prepare("INSERT INTO pairing_codes(diner_id,canteen_id,code_hash,created_at) VALUES(?,?,?,?)").run(DINER_ID,AUTH_USER.canteenId,hashToken(ONE_TIME_CODE),Date.now());recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"pairing_code_regenerated",DINER_ID);}
      if(BODY.action==="removeDinerLink") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId),LINK_USER_ID=Number(BODY.userId),REASON=String(BODY.reason||"").trim();if(REASON.length<3)throw new AppError("Uveďte důvod odebrání propojení.");const RESULT=DATABASE.prepare("DELETE FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=? AND EXISTS(SELECT 1 FROM diners WHERE id=? AND canteen_id=?)").run(DINER_ID,LINK_USER_ID,AUTH_USER.canteenId,DINER_ID,AUTH_USER.canteenId);if(!RESULT.changes)throw new AppError("Propojení nebylo nalezeno.",404);DATABASE.prepare("UPDATE sessions SET diner_id=NULL WHERE user_id=? AND diner_id=?").run(LINK_USER_ID,DINER_ID);DATABASE.prepare("INSERT INTO audit_log(canteen_id,actor_user_id,action,subject_id,reason,created_at) VALUES(?,?,'diner_link_removed',?,?,?)").run(AUTH_USER.canteenId,AUTH_USER.id,DINER_ID,REASON,Date.now());}
      if(BODY.action==="grantRole") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Role může spravovat pouze vedoucí jídelny.",403);const TARGET_ID=Number(BODY.userId),ROLE=String(BODY.role) as Role;if(!["staff","manager","parent","pupil","adult"].includes(ROLE)||!DATABASE.prepare("SELECT id FROM users WHERE id=? AND deleted_at IS NULL").get(TARGET_ID))throw new AppError("Uživatel nebyl nalezen.",404);DATABASE.prepare("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) VALUES(?,?,?)").run(TARGET_ID,AUTH_USER.canteenId,ROLE);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"role_granted",TARGET_ID);}
      if(BODY.action==="revokeRole") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Role může spravovat pouze vedoucí jídelny.",403);const TARGET_ID=Number(BODY.userId),ROLE=String(BODY.role) as Role;if(TARGET_ID===AUTH_USER.id&&ROLE==="manager")throw new AppError("Nemůžete odebrat vlastní poslední roli vedoucího.",400);const RESULT=DATABASE.prepare("DELETE FROM user_roles WHERE user_id=? AND canteen_id=? AND role=?").run(TARGET_ID,AUTH_USER.canteenId,ROLE);if(!RESULT.changes)throw new AppError("Role nebyla nalezena.",404);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"role_revoked",TARGET_ID);}
      if(BODY.action==="linkAdultDiner") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId),TARGET_ID=Number(BODY.userId);if(!DATABASE.prepare("SELECT id FROM diners WHERE id=? AND canteen_id=? AND type='adult'").get(DINER_ID,AUTH_USER.canteenId)||!DATABASE.prepare("SELECT id FROM users WHERE id=? AND EXISTS(SELECT 1 FROM user_roles WHERE user_id=? AND canteen_id=?) AND deleted_at IS NULL").get(TARGET_ID,TARGET_ID,AUTH_USER.canteenId))throw new AppError("Strávník nebo účet nebyl nalezen.",404);DATABASE.prepare("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) VALUES(?,?,'adult')").run(TARGET_ID,AUTH_USER.canteenId);DATABASE.prepare("INSERT INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(?,?,?,'self',?) ON CONFLICT(diner_id,user_id) DO NOTHING").run(DINER_ID,TARGET_ID,AUTH_USER.canteenId,Date.now());recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"role_granted",TARGET_ID);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"adult_diner_linked",DINER_ID);}
    } else if (BODY.action === "switchContext") {
      if (!USER) throw new AppError("Přihlaste se.",401);
      const ROLE = BODY.role as Role;
      const CANteen_ID = Number(BODY.canteenId || USER.canteenId);
      let DINER_ID = BODY.dinerId == null ? null : Number(BODY.dinerId);
      const ROLE_EXISTS = DATABASE.prepare("SELECT 1 FROM user_roles WHERE user_id=? AND canteen_id=? AND role=?").get(USER.id,CANteen_ID,ROLE);
      if (!ROLE_EXISTS) throw new AppError("Tento přístup není dostupný.",404);
      if (!DINER_ID && ["parent","pupil","adult"].includes(ROLE)) DINER_ID=(DATABASE.prepare("SELECT d.id FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name LIMIT 1").get(USER.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as {id:number}|undefined)?.id || null;
      if (["parent","pupil","adult"].includes(ROLE) && (!DINER_ID || !DATABASE.prepare("SELECT 1 FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE d.id=? AND d.canteen_id=? AND l.canteen_id=? AND l.user_id=? AND (d.archived_at IS NULL OR d.archived_at>?)").get(DINER_ID,CANteen_ID,CANteen_ID,USER.id,Date.now()-30*86400000))) throw new AppError("Strávník nebyl nalezen.",404);
      DATABASE.prepare("UPDATE sessions SET active_role=?,canteen_id=?,diner_id=? WHERE token_hash=?").run(ROLE,CANteen_ID,DINER_ID,hashToken(TOKEN || ""));
      USER=getUser(TOKEN);
    } else if (BODY.action === "logout") {
      if (TOKEN) DATABASE.prepare("DELETE FROM sessions WHERE token_hash=?").run(hashToken(TOKEN));
      COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
    } else {
      if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
      mutate(USER,BODY);
    }
    return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
  } catch (error) {
    if (error instanceof AppError) return Response.json({error:error.message},{status:error.status});
    console.error(error);
    return Response.json({error:"Změnu se nepodařilo uložit. Zkuste to znovu."},{status:500});
  }
}
