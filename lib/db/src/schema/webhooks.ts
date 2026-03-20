import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const webhooksTable = pgTable("webhooks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").notNull(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  description: text("description"),
  events: jsonb("events").notNull().$defaultFn(() => ["transaction.completed", "transaction.denied", "transaction.review"]),
  isActive: boolean("is_active").notNull().default(true),
  lastFiredAt: timestamp("last_fired_at"),
  lastStatusCode: text("last_status_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Webhook = typeof webhooksTable.$inferSelect;
