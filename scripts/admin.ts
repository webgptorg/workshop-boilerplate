import QRCode from "qrcode";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { DATABASE } from "../lib/database";
import { hashPassword, hashToken } from "../lib/security";

function parseCsv(source: string): string[][] {
  const rows: string[][]=[]; let row:string[]=[], field="", quoted=false;
  for(let index=0;index<source.length;index++) {
    const CHARACTER=source[index];
    if(CHARACTER==='"' && quoted && source[index+1]==='"'){field+='"';index++;continue;}
    if(CHARACTER==='"'){quoted=!quoted;continue;}
    if((CHARACTER===';' || CHARACTER===',') && !quoted){row.push(field.trim());field="";continue;}
    if((CHARACTER==='\n' || CHARACTER==='\r') && !quoted){if(CHARACTER==='\r' && source[index+1]==='\n')index++;row.push(field.trim());field="";if(row.some(Boolean))rows.push(row);row=[];continue;}
    field+=CHARACTER;
  }
  row.push(field.trim());if(row.some(Boolean))rows.push(row);return rows;
}
function key(value:string):string{return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");}
function log(canteenId:number,actor:number|null,action:string){DATABASE.prepare("INSERT INTO audit_log(canteen_id,actor_user_id,action,created_at) VALUES(?,?,?,?)").run(canteenId,actor,action,Date.now());}
async function createCanteen(args:string[]) {
  const [NAME,MANAGER_NAME,EMAIL,PASSWORD]=args;
  if(!NAME||!MANAGER_NAME||!EMAIL||!PASSWORD)throw new Error("Usage: admin create-canteen <name> <manager-name> <email> <password>");
  const EMPTY_DEFAULT=DATABASE.prepare("SELECT id FROM canteens WHERE id=1 AND NOT EXISTS(SELECT 1 FROM users) AND NOT EXISTS(SELECT 1 FROM meals)").get() as {id:number}|undefined;
  const CANTEEN_ID=EMPTY_DEFAULT ? 1 : Number(DATABASE.prepare("INSERT INTO canteens(name,created_at) VALUES(?,?)").run(NAME,Date.now()).lastInsertRowid);
  if(EMPTY_DEFAULT) DATABASE.prepare("UPDATE canteens SET name=? WHERE id=?").run(NAME,CANTEEN_ID);
  const USER=DATABASE.prepare("INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)").run(MANAGER_NAME,EMAIL.toLowerCase(),await hashPassword(PASSWORD),Date.now());
  DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,?,'manager'),(?,?,'staff')").run(Number(USER.lastInsertRowid),CANTEEN_ID,Number(USER.lastInsertRowid),CANTEEN_ID);
  log(CANTEEN_ID,Number(USER.lastInsertRowid),"canteen_created");console.info(`Created canteen ${CANTEEN_ID} and manager account.`);
}
function previewImport(file:string,canteenId:number) {
  const ROWS=parseCsv(readFileSync(file,"utf8")); const HEADERS=ROWS.shift()?.map(key) || [];
  const INDEX=(...names:string[])=>HEADERS.findIndex((header)=>names.includes(header));
  const NUMBER=INDEX("cislo_stravnika","stravnik_cislo","diner_number","cislo","kod_stravnika");
  const NAME=INDEX("jmeno","jmeno_a_prijmeni","jmeno_stravnika","stravnik","name","name_of_diner","nazev");
  const CLASS=INDEX("trida","class","class_name"); const TYPE=INDEX("typ","type");
  if(NUMBER<0||NAME<0)throw new Error("CSV needs diner number and name columns.");
  const DINERS=ROWS.map((values)=>({number:values[NUMBER],name:values[NAME],className:CLASS<0?null:values[CLASS]||null,type:TYPE>=0&&/adult|dosp/i.test(values[TYPE])?"adult":"pupil"}));
  const EXISTING=DATABASE.prepare("SELECT diner_number FROM diners WHERE canteen_id=? AND archived_at IS NULL").all(canteenId).map((row)=>(row as {diner_number:string}).diner_number);
  const FOUND=new Set(DINERS.map((diner)=>diner.number));
  const NEW=DINERS.filter((diner)=>!EXISTING.includes(diner.number)).length;
  const UPDATED=DINERS.length-NEW, ARCHIVED=EXISTING.filter((number)=>!FOUND.has(number)).length;
  return {diners:DINERS,newCount:NEW,updatedCount:UPDATED,archiveCount:ARCHIVED};
}
async function importDiners(file:string,canteenId:number,confirm:boolean) {
  const PREVIEW=previewImport(file,canteenId);
  console.table(PREVIEW.diners.map((diner)=>({number:diner.number,name:diner.name,className:diner.className,type:diner.type})));
  console.info(JSON.stringify({new:PREVIEW.newCount,updated:PREVIEW.updatedCount,archived:PREVIEW.archiveCount},null,2));
  if(!confirm){console.info("Preview only. Add --confirm to apply this import.");return;}
  const NOW=Date.now(); const KEEP=new Set(PREVIEW.diners.map((diner)=>diner.number)); const LETTER_DATA:{name:string;className:string|null;code:string}[]=[];
  DATABASE.exec("BEGIN IMMEDIATE");
  try {
    const UPSERT=DATABASE.prepare("INSERT INTO diners(canteen_id,name,class_name,diner_number,type,archived_at) VALUES(?,?,?,?,?,NULL) ON CONFLICT(canteen_id,diner_number) DO UPDATE SET name=excluded.name,class_name=excluded.class_name,type=excluded.type,archived_at=NULL");
    for(const DINER of PREVIEW.diners){UPSERT.run(canteenId,DINER.name,DINER.className,DINER.number,DINER.type);const ID=(DATABASE.prepare("SELECT id FROM diners WHERE canteen_id=? AND diner_number=?").get(canteenId,DINER.number) as {id:number}).id;const CODE=randomBytes(18).toString("base64url");LETTER_DATA.push({name:DINER.name,className:DINER.className,code:CODE});DATABASE.prepare("UPDATE pairing_codes SET revoked_at=? WHERE diner_id=? AND revoked_at IS NULL").run(NOW,ID);DATABASE.prepare("INSERT INTO pairing_codes(diner_id,canteen_id,code_hash,created_at) VALUES(?,?,?,?)").run(ID,canteenId,hashToken(CODE),NOW);}
    const ACTIVE=DATABASE.prepare("SELECT diner_number FROM diners WHERE canteen_id=? AND archived_at IS NULL").all(canteenId) as {diner_number:string}[];
    for(const DINER of ACTIVE)if(!KEEP.has(DINER.diner_number))DATABASE.prepare("UPDATE diners SET archived_at=? WHERE canteen_id=? AND diner_number=?").run(NOW,canteenId,DINER.diner_number);
    log(canteenId,null,"diner_import");DATABASE.exec("COMMIT");
  }catch(error){DATABASE.exec("ROLLBACK");throw error;}
  const LETTERS=(await Promise.all(LETTER_DATA.map(async(pair)=>`<article><h1>${pair.name}</h1><p>${pair.className||""}</p><strong>${pair.code}</strong><img alt="QR kód" src="${await QRCode.toDataURL(pair.code)}"></article>`))).join("\n");
  const OUTPUT=join(process.env.DATABASE_DIRECTORY||process.cwd(),`pairing-letters-${canteenId}.html`);
  writeFileSync(OUTPUT,`<!doctype html><meta charset="utf-8"><style>article{page-break-after:always;font:20px sans-serif;padding:40px}</style>${LETTERS}`);
  console.info(`Pairing letters created: ${OUTPUT}`);
}
async function main(){
  const [COMMAND,...ARGS]=process.argv.slice(2);
  if(COMMAND==="create-canteen")return createCanteen(ARGS);
  if(COMMAND==="import-diners") {const FILE=ARGS.find((item)=>!item.startsWith("--"));const CANTEEN=Number(ARGS.find((item)=>item.startsWith("--canteen="))?.split("=")[1]||1);if(!FILE)throw new Error("Usage: admin import-diners <csv> [--canteen=1] [--confirm]");return importDiners(FILE,CANTEEN,ARGS.includes("--confirm"));}
  throw new Error("Commands: create-canteen, import-diners");
}
main().catch((error)=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
