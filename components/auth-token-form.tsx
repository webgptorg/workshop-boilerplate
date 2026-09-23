"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
export function AuthTokenForm({token,mode}:{token:string;mode:"invite"|"reset"}){
  const [message,setMessage]=useState("");const [isPending,setIsPending]=useState(false);const ROUTER=useRouter();
  return <main className="auth-token-page"><h1>{mode==="invite"?"Přijetí pozvánky":"Obnovení hesla"}</h1><form onSubmit={async(event)=>{event.preventDefault();setIsPending(true);setMessage("");const FIELDS=Object.fromEntries(new FormData(event.currentTarget));const RESPONSE=await fetch("/api/action",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:mode==="invite"?"acceptInvitation":"completeReset",token,...FIELDS})});const RESULT=await RESPONSE.json();if(!RESPONSE.ok)setMessage(RESULT.error||"Požadavek se nepodařilo dokončit.");else if(mode==="invite"){ROUTER.replace("/");ROUTER.refresh();}else setMessage("Heslo bylo změněno. Přihlaste se novým heslem.");setIsPending(false);}}>
    {mode==="invite"&&<><label>Jméno<input name="name" autoComplete="name" required /></label><label>E-mail<input name="email" type="email" autoComplete="email" required /></label></>}
    <label>{mode==="invite"?"Vytvořit heslo":"Nové heslo"}<input name="password" type="password" minLength={12} autoComplete="new-password" required /></label>
    {message&&<p className="error-message" role="status">{message}</p>}<Button type="submit" disabled={isPending}>{mode==="invite"?"Vytvořit účet":"Uložit heslo"}</Button>
  </form></main>;
}
