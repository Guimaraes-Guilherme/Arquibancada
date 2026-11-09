import webpush from "web-push";
import { sql } from "./db";

let configurado = false;
function config() {
  if (configurado) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:arquibancada@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configurado = true;
}

export type Msg = { titulo: string; corpo: string; url?: string; tag?: string };

export async function envia(sub: webpush.PushSubscription, msg: Msg) {
  config();
  try {
    await webpush.sendNotification(sub, JSON.stringify(msg), { TTL: 3600, urgency: "high" });
    return true;
  } catch (e: unknown) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) await sql()`DELETE FROM inscricoes WHERE endpoint = ${sub.endpoint}`;
    return false;
  }
}
