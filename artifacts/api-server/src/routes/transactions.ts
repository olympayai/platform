import { Router } from "express";
import { db, agentsTable, accountsTable, cardsTable, transactionsTable, approvalRequestsTable, policiesTable, policyAssignmentsTable } from "@workspace/db";
import { eq, desc, and, or } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";
import { createAuditLog } from "../lib/auditLogger.js";

const router = Router();

const attemptSchema = z.object({
  agentId: z.string().min(1),
  accountId: z.string().min(1),
  cardId: z.string().optional(),
  merchantId: z.string().optional(),
  amountMinor: z.number().int().positive(),
  currency: z.string().default("USD"),
  direction: z.enum(["DEBIT", "CREDIT"]).default("DEBIT"),
});

type PolicyOutcome = "ALLOW" | "DENY" | "REVIEW";

function evaluatePolicy(policy: { type: string; configJson: unknown }, ctx: { amountMinor: number; merchantId?: string | null; now: Date }): PolicyOutcome {
  const config = policy.configJson as Record<string, unknown>;
  switch (policy.type) {
    case "SPEND_LIMIT": {
      const max = typeof config.maxAmountMinor === "number" ? config.maxAmountMinor : null;
      if (max !== null && ctx.amountMinor > max) return "DENY";
      return "ALLOW";
    }
    case "MERCHANT_ALLOWLIST": {
      const list = Array.isArray(config.merchantIds) ? (config.merchantIds as string[]) : [];
      if (!ctx.merchantId) return "DENY";
      return list.includes(ctx.merchantId) ? "ALLOW" : "DENY";
    }
    case "MERCHANT_BLOCKLIST": {
      const list = Array.isArray(config.merchantIds) ? (config.merchantIds as string[]) : [];
      if (ctx.merchantId && list.includes(ctx.merchantId)) return "DENY";
      return "ALLOW";
    }
    case "APPROVAL_REQUIRED":
      return "REVIEW";
    case "TIME_WINDOW": {
      const startHour = typeof config.startHour === "number" ? config.startHour : 0;
      const endHour = typeof config.endHour === "number" ? config.endHour : 24;
      const hour = ctx.now.getUTCHours();
      const inWindow = startHour <= endHour ? (hour >= startHour && hour < endHour) : (hour >= startHour || hour < endHour);
      if (!inWindow) return "DENY";
      return "ALLOW";
    }
    default:
      return "ALLOW";
  }
}

function resolveDecision(matched: { type: string; outcome: PolicyOutcome }[]): { result: "ALLOW" | "DENY" | "REVIEW"; reason: string } {
  if (matched.some(m => m.outcome === "DENY")) {
    const types = matched.filter(m => m.outcome === "DENY").map(m => m.type).join(", ");
    return { result: "DENY", reason: `Denied by policy: ${types}` };
  }
  if (matched.some(m => m.outcome === "REVIEW")) {
    const types = matched.filter(m => m.outcome === "REVIEW").map(m => m.type).join(", ");
    return { result: "REVIEW", reason: `Approval required: ${types}` };
  }
  return { result: "ALLOW", reason: "All policies allowed" };
}

router.get("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const txns = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.workspaceId, workspaceId))
      .orderBy(desc(transactionsTable.requestedAt))
      .limit(200);
    return sendSuccess(res, txns);
  } catch (err) {
    next(err);
  }
});

