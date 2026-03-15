import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { transactionsTable } from "./transactions";

export const approvalRequestStatusEnum = pgEnum("approval_request_status", ["PENDING", "APPROVED", "DECLINED", "EXPIRED"]);

export const approvalRequestsTable = pgTable("approval_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").notNull().default(""),
  transactionId: text("transaction_id").notNull().references(() => transactionsTable.id),
  status: approvalRequestStatusEnum("status").notNull().default("PENDING"),
  requestedByType: text("requested_by_type").notNull().default("SYSTEM"),
  requestedReason: text("requested_reason"),
  reviewerId: text("reviewer_id"),
  reviewedAt: timestamp("reviewed_at"),
  decisionReason: text("decision_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export type ApprovalRequest = typeof approvalRequestsTable.$inferSelect;
