import { Router } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { sendSuccess } from "../lib/response.js";
import { NotFoundError } from "../lib/errors.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const { entityType, entityId, action, limit } = req.query;
    let results = await db.select().from(auditLogsTable)
      .where(eq(auditLogsTable.workspaceId, workspaceId))
      .orderBy(desc(auditLogsTable.createdAt));
    if (entityType) results = results.filter(r => r.entityType === entityType);
    if (entityId) results = results.filter(r => r.entityId === entityId);
    if (action) results = results.filter(r => r.action === action);
    return sendSuccess(res, results.slice(0, Number(limit) || 100));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [log] = await db.select().from(auditLogsTable)
      .where(and(eq(auditLogsTable.id, req.params.id), eq(auditLogsTable.workspaceId, workspaceId)));
    if (!log) throw new NotFoundError(`Audit log ${req.params.id} not found`);
    return sendSuccess(res, log);
  } catch (err) {
    next(err);
  }
});

router.get("/entities/:entityType/:entityId", async (req, res, next) => {
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
