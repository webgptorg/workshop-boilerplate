import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const DIRECTORY=mkdtempSync(join(tmpdir(),"stul-onboarding-"));process.env.DATABASE_DIRECTORY=DIRECTORY;process.env.IS_DEMO_MODE="false";
const CSV=join(DIRECTORY,"diners.csv");writeFileSync(CSV,"cislo_stravnika;jmeno;trida;typ\n1001;Adam Novák;6. B;pupil\n1002;Eva Nováková;2. A;pupil\n1003;Uživatel mimo vazby;4. C;pupil\n");
function runAdmin(...args:string[]){const RESULT=spawnSync("node_modules/.bin/tsx",["scripts/admin.ts",...args],{cwd:process.cwd(),env:process.env,encoding:"utf8"});if(RESULT.status!==0)throw new Error(RESULT.stderr||RESULT.stdout);}
runAdmin("create-canteen","Testovací jídelna","Vedoucí testu","manager@example.test","TestPassword-2026!");runAdmin("import-diners",CSV,"--canteen=1","--confirm");
const CODES=[...readFileSync(join(DIRECTORY,"pairing-letters-1.html"),"utf8").matchAll(/<strong>([^<]+)<\/strong>/g)].map((match)=>match[1]);
const {DATABASE,getData,getUser}=await import("../lib/database");const {registerParentWithCode,consumePairingCode}=await import("../lib/accounts");const {mutate}=await import("../lib/mutations");
after(()=>{DATABASE.close();rmSync(DIRECTORY,{recursive:true,force:true});});
test("Production onboarding imports diners and links only the parents who present each code",async()=>{
  const FIRST=await registerParentWithCode({name:"Petra",email:"petra@example.test",password:"PetraPassword-2026!",code:CODES[0]});
  consumePairingCode(CODES[1],FIRST.userId);
  const SECOND=await registerParentWithCode({name:"Pavel",email:"pavel@example.test",password:"PavelPassword-2026!",code:CODES[0]});
  const PARENT={id:FIRST.userId,name:"Petra",username:"",email:"petra@example.test",role:"parent" as const,canteenId:1,dinerId:FIRST.dinerId,roles:["parent"] as ("parent"|"pupil"|"adult"|"staff"|"manager")[]};
  const OTHER={...PARENT,id:SECOND.userId,name:"Pavel",dinerId:FIRST.dinerId};
  assert.deepEqual(getData(PARENT).diners.map((diner)=>diner.name),["Adam Novák","Eva Nováková"]);
  assert.deepEqual(getData(OTHER).diners.map((diner)=>diner.name),["Adam Novák"]);
  assert.throws(()=>mutate(PARENT,{action:"preferences",dinerId:3,text:"Private"}),(error:unknown)=>Boolean(error&&typeof error==="object"&&"status" in error&&(error as {status:number}).status===404));
  assert.equal(DATABASE.prepare("SELECT count(*) AS count FROM pairing_codes WHERE code_hash IN (?,?)").get(CODES[0],CODES[1])?.count,0);
  const ACCOUNT=DATABASE.prepare("SELECT password_hash FROM users WHERE id=?").get(FIRST.userId) as {password_hash:string};assert.match(ACCOUNT.password_hash,/^scrypt\$/);assert.equal(ACCOUNT.password_hash.includes("PetraPassword-2026!"),false);
  assert.equal(DATABASE.prepare("SELECT count(*) AS count FROM users WHERE username='adam'").get()?.count,0);
  const SESSION_TOKEN="revocation-check-token";const {hashToken}=await import("../lib/security");DATABASE.prepare("INSERT INTO sessions(token_hash,user_id,expires,active_role,diner_id,canteen_id) VALUES(?,?,?,'parent',?,1)").run(hashToken(SESSION_TOKEN),FIRST.userId,Date.now()+60000,FIRST.dinerId);assert.ok(getUser(SESSION_TOKEN));DATABASE.prepare("DELETE FROM user_roles WHERE user_id=? AND role='parent'").run(FIRST.userId);assert.equal(getUser(SESSION_TOKEN),null);
});
