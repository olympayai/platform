import { Router } from "express";
import { db, agentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";
import { createAuditLog } from "../lib/auditLogger.js";

const router = Router();

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  status: z.enum(["active", "inactive", "suspended", "pending"]).optional().default("pending"),
  description: z.string().optional(),
  externalRef: z.string().optional(),
});

router.get("/", async (_req, res, next) => {
  try {
    const agents = await db.select().from(agentsTable).orderBy(desc(agentsTable.createdAt));
    return sendSuccess(res, agents);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, req.params.id));
    if (!agent) throw new NotFoundError(`Agent ${req.params.id} not found`);
    return sendSuccess(res, agent);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [agent] = await db.insert(agentsTable).values(parsed.data).returning();
    await createAuditLog({ entityType: "AGENT", entityId: agent.id, action: "AGENT_CREATED", payloadJson: { name: agent.name } });
    return sendSuccess(res, agent, 201);
  } catch (err) {
    next(err);
  }
});

export default router;
