import { Router } from "express";
import { db, agentsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";
import { createAuditLog } from "../lib/auditLogger.js";

const router = Router();

function generateAgentKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "olympay_agt_";
  for (let i = 0; i < 24; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  status: z.enum(["active", "inactive", "suspended", "pending"]).optional().default("pending"),
  description: z.string().optional(),
  externalRef: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
});

router.get("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const agents = await db.select().from(agentsTable)
      .where(eq(agentsTable.workspaceId, workspaceId))
      .orderBy(desc(agentsTable.createdAt));
    return sendSuccess(res, agents);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [agent] = await db.select().from(agentsTable)
      .where(and(eq(agentsTable.id, req.params.id), eq(agentsTable.workspaceId, workspaceId)));
    if (!agent) throw new NotFoundError(`Agent ${req.params.id} not found`);
    return sendSuccess(res, agent);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const parsed = createAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const apiKey = generateAgentKey();
    const [agent] = await db.insert(agentsTable).values({
      ...parsed.data,
      workspaceId,
      apiKey,
    }).returning();
    await createAuditLog({ workspaceId, entityType: "AGENT", entityId: agent.id, action: "AGENT_CREATED", payloadJson: { name: agent.name } });
    return sendSuccess(res, agent, 201);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const workspaceId = (req as any).workspaceId as string;
    const [agent] = await db.select().from(agentsTable)
      .where(and(eq(agentsTable.id, req.params.id), eq(agentsTable.workspaceId, workspaceId)));
    if (!agent) throw new NotFoundError(`Agent ${req.params.id} not found`);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [updated] = await db.update(agentsTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(and(eq(agentsTable.id, req.params.id), eq(agentsTable.workspaceId, workspaceId)))
      .returning();
    await createAuditLog({ workspaceId, entityType: "AGENT", entityId: agent.id, action: "AGENT_STATUS_CHANGED", payloadJson: { from: agent.status, to: updated.status } });
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
