import { DATABASE } from "./database";
import { AppError } from "../src/errors/app-error";
import { enforceRateLimit, hashPassword, hashToken } from "./security";

export function consumePairingCode(code: string, userId: number): number {
  enforceRateLimit(DATABASE,`pair:${code}`);
  const PAIRING = DATABASE.prepare("SELECT id,diner_id,uses FROM pairing_codes WHERE code_hash=? AND revoked_at IS NULL").get(hashToken(code.trim())) as {id:number;diner_id:number;uses:number}|undefined;
  if (!PAIRING || PAIRING.uses >= 2) throw new AppError("Kód nelze použít.",400);
  const CANteen_ID=(DATABASE.prepare("SELECT canteen_id FROM diners WHERE id=?").get(PAIRING.diner_id) as {canteen_id:number}).canteen_id;
  DATABASE.prepare("UPDATE pairing_codes SET uses=uses+1 WHERE id=?").run(PAIRING.id);
  DATABASE.prepare("INSERT INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(?,?,?,'parent',?)").run(PAIRING.diner_id,userId,CANteen_ID,Date.now());
  return PAIRING.diner_id;
}
export async function registerParentWithCode(body:Record<string,unknown>):Promise<{userId:number;canteenId:number;dinerId:number}> {
  enforceRateLimit(DATABASE,`register:${String(body.code||"")}`);
  const NAME=typeof body.name==="string"?body.name.trim():"",EMAIL=typeof body.email==="string"?body.email.trim().toLowerCase():"",PASSWORD=typeof body.password==="string"?body.password:"",CODE=typeof body.code==="string"?body.code.trim():"";
  if(!NAME||!EMAIL.includes("@")||PASSWORD.length<12||!CODE)throw new AppError("Zkontrolujte jméno, e-mail, heslo a párovací kód.");
  DATABASE.exec("BEGIN IMMEDIATE");
  try {
    const RESULT=DATABASE.prepare("INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)").run(NAME,EMAIL,await hashPassword(PASSWORD),Date.now()),USER_ID=Number(RESULT.lastInsertRowid);
    const DINER_ID=consumePairingCode(CODE,USER_ID),CANteen_ID=(DATABASE.prepare("SELECT canteen_id FROM diners WHERE id=?").get(DINER_ID) as {canteen_id:number}).canteen_id;
    DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,?,'parent')").run(USER_ID,CANteen_ID);
    DATABASE.prepare("INSERT INTO audit_log(canteen_id,actor_user_id,action,subject_id,created_at) VALUES(?,?,'parent_registered',?,?)").run(CANteen_ID,USER_ID,DINER_ID,Date.now());
    DATABASE.exec("COMMIT");return {userId:USER_ID,canteenId:CANteen_ID,dinerId:DINER_ID};
  }catch(error){DATABASE.exec("ROLLBACK");if(String(error).includes("UNIQUE"))throw new AppError("Zkontrolujte jméno, e-mail, heslo a párovací kód.");throw error;}
}
