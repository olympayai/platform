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
import { db, agentsTable, accountsTable, cardsTable, transactionsTable, policiesTable, policyAssignmentsTable, auditLogsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";

const router: IRouter = Router();

router.use(healthRouter);

router.use("/v1/agents", agentsRouter);
router.use("/v1/accounts", accountsRouter);
router.use("/v1/cards", cardsRouter);
router.use("/v1/policies", policiesRouter);
router.use("/v1/transactions", transactionsRouter);
router.use("/v1/approvals", approvalsRouter);
router.use("/v1/audit-logs", auditLogsRouter);
router.use("/v1/monitoring", monitoringRouter);

const createAssignmentSchema = z.object({
  policyId: z.string().min(1),
  targetType: z.enum(["AGENT", "ACCOUNT", "CARD"]),
  targetId: z.string().min(1),
  priority: z.number().int().optional().default(100),
});

router.get("/v1/policy-assignments", async (_req, res, next) => {
  try {
    const assignments = await db.select().from(policyAssignmentsTable).orderBy(desc(policyAssignmentsTable.createdAt));
    return sendSuccess(res, assignments);
  } catch (err) {
    next(err);
  }
});

router.post("/v1/policy-assignments", async (req, res, next) => {
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
    return sendSuccess(res, assignment, 201);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/agents/:agentId/accounts", async (req, res, next) => {
  try {
    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, req.params.agentId));
    if (!agent) throw new NotFoundError(`Agent ${req.params.agentId} not found`);
    const accounts = await db.select().from(accountsTable).where(eq(accountsTable.agentId, req.params.agentId)).orderBy(desc(accountsTable.createdAt));
    return sendSuccess(res, accounts);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/agents/:agentId/transactions", async (req, res, next) => {
  try {
    const txns = await db.select().from(transactionsTable).where(eq(transactionsTable.agentId, req.params.agentId)).orderBy(desc(transactionsTable.requestedAt));
    return sendSuccess(res, txns);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/agents/:agentId/policies", async (req, res, next) => {
  try {
    const assignments = await db.select().from(policyAssignmentsTable).where(
      and(eq(policyAssignmentsTable.targetType, "AGENT"), eq(policyAssignmentsTable.targetId, req.params.agentId))
    );
    const policyIds = assignments.map(a => a.policyId);
    if (policyIds.length === 0) return sendSuccess(res, []);
    const policies = await Promise.all(policyIds.map(id => db.select().from(policiesTable).where(eq(policiesTable.id, id)).then(r => r[0])));
    return sendSuccess(res, policies.filter(Boolean));
  } catch (err) {
    next(err);
  }
});

router.get("/v1/accounts/:accountId/transactions", async (req, res, next) => {
  try {
    const txns = await db.select().from(transactionsTable).where(eq(transactionsTable.accountId, req.params.accountId)).orderBy(desc(transactionsTable.requestedAt));
    return sendSuccess(res, txns);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/accounts/:accountId/cards", async (req, res, next) => {
  try {
    const cards = await db.select().from(cardsTable).where(eq(cardsTable.accountId, req.params.accountId)).orderBy(desc(cardsTable.createdAt));
    return sendSuccess(res, cards);
  } catch (err) {
    next(err);
  }
});

router.get("/v1/accounts/:accountId/policies", async (req, res, next) => {
  try {
    const assignments = await db.select().from(policyAssignmentsTable).where(
      and(eq(policyAssignmentsTable.targetType, "ACCOUNT"), eq(policyAssignmentsTable.targetId, req.params.accountId))
    );
    const policyIds = assignments.map(a => a.policyId);
    if (policyIds.length === 0) return sendSuccess(res, []);
    const policies = await Promise.all(policyIds.map(id => db.select().from(policiesTable).where(eq(policiesTable.id, id)).then(r => r[0])));
    return sendSuccess(res, policies.filter(Boolean));
  } catch (err) {
    next(err);
  }
});

router.get("/v1/cards/:cardId/policies", async (req, res, next) => {
  try {
    const assignments = await db.select().from(policyAssignmentsTable).where(
      and(eq(policyAssignmentsTable.targetType, "CARD"), eq(policyAssignmentsTable.targetId, req.params.cardId))
    );
    const policyIds = assignments.map(a => a.policyId);
    if (policyIds.length === 0) return sendSuccess(res, []);
    const policies = await Promise.all(policyIds.map(id => db.select().from(policiesTable).where(eq(policiesTable.id, id)).then(r => r[0])));
    return sendSuccess(res, policies.filter(Boolean));
  } catch (err) {
    next(err);
  }
});

router.get("/v1/entities/:entityType/:entityId/audit-logs", async (req, res, next) => {
  try {
    const logs = await db.select().from(auditLogsTable)
      .where(eq(auditLogsTable.entityType, req.params.entityType))
      .orderBy(desc(auditLogsTable.createdAt));
    const filtered = logs.filter(l => l.entityId === req.params.entityId);
    return sendSuccess(res, filtered.slice(0, 100));
  } catch (err) {
    next(err);
  }
});

export default router;
