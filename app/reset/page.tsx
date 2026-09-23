import { AuthTokenForm } from "@/components/auth-token-form";
export default async function ResetPage({searchParams}:{searchParams:Promise<{token?:string}>}){const PARAMS=await searchParams;return <AuthTokenForm token={PARAMS.token||""} mode="reset"/>;}
