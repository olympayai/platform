import { Router } from "express";
import { db, agentsTable, accountsTable, cardsTable, policiesTable, transactionsTable, approvalRequestsTable, auditLogsTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import { sendSuccess } from "../lib/response.js";

const router = Router();

router.get("/overview", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const ws = (table: any) => eq(table.workspaceId, workspaceId);
    const [
      totalAgents, activeAgents,
      totalAccounts, activeAccounts,
      totalCards, activeCards,
      totalPolicies, activePolicies,
      totalTransactions, pendingApprovals,
    ] = await Promise.all([
      db.select({ count: count() }).from(agentsTable).where(ws(agentsTable)).then(r => r[0].count),
      db.select({ count: count() }).from(agentsTable).where(and(ws(agentsTable), eq(agentsTable.status, "active"))).then(r => r[0].count),
      db.select({ count: count() }).from(accountsTable).where(ws(accountsTable)).then(r => r[0].count),
      db.select({ count: count() }).from(accountsTable).where(and(ws(accountsTable), eq(accountsTable.status, "active"))).then(r => r[0].count),
      db.select({ count: count() }).from(cardsTable).where(ws(cardsTable)).then(r => r[0].count),
      db.select({ count: count() }).from(cardsTable).where(and(ws(cardsTable), eq(cardsTable.status, "active"))).then(r => r[0].count),
      db.select({ count: count() }).from(policiesTable).where(ws(policiesTable)).then(r => r[0].count),
      db.select({ count: count() }).from(policiesTable).where(and(ws(policiesTable), eq(policiesTable.status, "active"))).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(ws(transactionsTable)).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(and(ws(approvalRequestsTable), eq(approvalRequestsTable.status, "PENDING"))).then(r => r[0].count),
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

router.get("/transactions/summary", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const ws = eq(transactionsTable.workspaceId, workspaceId);
    const [totalTransactions, approvedTransactions, declinedTransactions, pendingTransactions, reviewPendingTransactions] = await Promise.all([
      db.select({ count: count() }).from(transactionsTable).where(ws).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(and(ws, eq(transactionsTable.status, "approved"))).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(and(ws, eq(transactionsTable.status, "declined"))).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(and(ws, eq(transactionsTable.status, "pending"))).then(r => r[0].count),
      db.select({ count: count() }).from(transactionsTable).where(and(ws, eq(transactionsTable.approvalStatus, "PENDING"))).then(r => r[0].count),
    ]);
    return sendSuccess(res, { totalTransactions, approvedTransactions, declinedTransactions, pendingTransactions, reviewPendingTransactions });
  } catch (err) {
    next(err);
  }
});

router.get("/approvals/summary", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const ws = eq(approvalRequestsTable.workspaceId, workspaceId);
    const [total, pending, approved, declined] = await Promise.all([
      db.select({ count: count() }).from(approvalRequestsTable).where(ws).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(and(ws, eq(approvalRequestsTable.status, "PENDING"))).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(and(ws, eq(approvalRequestsTable.status, "APPROVED"))).then(r => r[0].count),
      db.select({ count: count() }).from(approvalRequestsTable).where(and(ws, eq(approvalRequestsTable.status, "DECLINED"))).then(r => r[0].count),
    ]);
    return sendSuccess(res, { totalApprovalRequests: total, pendingApprovalRequests: pending, approvedApprovalRequests: approved, declinedApprovalRequests: declined });
  } catch (err) {
    next(err);
  }
});

router.get("/agents/activity", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const agents = await db.select().from(agentsTable)
      .where(eq(agentsTable.workspaceId, workspaceId))
      .orderBy(agentsTable.name);
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
    const workspaceId = (req as any).workspaceId as string;
    const limit = Number(req.query.limit) || 20;
    const logs = await db.select().from(auditLogsTable)
      .where(eq(auditLogsTable.workspaceId, workspaceId))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    return sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
});

export default router;
