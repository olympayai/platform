import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import agentsRouter from "./agents.js";
import accountsRouter from "./accounts.js";
import cardsRouter from "./cards.js";
import policiesRouter from "./policies.js";
import transactionsRouter from "./transactions.js";
import approvalsRouter from "./approvals.js";
import auditLogsRouter from "./auditLogs.js";
import monitoringRouter from "./monitoring.js";
import webhooksRouter from "./webhooks.js";
import { requireAuth } from "../middleware/auth.js";
import { db, agentsTable, accountsTable, cardsTable, transactionsTable, policiesTable, policyAssignmentsTable, auditLogsTable, workspaceApiKeysTable } from "@workspace/db";
import { eq, desc, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";

const router: IRouter = Router();

router.use(healthRouter);

router.use("/v1", requireAuth);

router.use("/v1/agents", agentsRouter);
router.use("/v1/accounts", accountsRouter);
router.use("/v1/cards", cardsRouter);
router.use("/v1/policies", policiesRouter);
router.use("/v1/transactions", transactionsRouter);
router.use("/v1/approvals", approvalsRouter);
router.use("/v1/audit-logs", auditLogsRouter);
router.use("/v1/monitoring", monitoringRouter);
router.use("/v1/webhooks", webhooksRouter);

function generateWorkspaceKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "olympay_ws_";
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

const createKeySchema = z.object({
  name: z.string().min(1).max(100).optional().default("Default"),
});

router.get("/v1/workspace/keys", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const keys = await db.select().from(workspaceApiKeysTable)
      .where(and(eq(workspaceApiKeysTable.workspaceId, workspaceId), isNull(workspaceApiKeysTable.revokedAt)))
      .orderBy(desc(workspaceApiKeysTable.createdAt));
    const masked = keys.map(k => ({ ...k, key: k.key.slice(0, 18) + "..." + k.key.slice(-4) }));
    return sendSuccess(res, masked);
  } catch (err) {
    next(err);
  }
});

router.post("/v1/workspace/keys", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const parsed = createKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const key = generateWorkspaceKey();
    const [created] = await db.insert(workspaceApiKeysTable).values({
      workspaceId,
      key,
      name: parsed.data.name,
    }).returning();
    return sendSuccess(res, created, 201);
  } catch (err) {
    next(err);
  }
});

router.delete("/v1/workspace/keys/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [key] = await db.select().from(workspaceApiKeysTable)
      .where(and(eq(workspaceApiKeysTable.id, req.params.id), eq(workspaceApiKeysTable.workspaceId, workspaceId)));
    if (!key) throw new NotFoundError(`Key ${req.params.id} not found`);
    await db.update(workspaceApiKeysTable)
      .set({ revokedAt: new Date() })
      .where(eq(workspaceApiKeysTable.id, req.params.id));
    return sendSuccess(res, { revoked: true });
  } catch (err) {
    next(err);
  }
});

const createAssignmentSchema = z.object({
  policyId: z.string().min(1),
  targetType: z.enum(["AGENT", "ACCOUNT", "CARD"]),
  targetId: z.string().min(1),
  priority: z.number().int().optional().default(100),
});

router.get("/v1/policy-assignments", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const assignments = await db.select().from(policyAssignmentsTable)
      .orderBy(desc(policyAssignmentsTable.createdAt));
    const myPolicies = await db.select({ id: policiesTable.id }).from(policiesTable)
      .where(eq(policiesTable.workspaceId, workspaceId));
    const myPolicyIds = new Set(myPolicies.map(p => p.id));
    return sendSuccess(res, assignments.filter(a => myPolicyIds.has(a.policyId)));
  } catch (err) {
    next(err);
  }
});

router.post("/v1/policy-assignments", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const parsed = createAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [policy] = await db.select().from(policiesTable)
      .where(and(eq(policiesTable.id, parsed.data.policyId), eq(policiesTable.workspaceId, workspaceId)));
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
    return sendSuccess(res, assignment, 201);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/agents/:agentId/accounts", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [agent] = await db.select().from(agentsTable)
      .where(and(eq(agentsTable.id, req.params.agentId), eq(agentsTable.workspaceId, workspaceId)));
    if (!agent) throw new NotFoundError(`Agent ${req.params.agentId} not found`);
    const accounts = await db.select().from(accountsTable)
      .where(and(eq(accountsTable.agentId, req.params.agentId), eq(accountsTable.workspaceId, workspaceId)))
      .orderBy(desc(accountsTable.createdAt));
    return sendSuccess(res, accounts);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/agents/:agentId/transactions", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const txns = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.agentId, req.params.agentId), eq(transactionsTable.workspaceId, workspaceId)))
      .orderBy(desc(transactionsTable.requestedAt));
    return sendSuccess(res, txns);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/agents/:agentId/policies", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [agent] = await db.select().from(agentsTable)
      .where(and(eq(agentsTable.id, req.params.agentId), eq(agentsTable.workspaceId, workspaceId)));
    if (!agent) throw new NotFoundError(`Agent ${req.params.agentId} not found`);
    const assignments = await db.select().from(policyAssignmentsTable)
      .where(and(eq(policyAssignmentsTable.targetType, "AGENT"), eq(policyAssignmentsTable.targetId, req.params.agentId)));
    if (assignments.length === 0) return sendSuccess(res, []);
    const policies = await Promise.all(
      assignments.map(a => db.select().from(policiesTable)
        .where(and(eq(policiesTable.id, a.policyId), eq(policiesTable.workspaceId, workspaceId)))
        .then(r => r[0]))
    );
    return sendSuccess(res, policies.filter(Boolean));
  } catch (err) {
    next(err);
  }
});

router.get("/v1/accounts/:accountId/transactions", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const txns = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.accountId, req.params.accountId), eq(transactionsTable.workspaceId, workspaceId)))
      .orderBy(desc(transactionsTable.requestedAt));
    return sendSuccess(res, txns);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/accounts/:accountId/cards", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const cards = await db.select().from(cardsTable)
      .where(and(eq(cardsTable.accountId, req.params.accountId), eq(cardsTable.workspaceId, workspaceId)))
      .orderBy(desc(cardsTable.createdAt));
    return sendSuccess(res, cards);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/entities/:entityType/:entityId/audit-logs", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const logs = await db.select().from(auditLogsTable)
      .where(and(
        eq(auditLogsTable.workspaceId, workspaceId),
        eq(auditLogsTable.entityType, req.params.entityType),
        eq(auditLogsTable.entityId, req.params.entityId),
      ))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(100);
    return sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
});

export default router;
