import { pgTable, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { agentsTable } from "./agents";
import { accountsTable } from "./accounts";

export const cardStatusEnum = pgEnum("card_status", ["active", "frozen", "terminated"]);

export const cardsTable = pgTable("cards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").notNull().default(""),
  agentId: text("agent_id").notNull().references(() => agentsTable.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull().references(() => accountsTable.id, { onDelete: "cascade" }),
  cardRef: text("card_ref").unique(),
  last4: text("last4"),
  brand: text("brand"),
  network: text("network"),
  status: cardStatusEnum("status").notNull().default("active"),
  spendingEnabled: boolean("spending_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const insertCardSchema = createInsertSchema(cardsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cardsTable.$inferSelect;
