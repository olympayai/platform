import { db, webhooksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export type WebhookEvent =
  | "transaction.completed"
  | "transaction.denied"
  | "transaction.review"
  | "approval.approved"
  | "approval.rejected";

function signPayload(secret: string, payload: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function fireWebhooks(workspaceId: string, event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
  const hooks = await db.select().from(webhooksTable).where(
    and(eq(webhooksTable.workspaceId, workspaceId), eq(webhooksTable.isActive, true))
  );

  if (hooks.length === 0) return;

  const payload = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    protocol: "olympay-payment-protocol/v1",
    data,
  });

  await Promise.allSettled(hooks.map(async (hook) => {
    const events = hook.events as string[];
    if (!events.includes(event) && !events.includes("*")) return;

    const signature = signPayload(hook.secret, payload);
    let statusCode = "0";

    try {
      const res = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Olympay-Event": event,
          "X-Olympay-Signature": signature,
          "X-Olympay-Protocol": "v1",
          "User-Agent": "Olympay-Webhook/1.0",
        },
        body: payload,
        signal: AbortSignal.timeout(10000),
      });
      statusCode = String(res.status);
    } catch {
      statusCode = "error";
    }

    await db.update(webhooksTable).set({
      lastFiredAt: new Date(),
      lastStatusCode: statusCode,
    }).where(eq(webhooksTable.id, hook.id));
  }));
}
