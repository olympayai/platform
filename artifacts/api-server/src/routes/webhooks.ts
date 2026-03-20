import { Router } from "express";
import { db, webhooksTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError } from "../lib/errors.js";
import crypto from "crypto";

const router = Router();

function generateSecret(): string {
  return "whsec_" + crypto.randomBytes(24).toString("hex");
}

const createSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  description: z.string().max(200).optional(),
  events: z.array(z.enum([
    "transaction.completed",
    "transaction.denied",
    "transaction.review",
    "approval.approved",
    "approval.rejected",
    "*",
  ])).min(1).default(["transaction.completed", "transaction.denied", "transaction.review"]),
});

router.get("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const hooks = await db.select().from(webhooksTable)
      .where(eq(webhooksTable.workspaceId, workspaceId))
      .orderBy(desc(webhooksTable.createdAt));
    const masked = hooks.map(h => ({ ...h, secret: h.secret.slice(0, 12) + "..." }));
    return sendSuccess(res, masked);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const secret = generateSecret();
    const [hook] = await db.insert(webhooksTable).values({
      workspaceId,
      url: parsed.data.url,
      description: parsed.data.description ?? null,
      events: parsed.data.events,
      secret,
      isActive: true,
    }).returning();
    return sendSuccess(res, { ...hook }, 201);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [hook] = await db.select().from(webhooksTable)
      .where(and(eq(webhooksTable.id, req.params.id), eq(webhooksTable.workspaceId, workspaceId)));
    if (!hook) throw new NotFoundError(`Webhook ${req.params.id} not found`);
    const isActive = req.body.isActive;
    if (typeof isActive !== "boolean") {
      return sendError(res, "VALIDATION_ERROR", "isActive must be a boolean", 400);
    }
    const [updated] = await db.update(webhooksTable)
      .set({ isActive })
      .where(eq(webhooksTable.id, req.params.id))
      .returning();
    return sendSuccess(res, { ...updated, secret: updated.secret.slice(0, 12) + "..." });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [hook] = await db.select().from(webhooksTable)
      .where(and(eq(webhooksTable.id, req.params.id), eq(webhooksTable.workspaceId, workspaceId)));
    if (!hook) throw new NotFoundError(`Webhook ${req.params.id} not found`);
    await db.delete(webhooksTable).where(eq(webhooksTable.id, req.params.id));
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
