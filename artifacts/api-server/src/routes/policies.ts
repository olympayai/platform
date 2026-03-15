import { Router } from "express";
import { db, policiesTable, policyAssignmentsTable } from "@workspace/db";
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

router.get("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const policies = await db.select().from(policiesTable)
      .where(eq(policiesTable.workspaceId, workspaceId))
      .orderBy(desc(policiesTable.createdAt));
    return sendSuccess(res, policies);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const parsed = createPolicySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [policy] = await db.insert(policiesTable).values({ ...parsed.data, workspaceId }).returning();
    await createAuditLog({ workspaceId, entityType: "POLICY", entityId: policy.id, action: "POLICY_CREATED", payloadJson: { type: policy.type } });
    return sendSuccess(res, policy, 201);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [policy] = await db.select().from(policiesTable)
      .where(and(eq(policiesTable.id, req.params.id), eq(policiesTable.workspaceId, workspaceId)));
    if (!policy) throw new NotFoundError(`Policy ${req.params.id} not found`);
    return sendSuccess(res, policy);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [policy] = await db.select().from(policiesTable)
      .where(and(eq(policiesTable.id, req.params.id), eq(policiesTable.workspaceId, workspaceId)));
    if (!policy) throw new NotFoundError(`Policy ${req.params.id} not found`);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const allowed = VALID_TRANSITIONS[policy.status] ?? [];
    if (!allowed.includes(parsed.data.status)) {
      throw new BadRequestError(`Invalid transition from ${policy.status} to ${parsed.data.status}`);
    }
    const [updated] = await db.update(policiesTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(and(eq(policiesTable.id, req.params.id), eq(policiesTable.workspaceId, workspaceId)))
      .returning();
    await createAuditLog({ workspaceId, entityType: "POLICY", entityId: policy.id, action: "POLICY_STATUS_CHANGED", payloadJson: { from: policy.status, to: updated.status } });
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
