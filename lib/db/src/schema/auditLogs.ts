import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const auditLogsTable = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  traceId: text("trace_id"),
  payloadJson: jsonb("payload_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
