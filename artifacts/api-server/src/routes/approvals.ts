import { Router } from "express";
import { db, approvalRequestsTable, transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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
    const { status } = req.query;
    let approvals;
    if (status && typeof status === "string") {
      approvals = await db.select().from(approvalRequestsTable).where(eq(approvalRequestsTable.status, status as any)).orderBy(desc(approvalRequestsTable.createdAt));
    } else {
      approvals = await db.select().from(approvalRequestsTable).orderBy(desc(approvalRequestsTable.createdAt));
    }
    return sendSuccess(res, approvals);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [approval] = await db.select().from(approvalRequestsTable).where(eq(approvalRequestsTable.id, req.params.id));
    if (!approval) throw new NotFoundError(`Approval request ${req.params.id} not found`);
    return sendSuccess(res, approval);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/approve", async (req, res, next) => {
  try {
    const [approval] = await db.select().from(approvalRequestsTable).where(eq(approvalRequestsTable.id, req.params.id));
    if (!approval) throw new NotFoundError(`Approval request ${req.params.id} not found`);
    if (approval.status !== "PENDING") throw new BadRequestError(`Approval request is already ${approval.status}`);

    const [transaction] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, approval.transactionId));
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
    }).where(eq(approvalRequestsTable.id, req.params.id)).returning();

    const [updatedTransaction] = await db.update(transactionsTable).set({
      status: "approved",
      approvalStatus: "APPROVED",
      processedAt: now,
      updatedAt: now,
    }).where(eq(transactionsTable.id, approval.transactionId)).returning();

    await createAuditLog({ entityType: "APPROVAL", entityId: approval.id, action: "APPROVAL_APPROVED", payloadJson: { transactionId: approval.transactionId } });
    await createAuditLog({ entityType: "TRANSACTION", entityId: approval.transactionId, action: "TRANSACTION_APPROVED", payloadJson: {} });

    return sendSuccess(res, { approval: updatedApproval, transaction: updatedTransaction });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/decline", async (req, res, next) => {
  try {
    const [approval] = await db.select().from(approvalRequestsTable).where(eq(approvalRequestsTable.id, req.params.id));
    if (!approval) throw new NotFoundError(`Approval request ${req.params.id} not found`);
    if (approval.status !== "PENDING") throw new BadRequestError(`Approval request is already ${approval.status}`);

    const [transaction] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, approval.transactionId));
    if (!transaction) throw new NotFoundError(`Transaction ${approval.transactionId} not found`);
    if (transaction.approvalStatus !== "PENDING") throw new BadRequestError("Transaction is not pending approval");

    const parsed = decisionSchema.safeParse(req.body);
    const now = new Date();

    const [updatedApproval] = await db.update(approvalRequestsTable).set({
      status: "DECLINED",
      reviewerId: parsed.data?.reviewerId ?? null,
      reviewedAt: now,
      decisionReason: parsed.data?.decisionReason ?? null,
      updatedAt: now,
    }).where(eq(approvalRequestsTable.id, req.params.id)).returning();

    const reason = parsed.data?.decisionReason ?? "Declined by reviewer";
    const [updatedTransaction] = await db.update(transactionsTable).set({
      status: "declined",
      approvalStatus: "DECLINED",
      declinedReason: reason,
      processedAt: now,
      updatedAt: now,
    }).where(eq(transactionsTable.id, approval.transactionId)).returning();

    await createAuditLog({ entityType: "APPROVAL", entityId: approval.id, action: "APPROVAL_DECLINED", payloadJson: { transactionId: approval.transactionId, reason } });
    await createAuditLog({ entityType: "TRANSACTION", entityId: approval.transactionId, action: "TRANSACTION_DECLINED", payloadJson: { reason } });

    return sendSuccess(res, { approval: updatedApproval, transaction: updatedTransaction });
  } catch (err) {
    next(err);
  }
});

export default router;
