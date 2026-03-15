import { Router } from "express";
import { db, agentsTable, accountsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";
import { createAuditLog } from "../lib/auditLogger.js";

const router = Router();

const VALID_TRANSITIONS: Record<string, string[]> = {
  active: ["frozen", "closed"],
  frozen: ["active"],
  closed: [],
};

const createAccountSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1),
  currency: z.string().default("USD"),
  accountRef: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "frozen", "closed"]),
});

router.get("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const accounts = await db.select().from(accountsTable)
      .where(eq(accountsTable.workspaceId, workspaceId))
      .orderBy(desc(accountsTable.createdAt));
    return sendSuccess(res, accounts);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [agent] = await db.select().from(agentsTable)
      .where(and(eq(agentsTable.id, parsed.data.agentId), eq(agentsTable.workspaceId, workspaceId)));
    if (!agent) throw new NotFoundError(`Agent ${parsed.data.agentId} not found`);
    const [account] = await db.insert(accountsTable).values({ ...parsed.data, workspaceId }).returning();
    await createAuditLog({ workspaceId, entityType: "ACCOUNT", entityId: account.id, action: "ACCOUNT_CREATED", payloadJson: { agentId: account.agentId } });
    return sendSuccess(res, account, 201);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [account] = await db.select().from(accountsTable)
      .where(and(eq(accountsTable.id, req.params.id), eq(accountsTable.workspaceId, workspaceId)));
    if (!account) throw new NotFoundError(`Account ${req.params.id} not found`);
    return sendSuccess(res, account);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [account] = await db.select().from(accountsTable)
      .where(and(eq(accountsTable.id, req.params.id), eq(accountsTable.workspaceId, workspaceId)));
    if (!account) throw new NotFoundError(`Account ${req.params.id} not found`);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const allowed = VALID_TRANSITIONS[account.status] ?? [];
    if (!allowed.includes(parsed.data.status)) {
      throw new BadRequestError(`Invalid status transition from ${account.status} to ${parsed.data.status}. Allowed: ${allowed.join(", ") || "none"}`);
    }
    const [updated] = await db.update(accountsTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(and(eq(accountsTable.id, req.params.id), eq(accountsTable.workspaceId, workspaceId)))
      .returning();
    await createAuditLog({ workspaceId, entityType: "ACCOUNT", entityId: account.id, action: "ACCOUNT_STATUS_CHANGED", payloadJson: { from: account.status, to: updated.status } });
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
