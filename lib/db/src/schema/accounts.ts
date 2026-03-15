import { pgTable, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { agentsTable } from "./agents";

export const accountStatusEnum = pgEnum("account_status", ["active", "frozen", "closed"]);

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").notNull().default(""),
  agentId: text("agent_id").notNull().references(() => agentsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  accountRef: text("account_ref").unique(),
  currency: text("currency").notNull().default("USD"),
  status: accountStatusEnum("status").notNull().default("active"),
  balanceMinor: integer("balance_minor").notNull().default(0),
  availableBalanceMinor: integer("available_balance_minor").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;
