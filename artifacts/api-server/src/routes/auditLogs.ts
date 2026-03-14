import { Router } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { sendSuccess } from "../lib/response.js";
import { NotFoundError } from "../lib/errors.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { entityType, entityId, action, limit } = req.query;
    let query = db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(Number(limit) || 100);

    let results = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt));

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
    const [log] = await db.select().from(auditLogsTable).where(eq(auditLogsTable.id, req.params.id));
    if (!log) throw new NotFoundError(`Audit log ${req.params.id} not found`);
    return sendSuccess(res, log);
  } catch (err) {
    next(err);
  }
});

router.get("/entities/:entityType/:entityId", async (req, res, next) => {
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
