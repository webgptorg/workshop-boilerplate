import { AuthTokenForm } from "@/components/auth-token-form";
export default async function InvitePage({searchParams}:{searchParams:Promise<{token?:string}>}){const PARAMS=await searchParams;return <AuthTokenForm token={PARAMS.token||""} mode="invite"/>;}
