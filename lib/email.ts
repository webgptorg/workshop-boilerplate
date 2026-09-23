export type EmailMessage = { to: string; subject: string; text: string };
export interface EmailTransport { send(message: EmailMessage): Promise<void> }
class ConsoleEmailTransport implements EmailTransport {
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email] To: ${message.to}\nSubject: ${message.subject}\n${message.text}`);
  }
}
class WebhookEmailTransport implements EmailTransport {
  constructor(private readonly endpoint: string, private readonly token: string) {}
  async send(message: EmailMessage): Promise<void> {
    const RESPONSE=await fetch(this.endpoint,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.token}`},body:JSON.stringify(message)});
    if(!RESPONSE.ok)throw new Error("Email delivery failed.");
  }
}
function getEmailTransport(): EmailTransport {
  const ENDPOINT=process.env.EMAIL_WEBHOOK_URL, TOKEN=process.env.EMAIL_WEBHOOK_TOKEN;
  if(ENDPOINT&&TOKEN)return new WebhookEmailTransport(ENDPOINT,TOKEN);
  if(process.env.NODE_ENV!=="production")return new ConsoleEmailTransport();
  throw new Error("Production email transport is not configured.");
}
export async function sendEmail(message: EmailMessage): Promise<void> { await getEmailTransport().send(message); }
