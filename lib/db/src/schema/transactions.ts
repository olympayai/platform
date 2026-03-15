import { pgTable, text, timestamp, pgEnum, integer, jsonb } from "drizzle-orm/pg-core";
import { agentsTable } from "./agents";
import { accountsTable } from "./accounts";
import { cardsTable } from "./cards";

export const transactionDirectionEnum = pgEnum("transaction_direction", ["DEBIT", "CREDIT"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["attempted", "pending", "approved", "declined", "settled", "reversed"]);
export const transactionDecisionEnum = pgEnum("transaction_decision", ["ALLOW", "DENY", "REVIEW", "NONE"]);
export const transactionApprovalStatusEnum = pgEnum("transaction_approval_status", ["NOT_REQUIRED", "PENDING", "APPROVED", "DECLINED"]);

export const transactionsTable = pgTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").notNull().default(""),
  agentId: text("agent_id").notNull().references(() => agentsTable.id),
  accountId: text("account_id").notNull().references(() => accountsTable.id),
  cardId: text("card_id").references(() => cardsTable.id),
  merchantId: text("merchant_id"),
  transactionRef: text("transaction_ref"),
  direction: transactionDirectionEnum("direction").notNull().default("DEBIT"),
  amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: transactionStatusEnum("status").notNull().default("attempted"),
  decision: transactionDecisionEnum("decision").notNull().default("NONE"),
  approvalStatus: transactionApprovalStatusEnum("approval_status").notNull().default("NOT_REQUIRED"),
  declinedReason: text("declined_reason"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  settledAt: timestamp("settled_at"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export type Transaction = typeof transactionsTable.$inferSelect;
