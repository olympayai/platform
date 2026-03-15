import { pgTable, text, timestamp, pgEnum, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const policyTypeEnum = pgEnum("policy_type", ["SPEND_LIMIT", "MERCHANT_ALLOWLIST", "MERCHANT_BLOCKLIST", "APPROVAL_REQUIRED", "TIME_WINDOW"]);
export const policyStatusEnum = pgEnum("policy_status", ["active", "disabled"]);
export const policyTargetTypeEnum = pgEnum("policy_target_type", ["AGENT", "ACCOUNT", "CARD"]);

export const policiesTable = pgTable("policies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").notNull().default(""),
  name: text("name").notNull(),
  type: policyTypeEnum("type").notNull(),
  status: policyStatusEnum("status").notNull().default("active"),
  configJson: jsonb("config_json").notNull().default({}),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const policyAssignmentsTable = pgTable("policy_assignments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  policyId: text("policy_id").notNull().references(() => policiesTable.id, { onDelete: "cascade" }),
  targetType: policyTargetTypeEnum("target_type").notNull(),
  targetId: text("target_id").notNull(),
  priority: integer("priority").notNull().default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPolicyAssignmentSchema = createInsertSchema(policyAssignmentsTable).omit({ id: true, createdAt: true });
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type InsertPolicyAssignment = z.infer<typeof insertPolicyAssignmentSchema>;
export type Policy = typeof policiesTable.$inferSelect;
export type PolicyAssignment = typeof policyAssignmentsTable.$inferSelect;
