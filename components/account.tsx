"use client";
import { useState } from "react";
import type { AppData } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";
import type { SaveAction } from "./forms";
import { Button } from "./ui/button";
export function AccountPanel({data,onSave,isPending}:{data:AppData;onSave:SaveAction;isPending:boolean}){
  const [isEditing,setIsEditing]=useState(false);
  return <section className="content-panel account-panel">
    <h2>{data.user?.name}</h2>
    <p>{data.user?.email || data.user?.username}</p>
    <div className="account-actions">
      <Button variant="secondary" onClick={()=>setIsEditing(!isEditing)}>{isEditing?"Zavřít":"Upravit účet"}</Button>
      <Button variant="secondary" onClick={()=>void onSave({action:"signOutOtherDevices"})}>Odhlásit ostatní zařízení</Button>
      <Button variant="secondary" onClick={()=>void onSave({action:"exportData"})}>Exportovat moje data</Button>
    </div>
    {isEditing&&<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"updateAccount",...Object.fromEntries(new FormData(event.currentTarget))});}}>
      <label>Jméno<input name="name" defaultValue={data.user?.name} required /></label>
      <label>E-mail<input name="email" type="email" defaultValue={data.user?.email||""}/></label>
      <label>Současné heslo<input name="currentPassword" type="password" autoComplete="current-password" /></label>
      <label>Nové heslo<input name="password" type="password" minLength={12} autoComplete="new-password" /></label>
      <Button type="submit" disabled={isPending}>Uložit účet</Button>
    </form>}
    <h3>Propojení se strávníky</h3>
    {data.diners.map((diner)=><article key={diner.id} className="linked-diner"><strong>{diner.name}{diner.className?` · ${diner.className}`:""}</strong>{diner.pupilUsername?<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"resetPupilPassword",dinerId:diner.id,...Object.fromEntries(new FormData(event.currentTarget))});}}><span>Účet žáka: {diner.pupilUsername}</span><label>Nové heslo dítěte<input name="password" type="password" minLength={12} required /></label><Button type="submit" disabled={isPending}>Obnovit heslo</Button></form>:diner.type==="pupil"&&<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"createPupilLogin",dinerId:diner.id,...Object.fromEntries(new FormData(event.currentTarget))});}}><label>Uživatelské jméno<input name="username" minLength={3} maxLength={32} required /></label><label>Heslo dítěte<input name="password" type="password" minLength={12} required /></label><Button type="submit" disabled={isPending}>Vytvořit účet žáka</Button></form>}</article>)}
    {data.user?.role==="parent"&&<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"addChild",code:new FormData(event.currentTarget).get("code")});}}>
      <label>Přidat dítě pomocí kódu<input name="code" autoComplete="off" required /></label><Button type="submit" disabled={isPending}>Přidat dítě</Button>
    </form>}
    {data.roles.includes("manager")&&<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"inviteStaff",email:new FormData(event.currentTarget).get("email")});}}><label>E-mail zaměstnance<input name="email" type="email" required /></label><Button type="submit" disabled={isPending}>Pozvat zaměstnance</Button></form>}
    {data.roles.includes("manager")&&<><h3>Strávníci</h3>{data.managedDiners.map((diner)=><article key={diner.id} className="managed-diner"><strong>{diner.name} · {diner.dinerNumber}{diner.className?` · ${diner.className}`:""}{diner.archivedAt?" · archivováno":""}</strong><Button variant="secondary" onClick={()=>void onSave({action:"regeneratePairing",dinerId:diner.id})}>Vytvořit nový párovací kód</Button>{data.oneTimeCode&&<code>{data.oneTimeCode}</code>}{diner.parentLinks.split("|").filter(Boolean).map((link)=>{const [userId,parentName]=link.split(":");return <form key={userId} onSubmit={(event)=>{event.preventDefault();void onSave({action:"removeDinerLink",dinerId:diner.id,userId:Number(userId),reason:new FormData(event.currentTarget).get("reason")});}}><span>{parentName}</span><label>Důvod odebrání<input name="reason" minLength={3} required /></label><Button type="submit" variant="secondary" disabled={isPending}>Odebrat propojení</Button></form>;})}</article>)}</>}
    {data.roles.includes("manager")&&<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"linkAdultDiner",...Object.fromEntries(new FormData(event.currentTarget))});}}><label>Dospělý strávník<select name="dinerId" required>{data.managedDiners.filter((diner)=>diner.type==="adult").map((diner)=><option key={diner.id} value={diner.id}>{diner.name} · {diner.dinerNumber}</option>)}</select></label><label>Uživatelský účet<select name="userId" required>{data.managedPeople.map((person)=><option key={person.id} value={person.id}>{person.name} · {person.email||person.roles.join(", ")}</option>)}</select></label><Button type="submit" disabled={isPending}>Propojit účet se strávníkem</Button></form>}
    {data.roles.includes("manager")&&<><h3>Role uživatelů</h3>{data.managedPeople.map((person)=><article key={person.id} className="managed-diner"><strong>{person.name} · {person.email||"bez e-mailu"}</strong><div>{person.roles.map((role)=><span key={role} className="managed-role">{ROLE_LABELS[role]}{!(person.id===data.user?.id&&role==="manager")&&<button aria-label={`Odebrat roli ${ROLE_LABELS[role]} u ${person.name}`} onClick={()=>void onSave({action:"revokeRole",userId:person.id,role})}>×</button>}</span>)}</div><form onSubmit={(event)=>{event.preventDefault();void onSave({action:"grantRole",userId:person.id,role:new FormData(event.currentTarget).get("role")});}}><label>Přidat roli<select name="role"><option value="staff">Personál</option><option value="manager">Vedoucí</option><option value="parent">Rodič</option><option value="pupil">Žák</option><option value="adult">Dospělý strávník</option></select></label><Button type="submit" variant="secondary" disabled={isPending}>Přidat roli</Button></form></article>)}</>}
    {data.roles.includes("manager")&&<><h3>Provozní záznam</h3>{data.auditLog.map((entry)=><article key={entry.id} className="audit-entry"><time>{new Date(entry.createdAt).toLocaleString("cs-CZ")}</time><span>{({login:"Přihlášení",password_reset:"Obnovení hesla",password_reset_requested:"Požadavek na obnovu hesla",diner_import:"Import strávníků",diner_link_removed:"Odebrání propojení",pairing_code_regenerated:"Nový párovací kód",role_granted:"Přidělení role",role_revoked:"Odebrání role",staff_invitation_created:"Pozvánka zaměstnanci",account_deleted:"Smazání účtu"} as Record<string,string>)[entry.action]||entry.action}</span>{entry.reason&&<small>{entry.reason}</small>}</article>)}</>}
    <Button variant="secondary" onClick={()=>{if(window.confirm("Opravdu chcete smazat svůj účet?"))void onSave({action:"deleteAccount"});}}>Smazat účet</Button>
  </section>;
}