router.post("/attempt", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const parsed = attemptSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const input = parsed.data;

    const [agent] = await db.select().from(agentsTable)
      .where(and(eq(agentsTable.id, input.agentId), eq(agentsTable.workspaceId, workspaceId)));
    if (!agent) throw new NotFoundError(`Agent ${input.agentId} not found`);

    const [account] = await db.select().from(accountsTable)
      .where(and(eq(accountsTable.id, input.accountId), eq(accountsTable.workspaceId, workspaceId)));
    if (!account) throw new NotFoundError(`Account ${input.accountId} not found`);
    if (account.agentId !== input.agentId) throw new BadRequestError("Account does not belong to the provided agent");
    if (account.status !== "active") throw new BadRequestError("Account is not active");

    if (input.cardId) {
      const [card] = await db.select().from(cardsTable)
        .where(and(eq(cardsTable.id, input.cardId), eq(cardsTable.workspaceId, workspaceId)));
      if (!card) throw new NotFoundError(`Card ${input.cardId} not found`);
      if (card.accountId !== input.accountId) throw new BadRequestError("Card does not belong to the provided account");
      if (card.status !== "active") throw new BadRequestError("Card is not active");
      if (!card.spendingEnabled) throw new BadRequestError("Card spending is disabled");
    }

    const assignments = await db.select({
      policyId: policyAssignmentsTable.policyId,
    }).from(policyAssignmentsTable).where(
      or(
        and(eq(policyAssignmentsTable.targetType, "AGENT"), eq(policyAssignmentsTable.targetId, input.agentId)),
        and(eq(policyAssignmentsTable.targetType, "ACCOUNT"), eq(policyAssignmentsTable.targetId, input.accountId)),
        ...(input.cardId ? [and(eq(policyAssignmentsTable.targetType, "CARD"), eq(policyAssignmentsTable.targetId, input.cardId!))] : [])
      )
    );

    const matchedPolicies: { policyId: string; policyType: string; outcome: PolicyOutcome }[] = [];
    if (assignments.length > 0) {
      const policyIds = assignments.map(a => a.policyId);
      const allPolicies = await Promise.all(
        policyIds.map(pid => db.select().from(policiesTable)
          .where(and(eq(policiesTable.id, pid), eq(policiesTable.workspaceId, workspaceId)))
          .then(r => r[0]))
      );
      const ctx = { amountMinor: input.amountMinor, merchantId: input.merchantId ?? null, now: new Date() };
      for (const policy of allPolicies.filter(Boolean)) {
        if (policy.status !== "active") continue;
        const outcome = evaluatePolicy({ type: policy.type, configJson: policy.configJson }, ctx);
        matchedPolicies.push({ policyId: policy.id, policyType: policy.type, outcome });
      }
    }

    const { result: decisionResult, reason: decisionReason } = resolveDecision(matchedPolicies.map(m => ({ type: m.policyType, outcome: m.outcome })));

    let status: string;
    let approvalStatus: string;
    let declinedReason: string | null = null;
    const processedAt = new Date();

    if (decisionResult === "ALLOW") {
      status = "approved";
      approvalStatus = "NOT_REQUIRED";
    } else if (decisionResult === "DENY") {
      status = "declined";
      approvalStatus = "NOT_REQUIRED";
      declinedReason = decisionReason;
    } else {
      status = "pending";
      approvalStatus = "PENDING";
    }

    const [transaction] = await db.insert(transactionsTable).values({
      workspaceId,
      agentId: input.agentId,
      accountId: input.accountId,
      cardId: input.cardId ?? null,
      merchantId: input.merchantId ?? null,
      direction: input.direction,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: status as any,
      decision: decisionResult as any,
      approvalStatus: approvalStatus as any,
      declinedReason,
      processedAt: decisionResult !== "REVIEW" ? processedAt : null,
    }).returning();

    await createAuditLog({ workspaceId, entityType: "TRANSACTION", entityId: transaction.id, action: "TRANSACTION_ATTEMPTED", payloadJson: { agentId: input.agentId, amountMinor: input.amountMinor, decision: decisionResult } });

    let approvalRequest = null;
    if (decisionResult === "REVIEW") {
      const [approval] = await db.insert(approvalRequestsTable).values({
        workspaceId,
        transactionId: transaction.id,
        requestedByType: "SYSTEM",
        requestedReason: decisionReason,
      }).returning();
      await createAuditLog({ workspaceId, entityType: "APPROVAL", entityId: approval.id, action: "APPROVAL_REQUESTED", payloadJson: { transactionId: transaction.id } });
      approvalRequest = approval;
    }

    return sendSuccess(res, {
      transaction,
      decision: {
        result: decisionResult,
        reason: decisionReason,
        matchedPolicies: matchedPolicies.map(m => ({ policyId: m.policyId, policyType: m.policyType, outcome: m.outcome })),
      },
      approvalRequest,
      protocol: {
        name: "Olympay Payment Protocol",
        version: "v1",
        evaluatedAt: new Date().toISOString(),
        policyCount: matchedPolicies.length,
        specUrl: "https://olympay.tech/protocol/v1",
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [txn] = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.id, req.params.id), eq(transactionsTable.workspaceId, workspaceId)));
    if (!txn) throw new NotFoundError(`Transaction ${req.params.id} not found`);
    return sendSuccess(res, txn);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/approval", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [approval] = await db.select().from(approvalRequestsTable)
      .where(and(
        eq(approvalRequestsTable.transactionId, req.params.id),
        eq(approvalRequestsTable.workspaceId, workspaceId)
      ));
    if (!approval) throw new NotFoundError(`No approval request found for transaction ${req.params.id}`);
    return sendSuccess(res, approval);
  } catch (err) {
    next(err);
  }
});

export default router;
