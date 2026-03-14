import { Router } from "express";
import { db, agentsTable, accountsTable, cardsTable, policiesTable, transactionsTable, approvalRequestsTable, auditLogsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { sendSuccess } from "../lib/response.js";

const router = Router();

router.get("/overview", async (_req, res, next) => {
  try {
    const [
      totalAgents,
      activeAgents,
      totalAccounts,
      activeAccounts,
      totalCards,
      activeCards,
      totalPolicies,
      activePolicies,
      totalTransactions,
      pendingApprovals,
    ] = await Promise.all([
      db.select({ count: count() }).from(agentsTable).then(r => r[0].count),
      db.select({ count: count() }).from(agentsTable).where(eq(agentsTable.status, "active")).then(r => r[0].count),
      db.select({ count: count() }).from(accountsTable).then(r => r[0].count),
      db.select({ count: count() }).from(accountsTable).where(eq(accountsTable.status, "active")).then(r => r[0].count),
      db.select({ count: count() }).from(cardsTable).then(r => r[0].count),
      db.select({ count: count() }).from(cardsTable).where(eq(cardsTable.status, "active")).then(r => r[0].count),
      db.select({ count: count() }).from(policiesTable).then(r => r[0].count),
      db.select({ count: count() }).from(policiesTable).where(eq(policiesTable.status, "active")).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(eq(approvalRequestsTable.status, "PENDING")).then(r => r[0].count),
    ]);
    return sendSuccess(res, {
      totalAgents, activeAgents,
      totalAccounts, activeAccounts,
      totalCards, activeCards,
      totalPolicies, activePolicies,
      totalTransactions, pendingApprovals,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/transactions/summary", async (_req, res, next) => {
  try {
    const [totalTransactions, approvedTransactions, declinedTransactions, pendingTransactions, reviewPendingTransactions] = await Promise.all([
      db.select({ count: count() }).from(transactionsTable).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(eq(transactionsTable.status, "approved")).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(eq(transactionsTable.status, "declined")).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(eq(transactionsTable.status, "pending")).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(eq(transactionsTable.approvalStatus, "PENDING")).then(r => r[0].count),
    ]);
    return sendSuccess(res, { totalTransactions, approvedTransactions, declinedTransactions, pendingTransactions, reviewPendingTransactions });
  } catch (err) {
    next(err);
  }
});

router.get("/approvals/summary", async (_req, res, next) => {
  try {
    const [total, pending, approved, declined] = await Promise.all([
      db.select({ count: count() }).from(approvalRequestsTable).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(eq(approvalRequestsTable.status, "PENDING")).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(eq(approvalRequestsTable.status, "APPROVED")).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(eq(approvalRequestsTable.status, "DECLINED")).then(r => r[0].count),
    ]);
    return sendSuccess(res, { totalApprovalRequests: total, pendingApprovalRequests: pending, approvedApprovalRequests: approved, declinedApprovalRequests: declined });
  } catch (err) {
    next(err);
  }
});

router.get("/agents/activity", async (_req, res, next) => {
  try {
    const agents = await db.select().from(agentsTable).orderBy(agentsTable.name);
    const activity = await Promise.all(agents.map(async (agent) => {
      const [accountCount, cardCount, transactionCount] = await Promise.all([
        db.select({ count: count() }).from(accountsTable).where(eq(accountsTable.agentId, agent.id)).then(r => r[0].count),
        db.select({ count: count() }).from(cardsTable).where(eq(cardsTable.agentId, agent.id)).then(r => r[0].count),
        db.select({ count: count() }).from(transactionsTable).where(eq(transactionsTable.agentId, agent.id)).then(r => r[0].count),
      ]);
      return { agentId: agent.id, agentName: agent.name, status: agent.status, accountCount, cardCount, transactionCount };
    }));
    return sendSuccess(res, activity);
  } catch (err) {
    next(err);
  }
});

router.get("/recent-activity", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const logs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limit);
    return sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
});

export default router;
