import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const workspaceApiKeysTable = pgTable("workspace_api_keys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").notNull(),
  key: text("key").notNull().unique(),
  name: text("name").notNull().default("Default"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type WorkspaceApiKey = typeof workspaceApiKeysTable.$inferSelect;
