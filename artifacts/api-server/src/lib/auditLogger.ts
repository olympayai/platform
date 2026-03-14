import { db, auditLogsTable } from "@workspace/db";

export async function createAuditLog(entry: {
  entityType: string;
  entityId: string;
  action: string;
  actorType?: string;
  actorId?: string | null;
  traceId?: string | null;
  payloadJson?: object | null;
}): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      actorType: entry.actorType ?? "SYSTEM",
      actorId: entry.actorId ?? null,
      traceId: entry.traceId ?? null,
      payloadJson: entry.payloadJson ?? null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
