import { Router } from "express";
import { db, agentsTable, accountsTable, cardsTable, policiesTable, policyAssignmentsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";
import { createAuditLog } from "../lib/auditLogger.js";

const router = Router();

const createPolicySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["SPEND_LIMIT", "MERCHANT_ALLOWLIST", "MERCHANT_BLOCKLIST", "APPROVAL_REQUIRED", "TIME_WINDOW"]),
  configJson: z.record(z.any()).default({}),
  description: z.string().optional(),
});

const updateStatusSchema = z.object({ status: z.enum(["active", "disabled"]) });
const VALID_TRANSITIONS: Record<string, string[]> = { active: ["disabled"], disabled: ["active"] };

const createAssignmentSchema = z.object({
  policyId: z.string().min(1),
  targetType: z.enum(["AGENT", "ACCOUNT", "CARD"]),
  targetId: z.string().min(1),
  priority: z.number().int().optional().default(100),
});

router.get("/", async (_req, res, next) => {
  try {
    const policies = await db.select().from(policiesTable).orderBy(desc(policiesTable.createdAt));
    return sendSuccess(res, policies);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createPolicySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [policy] = await db.insert(policiesTable).values(parsed.data).returning();
    await createAuditLog({ entityType: "POLICY", entityId: policy.id, action: "POLICY_CREATED", payloadJson: { type: policy.type } });
    return sendSuccess(res, policy, 201);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [policy] = await db.select().from(policiesTable).where(eq(policiesTable.id, req.params.id));
    if (!policy) throw new NotFoundError(`Policy ${req.params.id} not found`);
    return sendSuccess(res, policy);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const [policy] = await db.select().from(policiesTable).where(eq(policiesTable.id, req.params.id));
    if (!policy) throw new NotFoundError(`Policy ${req.params.id} not found`);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const allowed = VALID_TRANSITIONS[policy.status] ?? [];
    if (!allowed.includes(parsed.data.status)) {
      throw new BadRequestError(`Invalid status transition from ${policy.status} to ${parsed.data.status}`);
    }
    const [updated] = await db.update(policiesTable).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(policiesTable.id, req.params.id)).returning();
    await createAuditLog({ entityType: "POLICY", entityId: policy.id, action: "POLICY_STATUS_CHANGED", payloadJson: { from: policy.status, to: updated.status } });
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/assignments", async (req, res, next) => {
  try {
    const [policy] = await db.select().from(policiesTable).where(eq(policiesTable.id, req.params.id));
    if (!policy) throw new NotFoundError(`Policy ${req.params.id} not found`);
    const assignments = await db.select().from(policyAssignmentsTable).where(eq(policyAssignmentsTable.policyId, req.params.id));
    return sendSuccess(res, assignments);
  } catch (err) {
    next(err);
  }
});

router.get("/assignments/all", async (_req, res, next) => {
  try {
    const assignments = await db.select().from(policyAssignmentsTable).orderBy(desc(policyAssignmentsTable.createdAt));
    return sendSuccess(res, assignments);
  } catch (err) {
    next(err);
  }
});

router.post("/assignments", async (req, res, next) => {
  try {
    const parsed = createAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [policy] = await db.select().from(policiesTable).where(eq(policiesTable.id, parsed.data.policyId));
    if (!policy) throw new NotFoundError(`Policy ${parsed.data.policyId} not found`);

    const [existing] = await db.select().from(policyAssignmentsTable).where(
      and(
        eq(policyAssignmentsTable.policyId, parsed.data.policyId),
        eq(policyAssignmentsTable.targetType, parsed.data.targetType),
        eq(policyAssignmentsTable.targetId, parsed.data.targetId)
      )
    );
    if (existing) throw new BadRequestError("This policy is already assigned to this target");

    const [assignment] = await db.insert(policyAssignmentsTable).values(parsed.data).returning();
    await createAuditLog({ entityType: "POLICY", entityId: policy.id, action: "POLICY_ASSIGNED", payloadJson: { targetType: assignment.targetType, targetId: assignment.targetId } });
    return sendSuccess(res, assignment, 201);
  } catch (err) {
    next(err);
  }
});

export default router;
