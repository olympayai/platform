import { Router } from "express";
import { db, approvalRequestsTable, transactionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";
import { createAuditLog } from "../lib/auditLogger.js";

const router = Router();

const decisionSchema = z.object({
  reviewerId: z.string().optional(),
  decisionReason: z.string().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const { status } = req.query;
    const conditions = [eq(approvalRequestsTable.workspaceId, workspaceId)];
    if (status && typeof status === "string") {
      conditions.push(eq(approvalRequestsTable.status, status as any));
    }
    const approvals = await db.select().from(approvalRequestsTable)
      .where(and(...conditions))
      .orderBy(desc(approvalRequestsTable.createdAt));
    return sendSuccess(res, approvals);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [approval] = await db.select().from(approvalRequestsTable)
      .where(and(eq(approvalRequestsTable.id, req.params.id), eq(approvalRequestsTable.workspaceId, workspaceId)));
    if (!approval) throw new NotFoundError(`Approval request ${req.params.id} not found`);
    return sendSuccess(res, approval);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/approve", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [approval] = await db.select().from(approvalRequestsTable)
      .where(and(eq(approvalRequestsTable.id, req.params.id), eq(approvalRequestsTable.workspaceId, workspaceId)));
    if (!approval) throw new NotFoundError(`Approval request ${req.params.id} not found`);
    if (approval.status !== "PENDING") throw new BadRequestError(`Approval request is already ${approval.status}`);

    const [transaction] = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.id, approval.transactionId), eq(transactionsTable.workspaceId, workspaceId)));
    if (!transaction) throw new NotFoundError(`Transaction ${approval.transactionId} not found`);
    if (transaction.approvalStatus !== "PENDING") throw new BadRequestError("Transaction is not pending approval");

    const parsed = decisionSchema.safeParse(req.body);
    const now = new Date();

    const [updatedApproval] = await db.update(approvalRequestsTable).set({
      status: "APPROVED",
      reviewerId: parsed.data?.reviewerId ?? null,
      reviewedAt: now,
      decisionReason: parsed.data?.decisionReason ?? null,
      updatedAt: now,
    }).where(and(eq(approvalRequestsTable.id, req.params.id), eq(approvalRequestsTable.workspaceId, workspaceId))).returning();

    const [updatedTransaction] = await db.update(transactionsTable).set({
      status: "approved",
      approvalStatus: "APPROVED",
      processedAt: now,
      updatedAt: now,
    }).where(and(eq(transactionsTable.id, approval.transactionId), eq(transactionsTable.workspaceId, workspaceId))).returning();

    await createAuditLog({ workspaceId, entityType: "APPROVAL", entityId: approval.id, action: "APPROVAL_APPROVED", payloadJson: { transactionId: approval.transactionId } });
    await createAuditLog({ workspaceId, entityType: "TRANSACTION", entityId: approval.transactionId, action: "TRANSACTION_APPROVED", payloadJson: {} });

    return sendSuccess(res, { approval: updatedApproval, transaction: updatedTransaction });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/decline", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [approval] = await db.select().from(approvalRequestsTable)
      .where(and(eq(approvalRequestsTable.id, req.params.id), eq(approvalRequestsTable.workspaceId, workspaceId)));
    if (!approval) throw new NotFoundError(`Approval request ${req.params.id} not found`);
    if (approval.status !== "PENDING") throw new BadRequestError(`Approval request is already ${approval.status}`);

    const [transaction] = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.id, approval.transactionId), eq(transactionsTable.workspaceId, workspaceId)));
    if (!transaction) throw new NotFoundError(`Transaction ${approval.transactionId} not found`);

    const parsed = decisionSchema.safeParse(req.body);
    const now = new Date();

    const [updatedApproval] = await db.update(approvalRequestsTable).set({
      status: "DECLINED",
      reviewerId: parsed.data?.reviewerId ?? null,
      reviewedAt: now,
      decisionReason: parsed.data?.decisionReason ?? null,
      updatedAt: now,
    }).where(and(eq(approvalRequestsTable.id, req.params.id), eq(approvalRequestsTable.workspaceId, workspaceId))).returning();

    const [updatedTransaction] = await db.update(transactionsTable).set({
      status: "declined",
      approvalStatus: "DECLINED",
      processedAt: now,
      updatedAt: now,
    }).where(and(eq(transactionsTable.id, approval.transactionId), eq(transactionsTable.workspaceId, workspaceId))).returning();

    await createAuditLog({ workspaceId, entityType: "APPROVAL", entityId: approval.id, action: "APPROVAL_DECLINED", payloadJson: { transactionId: approval.transactionId } });
    await createAuditLog({ workspaceId, entityType: "TRANSACTION", entityId: approval.transactionId, action: "TRANSACTION_DECLINED", payloadJson: {} });

    return sendSuccess(res, { approval: updatedApproval, transaction: updatedTransaction });
  } catch (err) {
    next(err);
  }
});

export default router;
